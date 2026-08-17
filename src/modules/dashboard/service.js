const { Op } = require("sequelize");
const { Lembur, Cuti, Ijin, Sakit, Sppd, User, Pegawai, Petugas, Unit, UnitRole } = require("../../models");
const getWorkflowScope = require("../../utils/workflowScope");
const lemburRepository = require("../lembur/repository");
const cutiRepository = require("../cuti/repository");
const ijinRepository = require("../ijin/repository");
const sakitRepository = require("../sakit/repository");
const sppdRepository = require("../sppd/repository");

const UNIT_SCOPED_READ_ROLES = new Set(["CHECKER", "VERIFICATION", "APPROVAL_1", "APPROVAL_2", "APPROVAL_3", "MONITORING"]);

class DashboardService {
    async mapUnits(user) {
        const roleCode = String(user?.kode_role || "").toUpperCase();
        if (roleCode === "MAKER") return { units: [], scope_level: "NONE" };

        const isAdmin = user?.is_super_admin === "Y" || ["ADMIN", "SUPER_ADMIN"].includes(roleCode);
        const scope = isAdmin ? null : await getWorkflowScope(user);
        if (!isAdmin && !scope?.unitIds?.length) return { units: [], scope_level: "NONE" };

        const units = await Unit.findAll({
            where: { is_active: "Y" },
            attributes: ["id_unit", "id_induk_unit", "nama_unit", "lat", "lon"],
            raw: true,
        });
        const unitById = new Map(units.map((unit) => [Number(unit.id_unit), unit]));
        const allowedIds = scope ? new Set(scope.unitIds.map(Number)) : null;
        const giUnits = units.filter((unit) =>
            /^GI\s/i.test(unit.nama_unit) && unit.lat != null && unit.lon != null &&
            (!allowedIds || allowedIds.has(Number(unit.id_unit)))
        );
        if (!giUnits.length) return { units: [], scope_level: "NONE" };

        const petugasRows = await Petugas.findAll({
            where: { id_unit: { [Op.in]: giUnits.map((unit) => unit.id_unit) }, is_active: "Y" },
            attributes: ["id_unit"],
            raw: true,
        });
        const petugasCount = petugasRows.reduce((counts, row) => {
            const id = Number(row.id_unit);
            counts.set(id, (counts.get(id) || 0) + 1);
            return counts;
        }, new Map());

        const hierarchy = (unit) => {
            const chain = [];
            let current = unit;
            while (current) {
                chain.unshift(current);
                current = current.id_induk_unit ? unitById.get(Number(current.id_induk_unit)) : null;
            }
            return chain;
        };

        const result = giUnits.map((gi) => {
            const chain = hierarchy(gi);
            const upt = chain.find((unit) => /^UPT\s/i.test(unit.nama_unit));
            const ultg = chain.find((unit) => /^ULTG\s/i.test(unit.nama_unit));
            return {
                id_unit: gi.id_unit,
                nama_gi: gi.nama_unit,
                lat: Number(gi.lat),
                lon: Number(gi.lon),
                jumlah_petugas: petugasCount.get(Number(gi.id_unit)) || 0,
                upt: upt ? { id_unit: upt.id_unit, nama_unit: upt.nama_unit } : null,
                ultg: ultg ? { id_unit: ultg.id_unit, nama_unit: ultg.nama_unit } : null,
            };
        }).sort((a, b) => a.nama_gi.localeCompare(b.nama_gi, "id"));

        let scopeLevel = "UPT";
        if (!isAdmin) {
            const assignments = await UnitRole.findAll({
                where: { id_user: user.id_user, id_role: user.id_role, is_active: "Y", scope_type: "SELF_AND_DESCENDANTS" },
                attributes: ["id_unit"], raw: true,
            });
            const rootKinds = assignments.map((row) => {
                const name = unitById.get(Number(row.id_unit))?.nama_unit || "";
                if (/^GI\s/i.test(name)) return "GI";
                if (/^ULTG\s/i.test(name)) return "ULTG";
                return "UPT";
            });
            if (rootKinds.length && rootKinds.every((kind) => kind === "GI")) scopeLevel = "GI";
            else if (rootKinds.length && rootKinds.every((kind) => ["GI", "ULTG"].includes(kind))) scopeLevel = "ULTG";
        }
        return { units: result, scope_level: scopeLevel };
    }

    async getIdentityScope(user) {
        const roleCode = String(user?.kode_role || "").toUpperCase();
        if (user?.is_super_admin === "Y" || roleCode === "ADMIN" || roleCode === "SUPER_ADMIN") return {};

        if (UNIT_SCOPED_READ_ROLES.has(roleCode)) {
            const scope = await getWorkflowScope(user);
            if (!scope?.unitIds?.length) return null;
            return { "$petugas.id_unit$": { [Op.in]: scope.unitIds } };
        }

        if (roleCode === "MAKER") {
            if (user.id_petugas) return { id_petugas: user.id_petugas };
            const account = await User.findByPk(user.id_user, {
                include: [{ model: Pegawai, as: "pegawai", required: false, attributes: ["nip"] }],
            });
            const nip = account?.pegawai?.nip;
            return nip ? { "$petugas.nip$": nip } : null;
        }

        return null;
    }

    buildDateWhere(field, query) {
        if (query.start_date && query.end_date) {
            return { [field]: { [Op.between]: [query.start_date, query.end_date] } };
        }
        if (query.start_date) return { [field]: { [Op.gte]: query.start_date } };
        if (query.end_date) return { [field]: { [Op.lte]: query.end_date } };
        return {};
    }

    async findTransactions(model, repository, scopeWhere, dateWhere, order) {
        if (!scopeWhere) return [];
        const includes = repository.getInclude();
        const petugasInclude = includes.find((include) => include.as === "petugas");
        const unitInclude = petugasInclude.include?.find((include) => include.as === "unit");
        if (unitInclude) {
            unitInclude.include = [{
                model: Unit,
                as: "indukUnit",
                required: false,
                include: [{
                    model: Unit,
                    as: "indukUnit",
                    required: false,
                }],
            }];
        }
        return model.findAll({
            where: { ...scopeWhere, ...dateWhere },
            include: includes,
            order,
            subQuery: false,
        });
    }

    async analytics(user, query = {}) {
        const identityScope = await this.getIdentityScope(user);
        const scopeWhere = identityScope && query.id_project
            ? { ...identityScope, id_project: Number(query.id_project) }
            : identityScope;
        const [lembur, cuti, ijin, sakit, sppd] = await Promise.all([
            this.findTransactions(Lembur, lemburRepository, scopeWhere, this.buildDateWhere("tgl_lembur", query), [["tgl_lembur", "DESC"], ["id_lembur", "DESC"]]),
            this.findTransactions(Cuti, cutiRepository, scopeWhere, this.buildDateWhere("tgl_mulai", query), [["tgl_mulai", "DESC"], ["id_cuti", "DESC"]]),
            this.findTransactions(Ijin, ijinRepository, scopeWhere, this.buildDateWhere("tanggal", query), [["tanggal", "DESC"], ["id_ijin", "DESC"]]),
            this.findTransactions(Sakit, sakitRepository, scopeWhere, this.buildDateWhere("tanggal", query), [["tanggal", "DESC"], ["id_sakit", "DESC"]]),
            this.findTransactions(Sppd, sppdRepository, scopeWhere, this.buildDateWhere("tgl_berangkat", query), [["tgl_berangkat", "DESC"], ["id_sppd", "DESC"]]),
        ]);
        return { lembur, cuti, ijin, sakit, sppd };
    }

    async completedDocuments(user, query = {}) {
        const grouped = await this.analytics(user, query);
        return Object.entries(grouped)
            .flatMap(([type, rows]) => rows
                .filter((row) => {
                    const status = row.status || {};
                    const code = String(status.kode_status || "").toUpperCase();
                    return status.is_final === "Y" &&
                        !["REJECT", "TOLAK", "CANCEL", "BATAL"].some((word) => code.includes(word));
                })
                .map((row) => ({ ...row.toJSON(), report_type: type })))
            .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
    }
}

module.exports = new DashboardService();

const { Op } = require("sequelize");
const { Lembur, Cuti, Ijin, Sakit, Sppd, User, Pegawai, Unit } = require("../../models");
const getWorkflowScope = require("../../utils/workflowScope");
const lemburRepository = require("../lembur/repository");
const cutiRepository = require("../cuti/repository");
const ijinRepository = require("../ijin/repository");
const sakitRepository = require("../sakit/repository");
const sppdRepository = require("../sppd/repository");

const APPROVAL_ROLES = new Set(["CHECKER", "VERIFICATION", "APPROVAL_1", "APPROVAL_2", "APPROVAL_3"]);

class DashboardService {
    async getIdentityScope(user) {
        const roleCode = String(user?.kode_role || "").toUpperCase();
        if (user?.is_super_admin === "Y" || roleCode === "ADMIN" || roleCode === "SUPER_ADMIN") return {};

        if (APPROVAL_ROLES.has(roleCode)) {
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
        const scopeWhere = await this.getIdentityScope(user);
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

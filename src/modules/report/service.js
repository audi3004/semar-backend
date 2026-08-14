const { Op } = require("sequelize");
const {
    sequelize, ReportPermohonan, Unit, UnitRole, Role, User, Pegawai, Petugas, Jabatan,
} = require("../../models");
const dashboardService = require("../dashboard/service");
const getWorkflowScope = require("../../utils/workflowScope");

const CONFIG = {
    lembur: { date: "tgl_lembur", amount: (row) => Number(row.biaya_lembur || 0), duration: (row) => Number(row.jumlah_jam_koreksi ?? row.total_jam ?? 0) },
    cuti: { date: "tgl_mulai", days: (row) => Number(row.lama_hari || 0) },
    ijin: { date: "tanggal", days: (row) => dayCount(row.tanggal, row.tgl_selesai) },
    sakit: { date: "tanggal", days: (row) => dayCount(row.tanggal, row.tgl_selesai) },
    sppd: { date: "tgl_berangkat", amount: (row) => Number(row.rp_akomodasi || 0) + Number(row.rp_transportasi || 0) + Number(row.rp_lain_lain || 0) },
};

const roleCode = (user) => String(user?.kode_role || "").toUpperCase();
const fail = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const isGi = (name) => /(^|\s)GI(\s|$)/i.test(String(name || ""));

function dayCount(start, end) {
    if (!start || !end) return 1;
    return Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);
}

const isApproved = (row) => {
    const status = row.status || {};
    const code = String(status.kode_status || "").toUpperCase();
    return status.is_final === "Y" && !["REJECT", "TOLAK", "CANCEL", "BATAL"].some((value) => code.includes(value));
};

const signerInclude = (as) => ({
    model: User,
    as,
    attributes: ["id_user", "username", "email"],
    include: [
        { model: Pegawai, as: "pegawai", required: false, attributes: ["nip", "nama"], include: [{ model: Jabatan, as: "jabatan", required: false, attributes: ["nama_jabatan"] }] },
        { model: Petugas, as: "petugas", required: false, attributes: ["nip", "nama"], include: [{ model: Jabatan, as: "jabatan", required: false, attributes: ["nama_jabatan"] }] },
    ],
});

class ReportService {
    assertMonth(query) {
        const year = Number(query.year);
        const month = Number(query.month);
        if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
            throw fail("Filter report wajib tepat satu bulan dan satu tahun.");
        }
        return { year, month, start_date: `${year}-${String(month).padStart(2, "0")}-01`, end_date: `${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}` };
    }

    assertCompleted(year, month) {
        const now = new Date();
        if (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)) {
            throw fail("Report hanya dapat dibuat untuk periode bulanan yang sudah selesai.");
        }
    }

    async giUnits(user) {
        const role = roleCode(user);
        if (user?.is_super_admin === "Y" || ["ADMIN", "SUPER_ADMIN"].includes(role)) {
            return Unit.findAll({ where: { is_active: "Y", nama_unit: { [Op.like]: "GI %" } }, attributes: ["id_unit", "nama_unit"], order: [["nama_unit", "ASC"]], raw: true });
        }
        const scope = await getWorkflowScope(user);
        if (!scope?.unitIds?.length) return [];
        const rows = await Unit.findAll({ where: { id_unit: { [Op.in]: scope.unitIds }, is_active: "Y" }, attributes: ["id_unit", "nama_unit"], order: [["nama_unit", "ASC"]], raw: true });
        return rows.filter((unit) => isGi(unit.nama_unit));
    }

    async transactions(user, query, forcedUnitId = null) {
        const period = this.assertMonth(query);
        const grouped = await dashboardService.analytics(user, period);
        const requestedTypes = query.type && query.type !== "all" ? [query.type] : Object.keys(CONFIG);
        const search = String(query.search || "").trim().toLowerCase();
        const unitId = forcedUnitId || (query.id_unit ? Number(query.id_unit) : null);
        const allowedUnits = await this.giUnits(user);
        if (unitId && !allowedUnits.some((unit) => Number(unit.id_unit) === unitId)) throw fail("Unit GI tidak berada dalam lingkup role Anda.", 403);

        const transactions = requestedTypes.flatMap((type) => (grouped[type] || [])
            .filter(isApproved)
            .filter((row) => !unitId || Number(row.petugas?.id_unit) === unitId)
            .filter((row) => {
                if (!search) return true;
                const documentNumber = row.nomor_dokumen || row.no_cuti || row.no_sppd || "";
                return [documentNumber, row.petugas?.nip, row.petugas?.nama, row.keterangan, row.perihal, row.maksud_dinas]
                    .some((value) => String(value || "").toLowerCase().includes(search));
            })
            .map((row) => ({ ...row.toJSON(), report_type: type, report_date: row[CONFIG[type].date] })))
            .sort((a, b) => String(b.report_date || "").localeCompare(String(a.report_date || "")));

        const summary = { count: transactions.length, total_lembur_hours: 0, total_lembur_cost: 0, total_sppd_cost: 0, total_cuti_days: 0, total_ijin_days: 0, total_sakit_days: 0 };
        transactions.forEach((row) => {
            const config = CONFIG[row.report_type];
            if (row.report_type === "lembur") {
                summary.total_lembur_hours += config.duration(row);
                summary.total_lembur_cost += config.amount(row);
            } else if (row.report_type === "sppd") summary.total_sppd_cost += config.amount(row);
            else summary[`total_${row.report_type}_days`] += config.days(row);
        });
        return { transactions, summary, period, units: allowedUnits };
    }

    serialize(report) {
        if (!report) return null;
        const value = report.toJSON ? report.toJSON() : report;
        const person = (account) => {
            if (!account) return null;
            const profile = account.pegawai || account.petugas || {};
            return { id_user: account.id_user, name: profile.nama || account.username, nip: profile.nip || "-", jabatan: profile.jabatan?.nama_jabatan || "-" };
        };
        return {
            ...value,
            snapshot: typeof value.snapshot_json === "string" ? JSON.parse(value.snapshot_json) : value.snapshot_json,
            snapshot_json: undefined,
            checker: value.checker ? {
                ...person(value.checker),
                name: value.checker_name || person(value.checker)?.name,
                nip: value.checker_nip || person(value.checker)?.nip,
            } : null,
            approval1: value.approval1 ? {
                ...person(value.approval1),
                name: value.approval_1_name || person(value.approval1)?.name,
                nip: value.approval_1_nip || person(value.approval1)?.nip,
            } : null,
            fully_signed: Boolean(value.checker_signature && value.approval_1_signature),
        };
    }

    async findReport(where) {
        return ReportPermohonan.findOne({ where, include: [{ model: Unit, as: "unitGi", attributes: ["id_unit", "nama_unit"] }, signerInclude("checker"), signerInclude("approval1")] });
    }

    async permohonan(user, query = {}) {
        const data = await this.transactions(user, query);
        let report = query.id_unit ? await this.findReport({ id_unit_gi: Number(query.id_unit), tahun_periode: data.period.year, bulan_periode: data.period.month }) : null;
        if (roleCode(user) === "APPROVAL_2" && report && (!report.checker_signature || !report.approval_1_signature)) report = null;
        const visibleTransactions = roleCode(user) === "APPROVAL_2"
            ? (report ? (JSON.parse(report.snapshot_json || "{}").transactions || []) : [])
            : data.transactions;
        return { transactions: visibleTransactions, summary: data.summary, units: data.units, report: this.serialize(report), generated_at: new Date().toISOString() };
    }

    async create(user, payload) {
        if (roleCode(user) !== "CHECKER") throw fail("Hanya Checker yang dapat menginisiasi report.", 403);
        const period = this.assertMonth(payload);
        this.assertCompleted(period.year, period.month);
        const idUnit = Number(payload.id_unit);
        const data = await this.transactions(user, { ...payload, type: "all", search: "" }, idUnit);
        if (!data.transactions.length) throw fail("Tidak ada transaksi approved pada periode dan GI tersebut.");

        const approvalRole = await Role.findOne({ where: { kode_role: "APPROVAL_1", is_active: "Y" }, attributes: ["id_role"], raw: true });
        if (!approvalRole) throw fail("Role Approval 1 aktif tidak ditemukan.", 422);
        const approvalAssignment = await UnitRole.findOne({ where: { id_unit: idUnit, id_role: approvalRole.id_role, is_active: "Y" }, order: [["id_unit_role", "ASC"]], raw: true });
        if (!approvalAssignment) throw fail("Approval 1 aktif untuk GI terpilih belum dikonfigurasi pada Unit Role.", 422);

        const unit = data.units.find((item) => Number(item.id_unit) === idUnit);
        const reportId = await sequelize.transaction(async (transaction) => {
            const existing = await ReportPermohonan.findOne({ where: { id_unit_gi: idUnit, tahun_periode: period.year, bulan_periode: period.month }, transaction, lock: transaction.LOCK.UPDATE });
            if (existing) return existing.id_report_permohonan;
            const last = await ReportPermohonan.findOne({ where: { tahun_nomor: new Date().getFullYear() }, order: [["nomor_urut", "DESC"]], transaction, lock: transaction.LOCK.UPDATE });
            const sequence = Number(last?.nomor_urut || 0) + 1;
            const unitCode = String(unit.nama_unit).replace(/^GI\s*/i, "GI-").replace(/[^A-Z0-9-]/gi, "").toUpperCase();
            const nomorDokumen = `${String(sequence).padStart(3, "0")}/RPT-PERMOHONAN/${unitCode}/${new Date().getFullYear()}`;
            const created = await ReportPermohonan.create({
                nomor_dokumen: nomorDokumen, nomor_urut: sequence, tahun_nomor: new Date().getFullYear(),
                tahun_periode: period.year, bulan_periode: period.month, id_unit_gi: idUnit,
                id_checker: user.id_user, id_approval_1: approvalAssignment.id_user,
                snapshot_json: JSON.stringify({ transactions: data.transactions, summary: data.summary }),
                transaction_count: data.transactions.length, created_by: user.id_user,
            }, { transaction });
            return created.id_report_permohonan;
        });
        return this.serialize(await this.findReport({ id_report_permohonan: reportId }));
    }

    async sign(user, id, signature) {
        const report = await ReportPermohonan.findByPk(id);
        if (!report) throw fail("Report tidak ditemukan.", 404);
        const role = roleCode(user);
        const changes = { updated_by: user.id_user };
        const signerAccount = await User.findByPk(user.id_user, {
            include: [
                { model: Pegawai, as: "pegawai", required: false, attributes: ["nip", "nama"] },
                { model: Petugas, as: "petugas", required: false, attributes: ["nip", "nama"] },
            ],
        });
        const signer = signerAccount?.pegawai || signerAccount?.petugas || {};
        if (role === "CHECKER" && Number(report.id_checker) === Number(user.id_user)) {
            changes.checker_signature = signature;
            changes.checker_name = signer.nama || signerAccount?.username || user.username;
            changes.checker_nip = signer.nip || "-";
            changes.checker_signed_at = new Date();
        } else if (role === "APPROVAL_1" && Number(report.id_approval_1) === Number(user.id_user)) {
            if (!report.checker_signature) throw fail("Approval 1 belum dapat menandatangani sebelum Checker.", 409);
            changes.approval_1_signature = signature;
            changes.approval_1_name = signer.nama || signerAccount?.username || user.username;
            changes.approval_1_nip = signer.nip || "-";
            changes.approval_1_signed_at = new Date();
        } else throw fail("Anda bukan penandatangan report ini.", 403);
        await report.update(changes);
        return this.serialize(await this.findReport({ id_report_permohonan: report.id_report_permohonan }));
    }

    async exportData(user, id) {
        const report = await this.findReport({ id_report_permohonan: id });
        if (!report) throw fail("Report tidak ditemukan.", 404);
        if (!report.checker_signature || !report.approval_1_signature) throw fail("PDF dan Excel hanya tersedia setelah kedua tanda tangan lengkap.", 409);
        const role = roleCode(user);
        const isAdmin = user?.is_super_admin === "Y" || ["ADMIN", "SUPER_ADMIN"].includes(role);
        if (role === "CHECKER" && Number(report.id_checker) !== Number(user.id_user)) throw fail("Report berada di luar penugasan Anda.", 403);
        if (role === "APPROVAL_1" && Number(report.id_approval_1) !== Number(user.id_user)) throw fail("Report berada di luar penugasan Anda.", 403);
        if (role === "APPROVAL_2") {
            const scope = await getWorkflowScope(user);
            if (!scope?.unitIds?.includes(Number(report.id_unit_gi))) throw fail("Report berada di luar lingkup unit Anda.", 403);
        }
        if (!isAdmin && !["CHECKER", "APPROVAL_1", "APPROVAL_2"].includes(role)) throw fail("Role Anda tidak memiliki akses export report.", 403);
        return this.serialize(report);
    }
}

module.exports = new ReportService();

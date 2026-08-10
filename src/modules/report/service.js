const dashboardService = require("../dashboard/service");

const CONFIG = {
    lembur: { date: "tgl_lembur", amount: (row) => Number(row.biaya_lembur || 0), duration: (row) => Number(row.jumlah_jam_koreksi ?? row.total_jam ?? 0) },
    cuti: { date: "tgl_mulai", days: (row) => Number(row.lama_hari || 0) },
    ijin: { date: "tanggal", days: (row) => dayCount(row.tanggal, row.tgl_selesai) },
    sakit: { date: "tanggal", days: (row) => dayCount(row.tanggal, row.tgl_selesai) },
    sppd: { date: "tgl_berangkat", amount: (row) => Number(row.rp_akomodasi || 0) + Number(row.rp_transportasi || 0) + Number(row.rp_lain_lain || 0) },
};

function dayCount(start, end) {
    if (!start || !end) return 1;
    return Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);
}

const isApproved = (row) => {
    const status = row.status || {};
    const code = String(status.kode_status || "").toUpperCase();
    return status.is_final === "Y" && !code.includes("REJECT") && !code.includes("TOLAK") && !code.includes("CANCEL") && !code.includes("BATAL");
};

class ReportService {
    async permohonan(user, query = {}) {
        const dateQuery = { start_date: query.start_date, end_date: query.end_date };
        const grouped = await dashboardService.analytics(user, dateQuery);
        const requestedTypes = query.type && query.type !== "all" ? [query.type] : Object.keys(CONFIG);
        const search = String(query.search || "").trim().toLowerCase();
        const unitId = query.id_unit ? String(query.id_unit) : null;

        const transactions = requestedTypes.flatMap((type) =>
            (grouped[type] || [])
                .filter(isApproved)
                .filter((row) => !unitId || String(row.petugas?.id_unit) === unitId)
                .filter((row) => {
                    if (!search) return true;
                    const documentNumber = row.nomor_dokumen || row.no_cuti || row.no_sppd || "";
                    return [documentNumber, row.petugas?.nip, row.petugas?.nama, row.keterangan, row.perihal, row.maksud_dinas]
                        .some((value) => String(value || "").toLowerCase().includes(search));
                })
                .map((row) => ({ ...row.toJSON(), report_type: type, report_date: row[CONFIG[type].date] })),
        ).sort((a, b) => String(b.report_date || "").localeCompare(String(a.report_date || "")));

        const summary = {
            count: transactions.length,
            total_lembur_hours: 0,
            total_lembur_cost: 0,
            total_sppd_cost: 0,
            total_cuti_days: 0,
            total_ijin_days: 0,
            total_sakit_days: 0,
        };
        transactions.forEach((row) => {
            const config = CONFIG[row.report_type];
            if (row.report_type === "lembur") {
                summary.total_lembur_hours += config.duration(row);
                summary.total_lembur_cost += config.amount(row);
            } else if (row.report_type === "sppd") summary.total_sppd_cost += config.amount(row);
            else summary[`total_${row.report_type}_days`] += config.days(row);
        });

        return { transactions, summary, generated_at: new Date().toISOString() };
    }
}

module.exports = new ReportService();

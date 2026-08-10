const { QueryTypes } = require("sequelize");
const sequelize = require("../config/database");

const ROMAN_MONTHS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

const toUnitCode = (name, idUnit) => {
    const normalized = String(name || "UNIT")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 30);
    return `${normalized || "UNIT"}-${idUnit}`;
};

const parsePeriod = (dateValue) => {
    const raw = String(dateValue || new Date().toISOString().slice(0, 10)).slice(0, 10);
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) throw new Error("Tanggal dokumen tidak valid untuk penomoran");
    return { year: Number(match[1]), month: Number(match[2]) };
};

async function generateDocumentNumber(documentType, dateValue, idPetugas) {
    const type = String(documentType || "DOC").trim().toUpperCase();
    const { year, month } = parsePeriod(dateValue);

    return sequelize.transaction(async (transaction) => {
        const petugasRows = await sequelize.query(
            `SELECT p.id_unit, u.nama_unit
             FROM m_petugas p
             JOIN m_unit u ON u.id_unit = p.id_unit
             WHERE p.id_petugas = :idPetugas
             LIMIT 1`,
            { replacements: { idPetugas }, type: QueryTypes.SELECT, transaction },
        );
        const petugas = petugasRows[0];
        if (!petugas) throw new Error("Unit petugas tidak ditemukan untuk penomoran dokumen");

        await sequelize.query(
            `INSERT INTO sys_document_sequence
                (document_type, id_unit, period_year, period_month, current_number, created_at, updated_at)
             VALUES (:type, :idUnit, :year, :month, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             ON DUPLICATE KEY UPDATE current_number = current_number + 1, updated_at = CURRENT_TIMESTAMP`,
            { replacements: { type, idUnit: petugas.id_unit, year, month }, transaction },
        );
        const rows = await sequelize.query(
            `SELECT current_number FROM sys_document_sequence
             WHERE document_type = :type AND id_unit = :idUnit
               AND period_year = :year AND period_month = :month
             FOR UPDATE`,
            { replacements: { type, idUnit: petugas.id_unit, year, month }, type: QueryTypes.SELECT, transaction },
        );
        const sequence = String(rows[0].current_number).padStart(3, "0");
        return `${sequence}/${type}/${toUnitCode(petugas.nama_unit, petugas.id_unit)}/PLN-ES/${ROMAN_MONTHS[month - 1]}/${year}`;
    });
}

module.exports = { generateDocumentNumber };

"use strict";

module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.query(`
            UPDATE t_lembur AS lembur
            INNER JOIN m_status AS status
                ON status.id_status = lembur.id_status
            SET lembur.jumlah_jam_koreksi = NULL
            WHERE status.kode_status = 'DRAFT'
              AND lembur.jumlah_jam_koreksi IS NOT NULL
        `);
    },

    async down() {
        // Nilai lama tidak dapat direkonstruksi tanpa mengubah makna koreksi.
    },
};

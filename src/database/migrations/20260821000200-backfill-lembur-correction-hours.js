"use strict";

module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.query(`
            UPDATE t_lembur
            SET jumlah_jam_koreksi = total_jam
            WHERE jumlah_jam_koreksi IS NULL
        `);
    },

    async down() {
        // Backfill tidak dibatalkan agar histori jam transaksi tidak hilang.
    },
};

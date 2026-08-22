"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        const columns = await queryInterface.describeTable("t_lembur");
        if (!columns.tarif_lembur) {
            await queryInterface.addColumn("t_lembur", "tarif_lembur", {
                type: Sequelize.DECIMAL(15, 6), allowNull: true, after: "biaya_lembur",
                comment: "Tarif dasar lembur yang disimpan saat transaksi dibuat",
            });
        }
        if (!columns.total_faktor) {
            await queryInterface.addColumn("t_lembur", "total_faktor", {
                type: Sequelize.DECIMAL(8, 2), allowNull: true, after: "tarif_lembur",
                comment: "Total faktor pengali berdasarkan durasi dan jenis hari lembur",
            });
        }
    },
    async down(queryInterface) {
        const columns = await queryInterface.describeTable("t_lembur");
        if (columns.total_faktor) await queryInterface.removeColumn("t_lembur", "total_faktor");
        if (columns.tarif_lembur) await queryInterface.removeColumn("t_lembur", "tarif_lembur");
    },
};

"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("t_lembur", "biaya_lembur", {
            type: Sequelize.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            after: "total_jam",
            comment: "Biaya lembur berdasarkan jam efektif dan tarif upah saat transaksi",
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("t_lembur", "biaya_lembur");
    },
};

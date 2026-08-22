"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        const columns = await queryInterface.describeTable("t_cuti");
        if (!columns.sisa_cuti_sebelum) {
            await queryInterface.addColumn("t_cuti", "sisa_cuti_sebelum", {
                type: Sequelize.INTEGER,
                allowNull: true,
                after: "lama_hari",
                comment: "Snapshot sisa hak cuti sebelum pengajuan",
            });
        }
        if (!columns.sisa_cuti_setelah) {
            await queryInterface.addColumn("t_cuti", "sisa_cuti_setelah", {
                type: Sequelize.INTEGER,
                allowNull: true,
                after: "sisa_cuti_sebelum",
                comment: "Snapshot sisa hak cuti pasca pengajuan",
            });
        }
    },

    async down(queryInterface) {
        const columns = await queryInterface.describeTable("t_cuti");
        if (columns.sisa_cuti_setelah) await queryInterface.removeColumn("t_cuti", "sisa_cuti_setelah");
        if (columns.sisa_cuti_sebelum) await queryInterface.removeColumn("t_cuti", "sisa_cuti_sebelum");
    },
};

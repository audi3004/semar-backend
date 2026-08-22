"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        const columns = await queryInterface.describeTable("t_report_permohonan");
        if (!columns.checker_name) await queryInterface.addColumn("t_report_permohonan", "checker_name", { type: Sequelize.STRING(255), allowNull: true });
        if (!columns.checker_nip) await queryInterface.addColumn("t_report_permohonan", "checker_nip", { type: Sequelize.STRING(100), allowNull: true });
        if (!columns.approval_1_name) await queryInterface.addColumn("t_report_permohonan", "approval_1_name", { type: Sequelize.STRING(255), allowNull: true });
        if (!columns.approval_1_nip) await queryInterface.addColumn("t_report_permohonan", "approval_1_nip", { type: Sequelize.STRING(100), allowNull: true });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("t_report_permohonan", "approval_1_nip");
        await queryInterface.removeColumn("t_report_permohonan", "approval_1_name");
        await queryInterface.removeColumn("t_report_permohonan", "checker_nip");
        await queryInterface.removeColumn("t_report_permohonan", "checker_name");
    },
};

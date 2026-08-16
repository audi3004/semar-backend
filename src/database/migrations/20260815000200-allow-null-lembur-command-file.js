"use strict";
module.exports = {
    async up(queryInterface, Sequelize) { await queryInterface.changeColumn("t_lembur", "surat_perintah_lembur", { type: Sequelize.STRING(500), allowNull: true }); },
    async down(queryInterface, Sequelize) { await queryInterface.changeColumn("t_lembur", "surat_perintah_lembur", { type: Sequelize.STRING(500), allowNull: false }); },
};

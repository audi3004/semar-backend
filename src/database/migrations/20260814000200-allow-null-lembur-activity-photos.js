"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn("t_lembur", "foto_kegiatan_1", {
            type: Sequelize.STRING(500),
            allowNull: true,
        });
        await queryInterface.changeColumn("t_lembur", "foto_kegiatan_2", {
            type: Sequelize.STRING(500),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            "UPDATE `t_lembur` SET `foto_kegiatan_1` = '' WHERE `foto_kegiatan_1` IS NULL"
        );
        await queryInterface.sequelize.query(
            "UPDATE `t_lembur` SET `foto_kegiatan_2` = '' WHERE `foto_kegiatan_2` IS NULL"
        );
        await queryInterface.changeColumn("t_lembur", "foto_kegiatan_1", {
            type: Sequelize.STRING(500),
            allowNull: false,
        });
        await queryInterface.changeColumn("t_lembur", "foto_kegiatan_2", {
            type: Sequelize.STRING(500),
            allowNull: false,
        });
    },
};

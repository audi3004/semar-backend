"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            "m_koef_tmk",
            "masa_kerja",
            {
                type: Sequelize.INTEGER,
                allowNull: false,
                comment: "Batas minimum masa kerja dalam tahun penuh",
            }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            "m_koef_tmk",
            "masa_kerja",
            {
                type: Sequelize.STRING(100),
                allowNull: false,
            }
        );
    },
};

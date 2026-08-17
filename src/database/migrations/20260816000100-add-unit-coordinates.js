"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("m_unit", "lat", {
            type: Sequelize.DECIMAL(10, 7),
            allowNull: true,
            after: "nama_unit",
        });
        await queryInterface.addColumn("m_unit", "lon", {
            type: Sequelize.DECIMAL(10, 7),
            allowNull: true,
            after: "lat",
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("m_unit", "lon");
        await queryInterface.removeColumn("m_unit", "lat");
    },
};

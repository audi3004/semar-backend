"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("m_unit_role", "scope_type", {
            type: Sequelize.ENUM("SELF", "SELF_AND_DESCENDANTS"),
            allowNull: false,
            defaultValue: "SELF",
            after: "id_role",
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("m_unit_role", "scope_type");
    },
};

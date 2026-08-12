"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        const columns = await queryInterface.describeTable("m_unit_role");
        if (!columns.scope_type) {
            await queryInterface.addColumn("m_unit_role", "scope_type", {
                type: Sequelize.ENUM("SELF", "SELF_AND_DESCENDANTS"),
                allowNull: false,
                defaultValue: "SELF",
                after: "id_role",
            });
        }
    },

    async down(queryInterface) {
        const columns = await queryInterface.describeTable("m_unit_role");
        if (columns.scope_type) await queryInterface.removeColumn("m_unit_role", "scope_type");
    },
};

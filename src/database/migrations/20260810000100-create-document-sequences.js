"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("sys_document_sequence", {
            id_sequence: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
            document_type: { type: Sequelize.STRING(20), allowNull: false },
            id_unit: { type: Sequelize.INTEGER, allowNull: false },
            period_year: { type: Sequelize.INTEGER, allowNull: false },
            period_month: { type: Sequelize.INTEGER, allowNull: false },
            current_number: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        });
        await queryInterface.addConstraint("sys_document_sequence", {
            fields: ["document_type", "id_unit", "period_year", "period_month"],
            type: "unique",
            name: "uk_document_sequence_period_unit",
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("sys_document_sequence");
    },
};

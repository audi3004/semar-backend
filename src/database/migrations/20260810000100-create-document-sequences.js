"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        const tableName = "sys_document_sequence";
        const tables = await queryInterface.showAllTables();
        if (!tables.includes(tableName)) {
            await queryInterface.createTable(tableName, {
                id_sequence: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
                document_type: { type: Sequelize.STRING(20), allowNull: false },
                id_unit: { type: Sequelize.INTEGER, allowNull: false },
                period_year: { type: Sequelize.INTEGER, allowNull: false },
                period_month: { type: Sequelize.INTEGER, allowNull: false },
                current_number: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
                updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
            });
        }

        const indexes = await queryInterface.showIndex(tableName);
        if (!indexes.some((index) => index.name === "uk_document_sequence_period_unit")) {
            await queryInterface.addConstraint(tableName, {
                fields: ["document_type", "id_unit", "period_year", "period_month"],
                type: "unique",
                name: "uk_document_sequence_period_unit",
            });
        }
    },

    async down(queryInterface) {
        const tables = await queryInterface.showAllTables();
        if (tables.includes("sys_document_sequence")) {
            await queryInterface.dropTable("sys_document_sequence");
        }
    },
};

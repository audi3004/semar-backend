"use strict";

const { DataTypes } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const tables = await queryInterface.showAllTables();
        const tableNames = tables.map((table) => String(table?.tableName || table));
        if (tableNames.some((name) => name.toLowerCase() === "t_report_permohonan")) return;
        await queryInterface.createTable("t_report_permohonan", {
            id_report_permohonan: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
            nomor_dokumen: { type: DataTypes.STRING(150), allowNull: false },
            nomor_urut: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
            tahun_nomor: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false },
            tahun_periode: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false },
            bulan_periode: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false },
            id_unit_gi: { type: DataTypes.INTEGER, allowNull: false, references: { model: "m_unit", key: "id_unit" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
            id_checker: { type: DataTypes.INTEGER, allowNull: false, references: { model: "m_user", key: "id_user" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
            id_approval_1: { type: DataTypes.INTEGER, allowNull: false, references: { model: "m_user", key: "id_user" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
            checker_signature: { type: DataTypes.TEXT("long"), allowNull: true },
            checker_signed_at: { type: DataTypes.DATE, allowNull: true },
            approval_1_signature: { type: DataTypes.TEXT("long"), allowNull: true },
            approval_1_signed_at: { type: DataTypes.DATE, allowNull: true },
            snapshot_json: { type: DataTypes.TEXT("long"), allowNull: false },
            transaction_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
            created_by: { type: DataTypes.INTEGER, allowNull: false },
            updated_by: { type: DataTypes.INTEGER, allowNull: true },
            created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        });
        await queryInterface.addIndex("t_report_permohonan", ["nomor_dokumen"], { unique: true, name: "uk_report_permohonan_document" });
        await queryInterface.addIndex("t_report_permohonan", ["id_unit_gi", "tahun_periode", "bulan_periode"], { unique: true, name: "uk_report_permohonan_unit_period" });
        await queryInterface.addIndex("t_report_permohonan", ["tahun_nomor", "nomor_urut"], { unique: true, name: "uk_report_permohonan_year_sequence" });
        await queryInterface.addIndex("t_report_permohonan", ["id_checker", "id_approval_1"], { name: "idx_report_permohonan_signers" });
    },
    async down(queryInterface) {
        await queryInterface.dropTable("t_report_permohonan");
    },
};

"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        const tables = (await queryInterface.showAllTables()).map((table) => String(table?.tableName || table).toLowerCase());
        const lemburColumns = await queryInterface.describeTable("t_lembur");
        const basisColumnsExist = ["dasar_lembur_type", "id_spkl_petugas", "id_cuti", "id_ijin", "id_sakit"]
            .every((column) => lemburColumns[column]);
        if (tables.includes("t_spkl") && tables.includes("t_spkl_petugas") && basisColumnsExist) return;

        await queryInterface.createTable("t_spkl", {
            id_spkl: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
            nomor_dokumen: { type: Sequelize.STRING(150), allowNull: false, unique: true },
            id_unit: { type: Sequelize.INTEGER, allowNull: false, references: { model: "m_unit", key: "id_unit" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
            tgl_lembur: { type: Sequelize.DATEONLY, allowNull: false },
            kategori_lembur: { type: Sequelize.STRING(1000), allowNull: false },
            jenis_pekerjaan: { type: Sequelize.STRING(1000), allowNull: false },
            kode_jenis_pekerjaan: { type: Sequelize.ENUM("REGULAR", "SIAGA_HARI_LIBUR"), allowNull: false, defaultValue: "REGULAR" },
            area_group: { type: Sequelize.STRING(255), allowNull: true },
            detail_pekerjaan: { type: Sequelize.TEXT, allowNull: true },
            status_spkl: { type: Sequelize.ENUM("DRAFT", "ACTIVE", "CANCELLED", "COMPLETED"), allowNull: false, defaultValue: "ACTIVE" },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
            created_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: "m_user", key: "id_user" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
            updated_at: { type: Sequelize.DATE, allowNull: true }, updated_by: { type: Sequelize.INTEGER, allowNull: true },
        });
        await queryInterface.addIndex("t_spkl", ["id_unit", "tgl_lembur"], { name: "idx_spkl_unit_tanggal" });
        await queryInterface.createTable("t_spkl_petugas", {
            id_spkl_petugas: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
            id_spkl: { type: Sequelize.INTEGER, allowNull: false, references: { model: "t_spkl", key: "id_spkl" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
            id_petugas: { type: Sequelize.INTEGER, allowNull: false, references: { model: "m_petugas", key: "id_petugas" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
            status_penugasan: { type: Sequelize.ENUM("ASSIGNED", "DRAFTED", "SUBMITTED", "CANCELLED"), allowNull: false, defaultValue: "ASSIGNED" },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") }, updated_at: { type: Sequelize.DATE, allowNull: true },
        });
        await queryInterface.addIndex("t_spkl_petugas", ["id_spkl", "id_petugas"], { unique: true, name: "uk_spkl_petugas" });
        await queryInterface.addColumn("t_lembur", "dasar_lembur_type", { type: Sequelize.ENUM("SPKL", "CUTI", "IJIN", "SAKIT"), allowNull: true });
        await queryInterface.addColumn("t_lembur", "id_spkl_petugas", { type: Sequelize.INTEGER, allowNull: true, references: { model: "t_spkl_petugas", key: "id_spkl_petugas" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
        await queryInterface.addColumn("t_lembur", "id_cuti", { type: Sequelize.INTEGER, allowNull: true, references: { model: "t_cuti", key: "id_cuti" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
        await queryInterface.addColumn("t_lembur", "id_ijin", { type: Sequelize.INTEGER, allowNull: true, references: { model: "t_ijin", key: "id_ijin" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
        await queryInterface.addColumn("t_lembur", "id_sakit", { type: Sequelize.INTEGER, allowNull: true, references: { model: "t_sakit", key: "id_sakit" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
        await queryInterface.addIndex("t_lembur", ["id_spkl_petugas"], { unique: true, name: "uk_lembur_spkl_assignment" });
    },
    async down(queryInterface) {
        for (const column of ["id_sakit", "id_ijin", "id_cuti", "id_spkl_petugas", "dasar_lembur_type"]) await queryInterface.removeColumn("t_lembur", column);
        await queryInterface.dropTable("t_spkl_petugas"); await queryInterface.dropTable("t_spkl");
    },
};

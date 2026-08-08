"use strict";

const { DataTypes } = require("sequelize");

const columns = {
    jenis_pekerjaan: { type: DataTypes.STRING(1000), allowNull: true, after: "kategori_lembur" },
    area_group: { type: DataTypes.STRING(255), allowNull: true, after: "jenis_pekerjaan" },
    is_hari_libur: { type: DataTypes.ENUM("Y", "N"), allowNull: false, defaultValue: "N", after: "area_group" },
    maker_signature: { type: DataTypes.STRING(500), allowNull: true },
    checker_signature: { type: DataTypes.STRING(500), allowNull: true },
    verification_signature: { type: DataTypes.STRING(500), allowNull: true },
    approval_1_signature: { type: DataTypes.STRING(500), allowNull: true },
    approval_2_signature: { type: DataTypes.STRING(500), allowNull: true },
    approval_3_signature: { type: DataTypes.STRING(500), allowNull: true },
    jumlah_jam_koreksi: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    catatan_koreksi: { type: DataTypes.TEXT, allowNull: true },
    nomor_dokumen: { type: DataTypes.STRING(150), allowNull: true },
};

module.exports = {
    async up(queryInterface) {
        const existing = await queryInterface.describeTable("t_lembur");
        for (const [name, definition] of Object.entries(columns)) {
            if (!existing[name]) await queryInterface.addColumn("t_lembur", name, definition);
        }
        const indexes = await queryInterface.showIndex("t_lembur");
        if (!indexes.some((index) => index.name === "uk_lembur_nomor_dokumen")) {
            await queryInterface.addIndex("t_lembur", ["nomor_dokumen"], { name: "uk_lembur_nomor_dokumen", unique: true });
        }
    },

    async down(queryInterface) {
        const indexes = await queryInterface.showIndex("t_lembur");
        if (indexes.some((index) => index.name === "uk_lembur_nomor_dokumen")) await queryInterface.removeIndex("t_lembur", "uk_lembur_nomor_dokumen");
        const existing = await queryInterface.describeTable("t_lembur");
        for (const name of Object.keys(columns).reverse()) {
            if (existing[name]) await queryInterface.removeColumn("t_lembur", name);
        }
    },
};

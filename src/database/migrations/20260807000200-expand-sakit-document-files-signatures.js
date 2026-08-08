"use strict";

const { DataTypes } = require("sequelize");

const columns = {
    nomor_dokumen: { type: DataTypes.STRING(150), allowNull: true, after: "id_status" },
    nama_dokter: { type: DataTypes.STRING(150), allowNull: true, after: "foto" },
    maker_signature: { type: DataTypes.STRING(500), allowNull: true },
    checker_signature: { type: DataTypes.STRING(500), allowNull: true },
    verification_signature: { type: DataTypes.STRING(500), allowNull: true },
    approval_1_signature: { type: DataTypes.STRING(500), allowNull: true },
    approval_2_signature: { type: DataTypes.STRING(500), allowNull: true },
    approval_3_signature: { type: DataTypes.STRING(500), allowNull: true },
};

module.exports = {
    async up(queryInterface) {
        const existing = await queryInterface.describeTable("t_sakit");
        for (const [name, definition] of Object.entries(columns)) {
            if (!existing[name]) await queryInterface.addColumn("t_sakit", name, definition);
        }
        await queryInterface.sequelize.query(
            "UPDATE t_sakit SET nomor_dokumen = CONCAT('SAKIT-MIGRATED-', id_sakit) WHERE nomor_dokumen IS NULL OR nomor_dokumen = ''"
        );
        await queryInterface.changeColumn("t_sakit", "nomor_dokumen", { type: DataTypes.STRING(150), allowNull: false });
        const indexes = await queryInterface.showIndex("t_sakit");
        if (!indexes.some((index) => index.name === "uk_sakit_nomor_dokumen")) {
            await queryInterface.addIndex("t_sakit", ["nomor_dokumen"], { name: "uk_sakit_nomor_dokumen", unique: true });
        }
    },

    async down(queryInterface) {
        const indexes = await queryInterface.showIndex("t_sakit");
        if (indexes.some((index) => index.name === "uk_sakit_nomor_dokumen")) await queryInterface.removeIndex("t_sakit", "uk_sakit_nomor_dokumen");
        const existing = await queryInterface.describeTable("t_sakit");
        for (const name of Object.keys(columns).reverse()) {
            if (existing[name]) await queryInterface.removeColumn("t_sakit", name);
        }
    },
};

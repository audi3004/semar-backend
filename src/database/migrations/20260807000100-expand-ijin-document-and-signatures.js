"use strict";

const { DataTypes } = require("sequelize");

const columns = {
    nomor_dokumen: { type: DataTypes.STRING(150), allowNull: true, after: "id_status" },
    maker_signature: { type: DataTypes.STRING(500), allowNull: true },
    checker_signature: { type: DataTypes.STRING(500), allowNull: true },
    verification_signature: { type: DataTypes.STRING(500), allowNull: true },
    approval_1_signature: { type: DataTypes.STRING(500), allowNull: true },
    approval_2_signature: { type: DataTypes.STRING(500), allowNull: true },
    approval_3_signature: { type: DataTypes.STRING(500), allowNull: true },
    jumlah_hari_disetujui: { type: DataTypes.INTEGER, allowNull: true },
};

module.exports = {
    async up(queryInterface) {
        const existing = await queryInterface.describeTable("t_ijin");
        for (const [name, definition] of Object.entries(columns)) {
            if (!existing[name]) await queryInterface.addColumn("t_ijin", name, definition);
        }

        await queryInterface.sequelize.query(
            "UPDATE t_ijin SET nomor_dokumen = CONCAT('IJIN-MIGRATED-', id_ijin) WHERE nomor_dokumen IS NULL OR nomor_dokumen = ''"
        );
        await queryInterface.changeColumn("t_ijin", "nomor_dokumen", { type: DataTypes.STRING(150), allowNull: false });

        const indexes = await queryInterface.showIndex("t_ijin");
        if (!indexes.some((index) => index.name === "uk_ijin_nomor_dokumen")) {
            await queryInterface.addIndex("t_ijin", ["nomor_dokumen"], { name: "uk_ijin_nomor_dokumen", unique: true });
        }
    },

    async down(queryInterface) {
        const indexes = await queryInterface.showIndex("t_ijin");
        if (indexes.some((index) => index.name === "uk_ijin_nomor_dokumen")) {
            await queryInterface.removeIndex("t_ijin", "uk_ijin_nomor_dokumen");
        }
        const existing = await queryInterface.describeTable("t_ijin");
        for (const name of Object.keys(columns).reverse()) {
            if (existing[name]) await queryInterface.removeColumn("t_ijin", name);
        }
    },
};

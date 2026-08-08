"use strict";

const { DataTypes } = require("sequelize");

const columns = {
    nomor_telepon_darurat: { type: DataTypes.STRING(30), allowNull: true, after: "contact_alamat" },
    maker_signature: { type: DataTypes.STRING(500), allowNull: true },
    checker_signature: { type: DataTypes.STRING(500), allowNull: true },
    verification_signature: { type: DataTypes.STRING(500), allowNull: true },
    approval_1_signature: { type: DataTypes.STRING(500), allowNull: true },
    approval_2_signature: { type: DataTypes.STRING(500), allowNull: true },
    approval_3_signature: { type: DataTypes.STRING(500), allowNull: true },
};

module.exports = {
    async up(queryInterface) {
        const existing = await queryInterface.describeTable("t_cuti");
        for (const [name, definition] of Object.entries(columns)) {
            if (!existing[name]) await queryInterface.addColumn("t_cuti", name, definition);
        }
        if (existing.kode_divisi) await queryInterface.removeColumn("t_cuti", "kode_divisi");
    },

    async down(queryInterface) {
        const existing = await queryInterface.describeTable("t_cuti");
        if (!existing.kode_divisi) await queryInterface.addColumn("t_cuti", "kode_divisi", { type: DataTypes.STRING(50), allowNull: true });
        for (const name of Object.keys(columns).reverse()) {
            if (existing[name]) await queryInterface.removeColumn("t_cuti", name);
        }
    },
};

"use strict";

const { DataTypes } = require("sequelize");

const columns = {
    nomor_dokumen: { type: DataTypes.STRING(150), allowNull: true, after: "no_sppd" },
    kota_asal: { type: DataTypes.STRING(150), allowNull: true, after: "nomor_dokumen" },
    beban_anggaran: { type: DataTypes.STRING(255), allowNull: true, after: "lama_dinas" },
    maker_signature: { type: DataTypes.STRING(500), allowNull: true },
    checker_signature: { type: DataTypes.STRING(500), allowNull: true },
    verification_signature: { type: DataTypes.STRING(500), allowNull: true },
    approval_1_signature: { type: DataTypes.STRING(500), allowNull: true },
    approval_2_signature: { type: DataTypes.STRING(500), allowNull: true },
    approval_3_signature: { type: DataTypes.STRING(500), allowNull: true },
};

module.exports = {
    async up(queryInterface) {
        const existing = await queryInterface.describeTable("t_sppd");
        for (const [name, definition] of Object.entries(columns)) {
            if (!existing[name]) await queryInterface.addColumn("t_sppd", name, definition);
        }

        await queryInterface.sequelize.query(
            "UPDATE t_sppd SET kota_asal = kota_tujuan WHERE kota_asal IS NULL OR kota_asal = ''"
        );
        await queryInterface.changeColumn("t_sppd", "kota_asal", {
            type: DataTypes.STRING(150),
            allowNull: false,
        });
    },

    async down(queryInterface) {
        const existing = await queryInterface.describeTable("t_sppd");
        for (const name of Object.keys(columns).reverse()) {
            if (existing[name]) await queryInterface.removeColumn("t_sppd", name);
        }
    },
};

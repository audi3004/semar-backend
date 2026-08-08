const {
    DataTypes,
} = require("sequelize");

const sequelize = require(
    "../config/database"
);

const Sppd = sequelize.define(
    "Sppd",
    {
        id_sppd: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        id_petugas: {
            type: DataTypes.INTEGER,
            allowNull: false,

            references: {
                model: "m_petugas",
                key: "id_petugas",
            },

            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },

        id_status: {
            type: DataTypes.INTEGER,
            allowNull: false,

            references: {
                model: "m_status",
                key: "id_status",
            },

            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },

        no_sppd: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },

        nomor_dokumen: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },

        kota_asal: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },

        kota_tujuan: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },

        maksud_dinas: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        tgl_berangkat: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        tgl_kembali: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        lama_dinas: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },

        beban_anggaran: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },

        maker_signature: { type: DataTypes.STRING(500), allowNull: true },
        checker_signature: { type: DataTypes.STRING(500), allowNull: true },
        verification_signature: { type: DataTypes.STRING(500), allowNull: true },
        approval_1_signature: { type: DataTypes.STRING(500), allowNull: true },
        approval_2_signature: { type: DataTypes.STRING(500), allowNull: true },
        approval_3_signature: { type: DataTypes.STRING(500), allowNull: true },

        rp_akomodasi: {
            type: DataTypes.DECIMAL(
                15,
                2
            ),
            allowNull: false,
            defaultValue: 0,
        },

        desc_akomodasi: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        rp_transportasi: {
            type: DataTypes.DECIMAL(
                15,
                2
            ),
            allowNull: false,
            defaultValue: 0,
        },

        desc_transportasi: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        rp_lain_lain: {
            type: DataTypes.DECIMAL(
                15,
                2
            ),
            allowNull: false,
            defaultValue: 0,
        },

        desc_lain_lain: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },

        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "t_sppd",

        timestamps: true,

        createdAt: "created_at",

        updatedAt: "updated_at",

        indexes: [
            {
                unique: true,
                name: "uk_sppd_no_sppd",
                fields: [
                    "no_sppd",
                ],
            },

            {
                name: "idx_sppd_petugas",
                fields: [
                    "id_petugas",
                ],
            },

            {
                name: "idx_sppd_status",
                fields: [
                    "id_status",
                ],
            },

            {
                name: "idx_sppd_tanggal",
                fields: [
                    "tgl_berangkat",
                    "tgl_kembali",
                ],
            },
        ],
    }
);

module.exports = Sppd;

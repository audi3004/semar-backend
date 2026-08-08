const {
    DataTypes,
} = require("sequelize");

const sequelize = require(
    "../config/database"
);

const Sakit = sequelize.define(
    "Sakit",
    {
        id_sakit: {
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

        nomor_dokumen: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
        },

        agenda: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },

        tanggal: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        tgl_selesai: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        foto: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },

        nama_dokter: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },

        maker_signature: { type: DataTypes.STRING(500), allowNull: true },
        checker_signature: { type: DataTypes.STRING(500), allowNull: true },
        verification_signature: { type: DataTypes.STRING(500), allowNull: true },
        approval_1_signature: { type: DataTypes.STRING(500), allowNull: true },
        approval_2_signature: { type: DataTypes.STRING(500), allowNull: true },
        approval_3_signature: { type: DataTypes.STRING(500), allowNull: true },

        keterangan: {
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
        tableName: "t_sakit",

        timestamps: true,

        createdAt: "created_at",

        updatedAt: "updated_at",

        indexes: [
            {
                unique: true,
                name: "uk_sakit_nomor_dokumen",
                fields: ["nomor_dokumen"],
            },
            {
                name: "idx_sakit_petugas",
                fields: [
                    "id_petugas",
                ],
            },

            {
                name: "idx_sakit_status",
                fields: [
                    "id_status",
                ],
            },

            {
                name: "idx_sakit_tanggal",
                fields: [
                    "tanggal",
                    "tgl_selesai",
                ],
            },

            {
                name: "idx_sakit_petugas_tanggal",
                fields: [
                    "id_petugas",
                    "tanggal",
                    "tgl_selesai",
                ],
            },
        ],
    }
);

module.exports = Sakit;

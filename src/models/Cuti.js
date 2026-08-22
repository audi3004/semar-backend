const {
    DataTypes,
} = require("sequelize");

const sequelize = require(
    "../config/database"
);

const Cuti = sequelize.define(
    "Cuti",
    {
        id_cuti: {
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

        no_cuti: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },

        tgl_pengajuan: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        jenis_cuti: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        perihal: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },

        tgl_mulai: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        tgl_selesai: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        lama_hari: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },

        contact_alamat: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },

        sisa_cuti_sebelum: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "Snapshot sisa hak cuti sebelum pengajuan",
        },

        sisa_cuti_setelah: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "Snapshot sisa hak cuti pasca pengajuan",
        },
        id_project: { type: DataTypes.INTEGER, allowNull: true, references: { model: "m_project", key: "id_project" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },

        nomor_telepon_darurat: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },

        maker_signature: { type: DataTypes.STRING(500), allowNull: true },
        checker_signature: { type: DataTypes.STRING(500), allowNull: true },
        verification_signature: { type: DataTypes.STRING(500), allowNull: true },
        approval_1_signature: { type: DataTypes.STRING(500), allowNull: true },
        approval_2_signature: { type: DataTypes.STRING(500), allowNull: true },
        approval_3_signature: { type: DataTypes.STRING(500), allowNull: true },

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
        tableName: "t_cuti",

        timestamps: true,

        createdAt: "created_at",

        updatedAt: "updated_at",

        indexes: [
            {
                unique: true,
                name: "uk_cuti_no_cuti",
                fields: [
                    "no_cuti",
                ],
            },

            {
                name: "idx_cuti_petugas",
                fields: [
                    "id_petugas",
                ],
            },

            {
                name: "idx_cuti_status",
                fields: [
                    "id_status",
                ],
            },

            {
                name: "idx_cuti_jenis",
                fields: [
                    "jenis_cuti",
                ],
            },

            {
                name: "idx_cuti_tanggal",
                fields: [
                    "tgl_mulai",
                    "tgl_selesai",
                ],
            },

            {
                name: "idx_cuti_petugas_tanggal",
                fields: [
                    "id_petugas",
                    "tgl_mulai",
                    "tgl_selesai",
                ],
            },
        ],
    }
);

module.exports = Cuti;

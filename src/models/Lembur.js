const {
    DataTypes,
} = require("sequelize");

const sequelize = require(
    "../config/database"
);

const Lembur = sequelize.define(
    "Lembur",
    {
        id_lembur: {
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
        id_project: { type: DataTypes.INTEGER, allowNull: true, references: { model: "m_project", key: "id_project" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },

        id_petugas_cuti: {
            type: DataTypes.INTEGER,
            allowNull: true,

            references: {
                model: "m_petugas",
                key: "id_petugas",
            },

            onUpdate: "CASCADE",
            onDelete: "SET NULL",
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

        tgl_lembur: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        jam_mulai: {
            type: DataTypes.TIME,
            allowNull: false,
        },

        jam_selesai: {
            type: DataTypes.TIME,
            allowNull: false,
        },

        total_jam: {
            type: DataTypes.DECIMAL(
                6,
                2
            ),
            allowNull: false,
            defaultValue: 0,
        },

        biaya_lembur: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            comment: "Biaya lembur berdasarkan jam efektif dan tarif upah saat transaksi",
        },

        kategori_lembur: {
            type: DataTypes.STRING(1000),
            allowNull: false,
        },

        jenis_pekerjaan: {
            type: DataTypes.STRING(1000),
            allowNull: true,
        },

        area_group: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },

        is_hari_libur: {
            type: DataTypes.ENUM("Y", "N"),
            allowNull: false,
            defaultValue: "N",
        },

        detail_pekerjaan_lembur: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        foto_kegiatan_1: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },

        foto_kegiatan_2: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },

        surat_perintah_lembur: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },

        maker_signature: { type: DataTypes.STRING(500), allowNull: true },
        checker_signature: { type: DataTypes.STRING(500), allowNull: true },
        verification_signature: { type: DataTypes.STRING(500), allowNull: true },
        approval_1_signature: { type: DataTypes.STRING(500), allowNull: true },
        approval_2_signature: { type: DataTypes.STRING(500), allowNull: true },
        approval_3_signature: { type: DataTypes.STRING(500), allowNull: true },

        jumlah_jam_koreksi: {
            type: DataTypes.DECIMAL(6, 2),
            allowNull: true,
        },

        catatan_koreksi: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        nomor_dokumen: {
            type: DataTypes.STRING(150),
            allowNull: true,
            unique: true,
        },

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
        tableName: "t_lembur",

        timestamps: true,

        createdAt: "created_at",

        updatedAt: "updated_at",

        indexes: [
            {
                name: "idx_lembur_petugas",
                fields: [
                    "id_petugas",
                ],
            },

            {
                name: "idx_lembur_status",
                fields: [
                    "id_status",
                ],
            },

            {
                name: "idx_lembur_petugas_cuti",
                fields: [
                    "id_petugas_cuti",
                ],
            },

            {
                name: "idx_lembur_tanggal",
                fields: [
                    "tgl_lembur",
                ],
            },

            {
                name: "idx_lembur_petugas_tanggal",
                fields: [
                    "id_petugas",
                    "tgl_lembur",
                ],
            },
        ],
    }
);

module.exports = Lembur;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Pegawai = sequelize.define(
    "Pegawai",
    {
        id_pegawai: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        id_jabatan: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        id_unit: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        nip: {
            type: DataTypes.STRING(12),
            allowNull: false,
            unique: true,
        },

        nama: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        tgl_masuk: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        tgl_lahir: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },

        is_active: {
            type: DataTypes.ENUM("Y", "N"),
            allowNull: false,
            defaultValue: "Y",
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
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },

        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "m_pegawai",
        freezeTableName: true,
        timestamps: false,

        indexes: [
            {
                unique: true,
                fields: ["nip"],
                name: "uk_pegawai_nip",
            },
            {
                fields: ["id_jabatan"],
                name: "idx_pegawai_jabatan",
            },
            {
                fields: ["id_unit"],
                name: "idx_pegawai_unit",
            },
            {
                fields: ["is_active"],
                name: "idx_pegawai_active",
            },
        ],
    }
);

module.exports = Pegawai;

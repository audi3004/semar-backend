const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Mutasi = sequelize.define(
    "Mutasi",
    {
        id_mutasi: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        id_pegawai: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        id_petugas: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        id_unit_sebelum: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        id_unit_sesudah: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        tanggal_mutasi: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        keterangan: {
            type: DataTypes.STRING(500),
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
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },

        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "t_mutasi",
        freezeTableName: true,
        timestamps: false,

        indexes: [
            {
                fields: ["id_pegawai"],
                name: "idx_mutasi_pegawai",
            },
            {
                fields: ["id_petugas"],
                name: "idx_mutasi_petugas",
            },
            {
                fields: ["id_unit_sebelum"],
                name: "idx_mutasi_unit_sebelum",
            },
            {
                fields: ["id_unit_sesudah"],
                name: "idx_mutasi_unit_sesudah",
            },
        ],
    }
);

module.exports = Mutasi;

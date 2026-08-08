const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Module = sequelize.define(
    "Module",
    {
        id_module: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        kode_module: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },

        nama_module: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        deskripsi: {
            type: DataTypes.STRING(255),
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
        tableName: "m_module",
        freezeTableName: true,
        timestamps: false,

        indexes: [
            {
                unique: true,
                fields: ["kode_module"],
                name: "uk_module_kode",
            },
            {
                fields: ["is_active"],
                name: "idx_module_active",
            },
        ],
    }
);

module.exports = Module;
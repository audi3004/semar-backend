const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Jabatan = sequelize.define(
    "Jabatan",
    {
        id_jabatan: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        nama_jabatan: {
            type: DataTypes.STRING(100),
            allowNull: false,
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
        tableName: "m_jabatan",
        freezeTableName: true,
        timestamps: false,

        indexes: [
            {
                fields: ["is_active"],
                name: "idx_jabatan_active",
            },
        ],
    }
);

module.exports = Jabatan;

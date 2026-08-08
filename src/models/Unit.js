const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Unit = sequelize.define(
    "Unit",
    {
        id_unit: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        id_induk_unit: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        nama_unit: {
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
        tableName: "m_unit",
        freezeTableName: true,
        timestamps: false,

        indexes: [
            {
                fields: ["id_induk_unit"],
                name: "idx_unit_induk",
            },
            {
                fields: ["is_active"],
                name: "idx_unit_active",
            },
        ],
    }
);

module.exports = Unit;

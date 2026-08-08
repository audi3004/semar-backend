const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AccessModule = sequelize.define(
    "AccessModule",
    {
        id_access: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        id_role: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        id_module: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        can_create: {
            type: DataTypes.ENUM("Y", "N"),
            allowNull: false,
            defaultValue: "N",
        },

        can_read: {
            type: DataTypes.ENUM("Y", "N"),
            allowNull: false,
            defaultValue: "N",
        },

        can_update: {
            type: DataTypes.ENUM("Y", "N"),
            allowNull: false,
            defaultValue: "N",
        },

        can_delete: {
            type: DataTypes.ENUM("Y", "N"),
            allowNull: false,
            defaultValue: "N",
        },

        can_approve: {
            type: DataTypes.ENUM("Y", "N"),
            allowNull: false,
            defaultValue: "N",
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
        tableName: "m_access_module",
        freezeTableName: true,
        timestamps: false,

        indexes: [
            {
                unique: true,
                fields: ["id_role", "id_module"],
                name: "uk_role_module",
            },
            {
                fields: ["id_role"],
                name: "idx_access_role",
            },
            {
                fields: ["id_module"],
                name: "idx_access_module",
            },
        ],
    }
);

module.exports = AccessModule;
const {
    DataTypes,
} = require("sequelize");

const sequelize = require(
    "../config/database"
);

const UnitRole = sequelize.define(
    "UnitRole",
    {
        id_unit_role: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        id_user: {
            type: DataTypes.INTEGER,
            allowNull: false,

            references: {
                model: "m_user",
                key: "id_user",
            },

            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },

        id_unit: {
            type: DataTypes.INTEGER,
            allowNull: false,

            references: {
                model: "m_unit",
                key: "id_unit",
            },

            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },

        id_role: {
            type: DataTypes.INTEGER,
            allowNull: false,

            references: {
                model: "m_role",
                key: "id_role",
            },

            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },

        is_active: {
            type: DataTypes.ENUM(
                "Y",
                "N"
            ),
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
            allowNull: true,
        },

        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "m_unit_role",

        timestamps: true,

        createdAt: "created_at",

        updatedAt: "updated_at",

        indexes: [
            {
                unique: true,
                name: "uk_unit_role_user_unit_role",
                fields: [
                    "id_user",
                    "id_unit",
                    "id_role",
                ],
            },

            {
                name: "idx_unit_role_user",
                fields: [
                    "id_user",
                ],
            },

            {
                name: "idx_unit_role_unit",
                fields: [
                    "id_unit",
                ],
            },

            {
                name: "idx_unit_role_role",
                fields: [
                    "id_role",
                ],
            },

            {
                name: "idx_unit_role_active",
                fields: [
                    "is_active",
                ],
            },

            {
                name: "idx_unit_role_unit_role_active",
                fields: [
                    "id_unit",
                    "id_role",
                    "is_active",
                ],
            },
        ],
    }
);

module.exports = UnitRole;
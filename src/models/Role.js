const {
    DataTypes,
} = require(
    "sequelize"
);

const sequelize = require(
    "../config/database"
);

const Role = sequelize.define(
    "Role",
    {
        id_role: {
            type:
                DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        kode_role: {
            type:
                DataTypes.STRING(
                    50
                ),
            allowNull: false,
            unique: true,
        },

        nama_role: {
            type:
                DataTypes.STRING(
                    100
                ),
            allowNull: false,
        },

        level_role: {
            type:
                DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },

        is_super_admin: {
            type:
                DataTypes.ENUM(
                    "Y",
                    "N"
                ),
            allowNull: false,
            defaultValue: "N",
        },

        is_active: {
            type:
                DataTypes.ENUM(
                    "Y",
                    "N"
                ),
            allowNull: false,
            defaultValue: "Y",
        },

        created_at: {
            type:
                DataTypes.DATE,
            allowNull: false,
            defaultValue:
                DataTypes.NOW,
        },

        created_by: {
            type:
                DataTypes.INTEGER,
            allowNull: true,
        },

        updated_at: {
            type:
                DataTypes.DATE,
            allowNull: true,
        },

        updated_by: {
            type:
                DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName:
            "m_role",

        timestamps: true,

        createdAt:
            "created_at",

        updatedAt:
            "updated_at",

        indexes: [
            {
                unique: true,
                name:
                    "uk_role_kode_role",
                fields: [
                    "kode_role",
                ],
            },

            {
                name:
                    "idx_role_nama_role",
                fields: [
                    "nama_role",
                ],
            },

            {
                name:
                    "idx_role_level_role",
                fields: [
                    "level_role",
                ],
            },

            {
                name:
                    "idx_role_super_admin",
                fields: [
                    "is_super_admin",
                ],
            },

            {
                name:
                    "idx_role_is_active",
                fields: [
                    "is_active",
                ],
            },
        ],
    }
);

module.exports = Role;
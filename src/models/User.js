const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
    "User",
    {
        id_user: {
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

        id_role: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },

        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        refresh_token_hash: {
            type: DataTypes.STRING(64),
            allowNull: true,
        },

        refresh_token_expires_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: {
                isEmail: true,
            },
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
        tableName: "m_user",
        freezeTableName: true,
        timestamps: false,

        indexes: [
            {
                unique: true,
                fields: ["username"],
                name: "uk_user_username",
            },
            {
                unique: true,
                fields: ["id_pegawai"],
                name: "uk_user_pegawai",
            },
            {
                unique: true,
                fields: ["id_petugas"],
                name: "uk_user_petugas",
            },
            {
                fields: ["id_role"],
                name: "idx_user_role",
            },
            {
                fields: ["is_active"],
                name: "idx_user_active",
            },
            {
                fields: [
                    "refresh_token_expires_at",
                ],
                name: "idx_user_refresh_token_expires_at",
            },
        ],
    }
);

module.exports = User;

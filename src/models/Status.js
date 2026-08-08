const {
    DataTypes,
} = require("sequelize");

const sequelize = require(
    "../config/database"
);

const Status = sequelize.define(
    "Status",
    {
        id_status: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },


        id_role: {
            type: DataTypes.INTEGER,
            allowNull: true,

            references: {
                model: "m_role",
                key: "id_role",
            },

            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },

        kode_status: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },

        nama_status: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },

        /*
        |--------------------------------------------------------------------------
        | URUTAN STATUS
        |--------------------------------------------------------------------------
        |
        | Hanya digunakan untuk pengurutan tampilan.
        | Perpindahan status tetap menggunakan id_status_next.
        |
        */

        urutan_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },

        /*
        |--------------------------------------------------------------------------
        | STATUS BERIKUTNYA
        |--------------------------------------------------------------------------
        */

        id_status_next: {
            type: DataTypes.INTEGER,
            allowNull: true,

            references: {
                model: "m_status",
                key: "id_status",
            },

            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },

        /*
        |--------------------------------------------------------------------------
        | STATUS REVISI
        |--------------------------------------------------------------------------
        */

        id_status_revision: {
            type: DataTypes.INTEGER,
            allowNull: true,

            references: {
                model: "m_status",
                key: "id_status",
            },

            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },

        /*
        |--------------------------------------------------------------------------
        | STATUS PENOLAKAN
        |--------------------------------------------------------------------------
        */

        id_status_rejected: {
            type: DataTypes.INTEGER,
            allowNull: true,

            references: {
                model: "m_status",
                key: "id_status",
            },

            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },

        is_initial: {
            type: DataTypes.ENUM(
                "Y",
                "N"
            ),
            allowNull: false,
            defaultValue: "N",
        },

        is_final: {
            type: DataTypes.ENUM(
                "Y",
                "N"
            ),
            allowNull: false,
            defaultValue: "N",
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
        tableName: "m_status",

        timestamps: true,

        createdAt: "created_at",

        updatedAt: "updated_at",

        indexes: [
            {
                unique: true,
                name: "uk_status_kode_status",
                fields: [
                    "kode_status",
                ],
            },

            {
                unique: true,
                name: "uk_status_urutan_status",
                fields: [
                    "urutan_status",
                ],
            },

            {
                name: "idx_status_nama_status",
                fields: [
                    "nama_status",
                ],
            },

            {
                name: "idx_status_id_role",
                fields: [
                    "id_role",
                ],
            },

            {
                name: "idx_status_next",
                fields: [
                    "id_status_next",
                ],
            },

            {
                name: "idx_status_revision",
                fields: [
                    "id_status_revision",
                ],
            },

            {
                name: "idx_status_rejected",
                fields: [
                    "id_status_rejected",
                ],
            },

            {
                name: "idx_status_initial",
                fields: [
                    "is_initial",
                ],
            },

            {
                name: "idx_status_final",
                fields: [
                    "is_final",
                ],
            },

            {
                name: "idx_status_active",
                fields: [
                    "is_active",
                ],
            },
        ],
    }
);

module.exports = Status;
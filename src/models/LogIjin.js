const {
    DataTypes,
} = require("sequelize");

const sequelize = require(
    "../config/database"
);

const LogIjin = sequelize.define(
    "LogIjin",
    {
        id_log_ijin: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        id_ijin: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        id_status_sebelum: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "m_status",
                key: "id_status",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },

        id_status_sesudah: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "m_status",
                key: "id_status",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },

        aksi: {
            type: DataTypes.ENUM(
                "CREATE",
                "UPDATE",
                "NEXT",
                "REVISION",
                "REJECT",
                "DELETE"
            ),
            allowNull: false,
        },

        keterangan: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },

        data_sebelum: {
            type: DataTypes.JSON,
            allowNull: true,
        },

        data_sesudah: {
            type: DataTypes.JSON,
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
            references: {
                model: "m_user",
                key: "id_user",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
    },
    {
        tableName: "t_log_ijin",
        timestamps: false,
        indexes: [
            {
                name: "idx_log_ijin_ijin",
                fields: [
                    "id_ijin",
                ],
            },
            {
                name: "idx_log_ijin_aksi",
                fields: [
                    "aksi",
                ],
            },
            {
                name: "idx_log_ijin_status_sebelum",
                fields: [
                    "id_status_sebelum",
                ],
            },
            {
                name: "idx_log_ijin_status_sesudah",
                fields: [
                    "id_status_sesudah",
                ],
            },
            {
                name: "idx_log_ijin_created_at",
                fields: [
                    "created_at",
                ],
            },
        ],
    }
);

module.exports = LogIjin;

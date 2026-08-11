const {
    DataTypes,
} = require("sequelize");

const sequelize = require(
    "../config/database"
);

const Umk = sequelize.define(
    "Umk",
    {
        id_umk: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        id_umk_sebelumnya: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: "m_umk", key: "id_umk" },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },

        jenis_wilayah: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },

        nama_wilayah: {
            type: DataTypes.STRING(100),
            allowNull: false,

        },

        tahun_umk: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        nominal_umk: {
            type: DataTypes.DECIMAL(
                15,
                2
            ),
            allowNull: false,
            defaultValue: 0,
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
            defaultValue:
                DataTypes.NOW,
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
        tableName: "m_umk",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",

        indexes: [
            {
                unique: true,
                name:
                    "uk_umk_wilayah_tahun",
                fields: [
                    "jenis_wilayah",
                    "nama_wilayah",
                    "tahun_umk",
                ],
            },
            {
                name:
                    "idx_umk_tahun",
                fields: [
                    "tahun_umk",
                ],
            },
            {
                name:
                    "idx_umk_wilayah",
                fields: [
                    "jenis_wilayah",
                    "nama_wilayah",
                ],
            },
        ],
    }
);

module.exports = Umk;

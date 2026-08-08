const {
    DataTypes,
} = require("sequelize");

const sequelize = require(
    "../config/database"
);

const HariLibur = sequelize.define(
    "HariLibur",
    {
        id_hari_libur: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        tanggal: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            unique: true,
        },

        nama_hari_libur: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },

        keterangan: {
            type: DataTypes.TEXT,
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
            allowNull: true,
        },

        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "m_hari_libur",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [
            {
                unique: true,
                name: "uk_hari_libur_tanggal",
                fields: ["tanggal"],
            },
            {
                name: "idx_hari_libur_active",
                fields: ["is_active"],
            },
        ],
    }
);

module.exports = HariLibur;

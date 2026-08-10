const { DataTypes } = require("sequelize");

const sequelize = require(
    "../config/database"
);

const KoefTmk = sequelize.define(
    "KoefTmk",
    {
        id_koef_tmk: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        masa_kerja: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
            },
            comment: "Batas minimum masa kerja dalam tahun penuh",
        },

        koef: {
            type: DataTypes.DECIMAL(8, 4),
            allowNull: false,
            defaultValue: 0,
            comment: "Nilai koefisien dalam persen",
        },

        tmk: {
            type: DataTypes.DECIMAL(8, 4),
            allowNull: false,
            defaultValue: 0,
            comment: "Nilai TMK dalam persen",
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
        tableName: "m_koef_tmk",

        timestamps: true,

        createdAt: "created_at",

        updatedAt: "updated_at",

        indexes: [
            {
                unique: true,
                name: "uk_koef_tmk_masa_kerja",
                fields: ["masa_kerja"],
            },

            {
                name: "idx_koef_tmk_active",
                fields: ["is_active"],
            },
        ],
    }
);

module.exports = KoefTmk;

const { DataTypes } = require(
    "sequelize"
);

const sequelize = require(
    "../config/database"
);

const Gaji = sequelize.define(
    "Gaji",
    {
        id_gaji: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        id_umk: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "m_umk",
                key: "id_umk",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },

        id_koef_tmk: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "koef_tmk",
                key: "id_koef_tmk",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },

        gaji_pokok: {
            type: DataTypes.DECIMAL(
                15,
                2
            ),
            allowNull: true,
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
        tableName: "m_gaji",

        timestamps: true,

        createdAt: "created_at",

        updatedAt: "updated_at",

        indexes: [
            {
                name: "idx_gaji_umk",
                fields: ["id_umk"],
            },

            {
                name: "idx_gaji_koef_tmk",
                fields: [
                    "id_koef_tmk",
                ],
            },

            {
                name: "idx_gaji_active",
                fields: ["is_active"],
            },

            {
                unique: true,
                name: "uk_gaji_umk_koef_tmk",
                fields: [
                    "id_umk",
                    "id_koef_tmk",
                ],
            },
        ],
    }
);

module.exports = Gaji;
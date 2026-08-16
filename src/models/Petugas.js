const {
    DataTypes,
} = require(
    "sequelize"
);

const sequelize = require(
    "../config/database"
);

const Petugas =
    sequelize.define(
        "Petugas",
        {
            id_petugas: {
                type:
                    DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            id_unit: {
                type:
                    DataTypes.INTEGER,
                allowNull: false,

                references: {
                    model:
                        "m_unit",
                    key:
                        "id_unit",
                },

                onUpdate:
                    "CASCADE",

                onDelete:
                    "RESTRICT",
            },

            id_jabatan: {
                type:
                    DataTypes.INTEGER,
                allowNull: true,

                references: {
                    model:
                        "m_jabatan",
                    key:
                        "id_jabatan",
                },

                onUpdate:
                    "CASCADE",

                onDelete:
                    "SET NULL",
            },

            id_umk: {
                type:
                    DataTypes.INTEGER,
                allowNull: true,

                references: {
                    model:
                        "m_umk",
                    key:
                        "id_umk",
                },

                onUpdate:
                    "CASCADE",

                onDelete:
                    "RESTRICT",
            },

            nip: {
                type:
                    DataTypes.STRING(
                        50
                    ),
                allowNull: false,
                unique: true,
            },

            nama: {
                type:
                    DataTypes.STRING(
                        150
                    ),
                allowNull: false,
            },

            tgl_masuk: {
                type:
                    DataTypes.DATEONLY,
                allowNull: false,
            },

            id_project: {
                type: DataTypes.INTEGER, allowNull: false,
                references: { model: "m_project", key: "id_project" },
                onUpdate: "CASCADE", onDelete: "RESTRICT",
            },

            tgl_lahir: {
                type:
                    DataTypes.DATEONLY,
                allowNull: true,
            },

            is_active: {
                type:
                    DataTypes.ENUM(
                        "Y",
                        "N"
                    ),
                allowNull: false,
                defaultValue:
                    "Y",
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
                "m_petugas",

            timestamps: true,

            createdAt:
                "created_at",

            updatedAt:
                "updated_at",

            indexes: [
                {
                    unique: true,
                    name:
                        "uk_petugas_nip",
                    fields: [
                        "nip",
                    ],
                },

                {
                    name:
                        "idx_petugas_unit",
                    fields: [
                        "id_unit",
                    ],
                },
                { name: "idx_petugas_project", fields: ["id_project"] },

                {
                    name:
                        "idx_petugas_jabatan",
                    fields: [
                        "id_jabatan",
                    ],
                },

                {
                    name:
                        "idx_petugas_umk",
                    fields: [
                        "id_umk",
                    ],
                },

                {
                    name:
                        "idx_petugas_active",
                    fields: [
                        "is_active",
                    ],
                },
            ],
        }
    );

module.exports = Petugas;

"use strict";

const {
    DataTypes,
} = require("sequelize");

async function getColumns(
    queryInterface,
    tableName
) {
    return await queryInterface
        .describeTable(tableName);
}

async function hasColumn(
    queryInterface,
    tableName,
    columnName
) {
    const columns = await getColumns(
        queryInterface,
        tableName
    );
    return Boolean(columns[columnName]);
}

async function hasTable(
    queryInterface,
    tableName
) {
    const tables =
        await queryInterface
            .showAllTables();
    return tables.some(
        (table) =>
            String(
                table.tableName ?? table
            ).toLowerCase() ===
            tableName.toLowerCase()
    );
}

async function hasIndex(
    queryInterface,
    tableName,
    indexName
) {
    const indexes =
        await queryInterface
            .showIndex(tableName);
    return indexes.some(
        (index) =>
            index.name === indexName
    );
}

async function hasForeignKey(
    queryInterface,
    tableName,
    columnName
) {
    const references =
        await queryInterface
            .getForeignKeyReferencesForTable(
                tableName
            );
    return references.some(
        (reference) =>
            reference.columnName ===
            columnName
    );
}

async function removeForeignKeys(
    queryInterface,
    tableName,
    columnName
) {
    const references =
        await queryInterface
            .getForeignKeyReferencesForTable(
                tableName
            );

    for (const reference of references) {
        if (
            reference.columnName ===
            columnName
        ) {
            await queryInterface
                .removeConstraint(
                    tableName,
                    reference.constraintName
                );
        }
    }
}

module.exports = {
    async up(queryInterface) {
        if (
            !await hasColumn(
                queryInterface,
                "m_petugas",
                "id_umk"
            )
        ) {
            await queryInterface.addColumn(
                "m_petugas",
                "id_umk",
                {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                }
            );
        }

        if (
            await hasColumn(
                queryInterface,
                "m_petugas",
                "id_gaji"
            )
        ) {
            await queryInterface.sequelize
                .query(
                    `UPDATE m_petugas AS p
                     INNER JOIN m_gaji AS g
                        ON g.id_gaji = p.id_gaji
                     SET p.id_umk = g.id_umk
                     WHERE p.id_umk IS NULL`
                );
        }

        const petugasColumns =
            await getColumns(
                queryInterface,
                "m_petugas"
            );

        if (
            petugasColumns.id_umk
                .allowNull
        ) {
            await queryInterface.changeColumn(
                "m_petugas",
                "id_umk",
                {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                }
            );
        }

        if (
            !await hasForeignKey(
                queryInterface,
                "m_petugas",
                "id_umk"
            )
        ) {
            await queryInterface
                .addConstraint(
                    "m_petugas",
                    {
                        fields: ["id_umk"],
                        type: "foreign key",
                        name: "fk_petugas_umk",
                        references: {
                            table: "m_umk",
                            field: "id_umk",
                        },
                        onUpdate: "CASCADE",
                        onDelete: "RESTRICT",
                    }
                );
        }

        if (
            await hasColumn(
                queryInterface,
                "m_petugas",
                "id_gaji"
            )
        ) {
            await removeForeignKeys(
                queryInterface,
                "m_petugas",
                "id_gaji"
            );
            if (
                await hasIndex(
                    queryInterface,
                    "m_petugas",
                    "idx_petugas_gaji"
                )
            ) {
                await queryInterface
                    .removeIndex(
                        "m_petugas",
                        "idx_petugas_gaji"
                    );
            }
            await queryInterface.removeColumn(
                "m_petugas",
                "id_gaji"
            );
        }

        if (
            !await hasIndex(
                queryInterface,
                "m_petugas",
                "idx_petugas_umk"
            ) &&
            !await hasIndex(
                queryInterface,
                "m_petugas",
                "id_umk"
            )
        ) {
            await queryInterface.addIndex(
                "m_petugas",
                ["id_umk"],
                {
                    name:
                        "idx_petugas_umk",
                }
            );
        }

        if (
            !await hasColumn(
                queryInterface,
                "t_lembur",
                "id_petugas_cuti"
            )
        ) {
            await queryInterface.addColumn(
                "t_lembur",
                "id_petugas_cuti",
                {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "m_petugas",
                        key: "id_petugas",
                    },
                    onUpdate: "CASCADE",
                    onDelete: "SET NULL",
                    after: "id_petugas",
                }
            );
        }
        if (
            !await hasIndex(
                queryInterface,
                "t_lembur",
                "idx_lembur_petugas_cuti"
            ) &&
            !await hasIndex(
                queryInterface,
                "t_lembur",
                "id_petugas_cuti"
            )
        ) {
            await queryInterface.addIndex(
                "t_lembur",
                ["id_petugas_cuti"],
                {
                    name:
                        "idx_lembur_petugas_cuti",
                }
            );
        }

        if (
            await hasColumn(
                queryInterface,
                "t_lembur",
                "keperluan"
            )
        ) {
            await queryInterface.renameColumn(
                "t_lembur",
                "keperluan",
                "kategori_lembur"
            );
        }
        if (
            await hasColumn(
                queryInterface,
                "t_lembur",
                "bukti"
            )
        ) {
            await queryInterface.renameColumn(
                "t_lembur",
                "bukti",
                "detail_pekerjaan_lembur"
            );
            await queryInterface.changeColumn(
                "t_lembur",
                "detail_pekerjaan_lembur",
                {
                    type: DataTypes.TEXT,
                    allowNull: true,
                }
            );
        }
        if (
            await hasColumn(
                queryInterface,
                "t_lembur",
                "lokasi"
            )
        ) {
            await queryInterface.removeColumn(
                "t_lembur",
                "lokasi"
            );
        }

        if (
            !await hasTable(
                queryInterface,
                "m_hari_libur"
            )
        ) {
            await queryInterface.createTable(
                "m_hari_libur",
                {
                    id_hari_libur: {
                        type: DataTypes.INTEGER,
                        primaryKey: true,
                        autoIncrement: true,
                        allowNull: false,
                    },
                    tanggal: {
                        type: DataTypes.DATEONLY,
                        allowNull: false,
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
                }
            );
        }

        if (
            !await hasIndex(
                queryInterface,
                "m_hari_libur",
                "uk_hari_libur_tanggal"
            )
        ) {
            await queryInterface.addIndex(
                "m_hari_libur",
                ["tanggal"],
                {
                    name:
                        "uk_hari_libur_tanggal",
                    unique: true,
                }
            );
        }
        if (
            !await hasIndex(
                queryInterface,
                "m_hari_libur",
                "idx_hari_libur_active"
            )
        ) {
            await queryInterface.addIndex(
                "m_hari_libur",
                ["is_active"],
                {
                    name:
                        "idx_hari_libur_active",
                }
            );
        }
    },

    async down(queryInterface) {
        await queryInterface.dropTable(
            "m_hari_libur"
        );

        await queryInterface.addColumn(
            "t_lembur",
            "lokasi",
            {
                type: DataTypes.STRING(300),
                allowNull: true,
            }
        );
        await queryInterface.changeColumn(
            "t_lembur",
            "detail_pekerjaan_lembur",
            {
                type: DataTypes.STRING(500),
                allowNull: true,
            }
        );
        await queryInterface.renameColumn(
            "t_lembur",
            "detail_pekerjaan_lembur",
            "bukti"
        );
        await queryInterface.renameColumn(
            "t_lembur",
            "kategori_lembur",
            "keperluan"
        );
        await removeForeignKeys(
            queryInterface,
            "t_lembur",
            "id_petugas_cuti"
        );
        await queryInterface.removeIndex(
            "t_lembur",
            "idx_lembur_petugas_cuti"
        );
        await queryInterface.removeColumn(
            "t_lembur",
            "id_petugas_cuti"
        );

        await queryInterface.addColumn(
            "m_petugas",
            "id_gaji",
            {
                type: DataTypes.INTEGER,
                allowNull: true,
            }
        );
        await queryInterface.sequelize
            .query(
                `UPDATE m_petugas AS p
                 SET p.id_gaji = (
                    SELECT MIN(g.id_gaji)
                    FROM m_gaji AS g
                    WHERE g.id_umk = p.id_umk
                 )`
            );
        await queryInterface.changeColumn(
            "m_petugas",
            "id_gaji",
            {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "m_gaji",
                    key: "id_gaji",
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            }
        );
        await removeForeignKeys(
            queryInterface,
            "m_petugas",
            "id_umk"
        );
        await queryInterface.removeIndex(
            "m_petugas",
            "idx_petugas_umk"
        );
        await queryInterface.removeColumn(
            "m_petugas",
            "id_umk"
        );
        await queryInterface.addIndex(
            "m_petugas",
            ["id_gaji"],
            {
                name: "idx_petugas_gaji",
            }
        );
    },
};

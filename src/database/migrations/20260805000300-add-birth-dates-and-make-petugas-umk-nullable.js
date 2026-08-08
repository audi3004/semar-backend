"use strict";

const {
    DataTypes,
} = require("sequelize");

async function hasColumn(
    queryInterface,
    tableName,
    columnName
) {
    const columns =
        await queryInterface
            .describeTable(tableName);
    return Boolean(columns[columnName]);
}

module.exports = {
    async up(queryInterface) {
        await queryInterface.changeColumn(
            "m_petugas",
            "id_umk",
            {
                type: DataTypes.INTEGER,
                allowNull: true,
            }
        );

        if (
            !await hasColumn(
                queryInterface,
                "m_petugas",
                "tgl_lahir"
            )
        ) {
            await queryInterface.addColumn(
                "m_petugas",
                "tgl_lahir",
                {
                    type: DataTypes.DATEONLY,
                    allowNull: true,
                    after: "tgl_masuk",
                }
            );
        }

        if (
            !await hasColumn(
                queryInterface,
                "m_pegawai",
                "tgl_lahir"
            )
        ) {
            await queryInterface.addColumn(
                "m_pegawai",
                "tgl_lahir",
                {
                    type: DataTypes.DATEONLY,
                    allowNull: true,
                    after: "tgl_masuk",
                }
            );
        }
    },

    async down(queryInterface) {
        if (
            await hasColumn(
                queryInterface,
                "m_pegawai",
                "tgl_lahir"
            )
        ) {
            await queryInterface.removeColumn(
                "m_pegawai",
                "tgl_lahir"
            );
        }

        if (
            await hasColumn(
                queryInterface,
                "m_petugas",
                "tgl_lahir"
            )
        ) {
            await queryInterface.removeColumn(
                "m_petugas",
                "tgl_lahir"
            );
        }

        await queryInterface.changeColumn(
            "m_petugas",
            "id_umk",
            {
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        );
    },
};

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
        if (
            !await hasColumn(
                queryInterface,
                "m_koef_tmk",
                "keterangan"
            )
        ) {
            await queryInterface.addColumn(
                "m_koef_tmk",
                "keterangan",
                {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    after: "tmk",
                }
            );
        }
    },

    async down(queryInterface) {
        if (
            await hasColumn(
                queryInterface,
                "m_koef_tmk",
                "keterangan"
            )
        ) {
            await queryInterface.removeColumn(
                "m_koef_tmk",
                "keterangan"
            );
        }
    },
};

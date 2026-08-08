"use strict";

const {
    DataTypes,
} = require("sequelize");

async function hasColumn(
    queryInterface,
    tableName,
    columnName
) {
    const table =
        await queryInterface
            .describeTable(
                tableName
            );

    return Boolean(
        table[columnName]
    );
}

module.exports = {
    async up(
        queryInterface
    ) {
        const tableName = "m_user";

        if (
            !(await hasColumn(
                queryInterface,
                tableName,
                "refresh_token_hash"
            ))
        ) {
            await queryInterface
                .addColumn(
                    tableName,
                    "refresh_token_hash",
                    {
                        type:
                            DataTypes.STRING(
                                64
                            ),
                        allowNull: true,
                    }
                );
        }

        if (
            !(await hasColumn(
                queryInterface,
                tableName,
                "refresh_token_expires_at"
            ))
        ) {
            await queryInterface
                .addColumn(
                    tableName,
                    "refresh_token_expires_at",
                    {
                        type:
                            DataTypes.DATE,
                        allowNull: true,
                    }
                );
        }
    },

    async down(
        queryInterface
    ) {
        const tableName = "m_user";

        if (
            await hasColumn(
                queryInterface,
                tableName,
                "refresh_token_expires_at"
            )
        ) {
            await queryInterface
                .removeColumn(
                    tableName,
                    "refresh_token_expires_at"
                );
        }

        if (
            await hasColumn(
                queryInterface,
                tableName,
                "refresh_token_hash"
            )
        ) {
            await queryInterface
                .removeColumn(
                    tableName,
                    "refresh_token_hash"
                );
        }
    },
};

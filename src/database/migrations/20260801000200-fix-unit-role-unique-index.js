"use strict";

const TABLE_NAME = "m_unit_role";
const LEGACY_INDEX =
    "m_unit_role_id_unit_id_user_unique";

module.exports = {
    async up(
        queryInterface
    ) {
        await queryInterface
            .removeIndex(
                TABLE_NAME,
                LEGACY_INDEX
            );
    },

    async down(
        queryInterface
    ) {
        await queryInterface
            .addIndex(
                TABLE_NAME,
                [
                    "id_user",
                    "id_unit",
                ],
                {
                    name:
                        LEGACY_INDEX,
                    unique: true,
                }
            );
    },
};

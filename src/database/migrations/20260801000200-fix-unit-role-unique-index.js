"use strict";

const TABLE_NAME = "m_unit_role";
const LEGACY_INDEX =
    "m_unit_role_id_unit_id_user_unique";

module.exports = {
    async up(
        queryInterface
    ) {
        const indexes = await queryInterface.showIndex(TABLE_NAME);
        if (indexes.some((index) => index.name === LEGACY_INDEX)) {
            await queryInterface.removeIndex(TABLE_NAME, LEGACY_INDEX);
        }
    },

    async down(
        queryInterface
    ) {
        const indexes = await queryInterface.showIndex(TABLE_NAME);
        if (!indexes.some((index) => index.name === LEGACY_INDEX)) {
            await queryInterface.addIndex(
                TABLE_NAME,
                ["id_user", "id_unit"],
                { name: LEGACY_INDEX, unique: true }
            );
        }
    },
};

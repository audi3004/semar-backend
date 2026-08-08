"use strict";

const hasColumn = async (
    connection,
    tableName,
    columnName
) => {
    const rows = await connection.query(
        `SHOW COLUMNS FROM \`${tableName}\` LIKE ?`,
        [columnName]
    );

    return rows.length > 0;
};

module.exports = {
    async up(queryInterface) {
        const connection =
            await queryInterface.sequelize.connectionManager
                .getConnection();

        try {
            if (
                !(await hasColumn(
                    connection,
                    "t_lembur",
                    "foto_kegiatan_1"
                ))
            ) {
                await connection.query(
                    "ALTER TABLE `t_lembur` ADD `foto_kegiatan_1` VARCHAR(500) NOT NULL"
                );
            }

            if (
                !(await hasColumn(
                    connection,
                    "t_lembur",
                    "foto_kegiatan_2"
                ))
            ) {
                await connection.query(
                    "ALTER TABLE `t_lembur` ADD `foto_kegiatan_2` VARCHAR(500) NOT NULL"
                );
            }

            if (
                !(await hasColumn(
                    connection,
                    "t_lembur",
                    "surat_perintah_lembur"
                ))
            ) {
                await connection.query(
                    "ALTER TABLE `t_lembur` ADD `surat_perintah_lembur` VARCHAR(500) NOT NULL"
                );
            }

            if (
                await hasColumn(
                    connection,
                    "m_unit",
                    "level"
                )
            ) {
                await connection.query(
                    "ALTER TABLE `m_unit` DROP COLUMN `level`"
                );
            }
        } finally {
            await queryInterface.sequelize.connectionManager
                .releaseConnection(connection);
        }
    },

    async down(queryInterface) {
        const connection =
            await queryInterface.sequelize.connectionManager
                .getConnection();

        try {
            if (
                !(await hasColumn(
                    connection,
                    "m_unit",
                    "level"
                ))
            ) {
                await connection.query(
                    "ALTER TABLE `m_unit` ADD `level` INTEGER NOT NULL DEFAULT 1"
                );
            }

            for (const columnName of [
                "surat_perintah_lembur",
                "foto_kegiatan_2",
                "foto_kegiatan_1",
            ]) {
                if (
                    await hasColumn(
                        connection,
                        "t_lembur",
                        columnName
                    )
                ) {
                    await connection.query(
                        `ALTER TABLE \`t_lembur\` DROP COLUMN \`${columnName}\``
                    );
                }
            }
        } finally {
            await queryInterface.sequelize.connectionManager
                .releaseConnection(connection);
        }
    },
};

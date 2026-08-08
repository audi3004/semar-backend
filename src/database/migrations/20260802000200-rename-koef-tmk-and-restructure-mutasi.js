"use strict";

const hasTable = async (connection, tableName) => {
    const rows = await connection.query(
        "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
        [tableName]
    );
    return rows.length > 0;
};

const hasColumn = async (connection, tableName, columnName) => {
    const rows = await connection.query(
        `SHOW COLUMNS FROM \`${tableName}\` LIKE ?`,
        [columnName]
    );
    return rows.length > 0;
};

const foreignKeysForColumn = async (
    connection,
    tableName,
    columnName
) => {
    const rows = await connection.query(
        "SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL",
        [tableName, columnName]
    );
    return rows.map((row) => row.CONSTRAINT_NAME);
};

const dropForeignKeys = async (
    connection,
    tableName,
    columnName
) => {
    for (const constraintName of await foreignKeysForColumn(
        connection,
        tableName,
        columnName
    )) {
        await connection.query(
            `ALTER TABLE \`${tableName}\` DROP FOREIGN KEY \`${constraintName}\``
        );
    }
};

module.exports = {
    async up(queryInterface) {
        const manager =
            queryInterface.sequelize.connectionManager;
        const connection = await manager.getConnection();

        try {
            if (
                (await hasTable(connection, "koef_tmk")) &&
                !(await hasTable(connection, "m_koef_tmk"))
            ) {
                await connection.query(
                    "RENAME TABLE `koef_tmk` TO `m_koef_tmk`"
                );
            }

            await dropForeignKeys(
                connection,
                "t_mutasi",
                "id_pegawai"
            );
            await dropForeignKeys(
                connection,
                "t_mutasi",
                "id_unit"
            );

            if (
                (await hasColumn(connection, "t_mutasi", "id_unit")) &&
                !(await hasColumn(
                    connection,
                    "t_mutasi",
                    "id_unit_sesudah"
                ))
            ) {
                await connection.query(
                    "ALTER TABLE `t_mutasi` CHANGE `id_unit` `id_unit_sesudah` INTEGER NOT NULL"
                );
            }

            if (
                (await hasColumn(
                    connection,
                    "t_mutasi",
                    "start_mutasi"
                )) &&
                !(await hasColumn(
                    connection,
                    "t_mutasi",
                    "tanggal_mutasi"
                ))
            ) {
                await connection.query(
                    "ALTER TABLE `t_mutasi` CHANGE `start_mutasi` `tanggal_mutasi` DATE NOT NULL"
                );
            }

            await connection.query(
                "ALTER TABLE `t_mutasi` MODIFY `id_pegawai` INTEGER NULL"
            );

            if (!(await hasColumn(connection, "t_mutasi", "id_petugas"))) {
                await connection.query(
                    "ALTER TABLE `t_mutasi` ADD `id_petugas` INTEGER NULL AFTER `id_pegawai`"
                );
            }

            if (
                !(await hasColumn(
                    connection,
                    "t_mutasi",
                    "id_unit_sebelum"
                ))
            ) {
                await connection.query(
                    "ALTER TABLE `t_mutasi` ADD `id_unit_sebelum` INTEGER NULL AFTER `id_petugas`"
                );
                await connection.query(
                    "UPDATE `t_mutasi` m JOIN `m_pegawai` p ON p.id_pegawai = m.id_pegawai SET m.id_unit_sebelum = p.id_unit WHERE m.id_unit_sebelum IS NULL"
                );
                await connection.query(
                    "ALTER TABLE `t_mutasi` MODIFY `id_unit_sebelum` INTEGER NOT NULL"
                );
            }

            if (!(await hasColumn(connection, "t_mutasi", "keterangan"))) {
                await connection.query(
                    "ALTER TABLE `t_mutasi` ADD `keterangan` VARCHAR(500) NULL AFTER `tanggal_mutasi`"
                );
            }

            for (const column of [
                "id_pegawai",
                "id_petugas",
                "id_unit_sebelum",
                "id_unit_sesudah",
            ]) {
                await dropForeignKeys(connection, "t_mutasi", column);
            }

            await connection.query(
                "ALTER TABLE `t_mutasi` ADD CONSTRAINT `fk_mutasi_pegawai` FOREIGN KEY (`id_pegawai`) REFERENCES `m_pegawai` (`id_pegawai`) ON UPDATE CASCADE ON DELETE SET NULL, ADD CONSTRAINT `fk_mutasi_petugas` FOREIGN KEY (`id_petugas`) REFERENCES `m_petugas` (`id_petugas`) ON UPDATE CASCADE ON DELETE SET NULL, ADD CONSTRAINT `fk_mutasi_unit_sebelum` FOREIGN KEY (`id_unit_sebelum`) REFERENCES `m_unit` (`id_unit`) ON UPDATE CASCADE ON DELETE RESTRICT, ADD CONSTRAINT `fk_mutasi_unit_sesudah` FOREIGN KEY (`id_unit_sesudah`) REFERENCES `m_unit` (`id_unit`) ON UPDATE CASCADE ON DELETE RESTRICT"
            );
        } finally {
            await manager.releaseConnection(connection);
        }
    },

    async down(queryInterface) {
        const manager =
            queryInterface.sequelize.connectionManager;
        const connection = await manager.getConnection();

        try {
            await connection.query(
                "DELETE FROM `t_mutasi` WHERE `id_pegawai` IS NULL"
            );

            for (const column of [
                "id_pegawai",
                "id_petugas",
                "id_unit_sebelum",
                "id_unit_sesudah",
            ]) {
                await dropForeignKeys(connection, "t_mutasi", column);
            }

            if (await hasColumn(connection, "t_mutasi", "keterangan")) {
                await connection.query(
                    "ALTER TABLE `t_mutasi` DROP COLUMN `keterangan`"
                );
            }
            if (await hasColumn(connection, "t_mutasi", "id_unit_sebelum")) {
                await connection.query(
                    "ALTER TABLE `t_mutasi` DROP COLUMN `id_unit_sebelum`"
                );
            }
            if (await hasColumn(connection, "t_mutasi", "id_petugas")) {
                await connection.query(
                    "ALTER TABLE `t_mutasi` DROP COLUMN `id_petugas`"
                );
            }
            await connection.query(
                "ALTER TABLE `t_mutasi` MODIFY `id_pegawai` INTEGER NOT NULL, CHANGE `id_unit_sesudah` `id_unit` INTEGER NOT NULL, CHANGE `tanggal_mutasi` `start_mutasi` DATE NOT NULL"
            );
            await connection.query(
                "ALTER TABLE `t_mutasi` ADD CONSTRAINT `fk_mutasi_pegawai` FOREIGN KEY (`id_pegawai`) REFERENCES `m_pegawai` (`id_pegawai`) ON UPDATE CASCADE ON DELETE CASCADE, ADD CONSTRAINT `fk_mutasi_unit` FOREIGN KEY (`id_unit`) REFERENCES `m_unit` (`id_unit`) ON UPDATE CASCADE ON DELETE CASCADE"
            );

            if (
                (await hasTable(connection, "m_koef_tmk")) &&
                !(await hasTable(connection, "koef_tmk"))
            ) {
                await connection.query(
                    "RENAME TABLE `m_koef_tmk` TO `koef_tmk`"
                );
            }
        } finally {
            await manager.releaseConnection(connection);
        }
    },
};

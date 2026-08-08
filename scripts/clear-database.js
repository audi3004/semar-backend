const sequelize = require("../src/config/database");

const quoteIdentifier = (name) =>
    `\`${String(name).replace(/`/g, "``")}\``;

(async () => {
    let connection;

    try {
        await sequelize.authenticate();

        // Gunakan koneksi driver secara langsung. Sequelize 6 mencoba
        // menghapus properti `meta` dari hasil SHOW TABLES milik mariadb 3,
        // padahal properti tersebut tidak dapat dihapus.
        connection =
            await sequelize.connectionManager.getConnection();

        const rows = await connection.query("SHOW TABLES");
        const tables = rows
            .map((row) => Object.values(row)[0])
            .filter(
                (table) =>
                    String(table).toLowerCase() !==
                    "sequelizemeta"
            );

        await connection.query("SET FOREIGN_KEY_CHECKS = 0");

        try {
            for (const table of tables) {
                await connection.query(
                    `TRUNCATE TABLE ${quoteIdentifier(table)}`
                );
            }
        } finally {
            await connection.query("SET FOREIGN_KEY_CHECKS = 1");
        }

        console.log(
            `${tables.length} tabel aplikasi berhasil dikosongkan.`
        );
    } catch (error) {
        console.error("Gagal mengosongkan database:", error.message);
        process.exitCode = 1;
    } finally {
        if (connection) {
            await sequelize.connectionManager.releaseConnection(
                connection
            );
        }

        await sequelize.close();
    }
})();

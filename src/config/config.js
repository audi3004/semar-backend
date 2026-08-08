require("dotenv").config();

const databaseConfig = {
    username: process.env.DB_USER,
    password:
        process.env.DB_PASSWORD ||
        null,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(
        process.env.DB_PORT || 3306
    ),
    dialect:
        process.env.DB_DIALECT ||
        "mariadb",
    timezone: "+07:00",
    logging: false,
};

module.exports = {
    development: databaseConfig,
    test: databaseConfig,
    production: databaseConfig,
};

require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const sequelize = require("./config/database");

// Load semua model dan relasi
require("./models");

const app = express();

// Hide Express Header
app.disable("x-powered-by");

// Middleware
app.use(cors());

app.use(helmet());

app.use(compression());

app.use(morgan("dev"));

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(
    "/uploads",
    express.static(
        path.join(
            process.cwd(),
            "uploads"
        )
    )
);
// Routes
app.use("/api", require("./routes"));

(async () => {
    try {

        await sequelize.authenticate();

        console.log("==================================");
        console.log("Database Connected");
        console.log("==================================");

        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });

    } catch (err) {

        console.error(err);

    }
})();

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

const uploadsDirectory = path.join(process.cwd(), "uploads");
const uploadsStatic = () => express.static(uploadsDirectory, {
    setHeaders: (res) => {
        // Development dapat berbeda origin; production biasanya melalui /api proxy.
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
});
app.use("/uploads", uploadsStatic());
// Alias ini dibutuhkan ketika production reverse proxy hanya meneruskan /api/*.
app.use("/api/uploads", uploadsStatic());
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

const express = require("express");

const controller = require("./controller");
const schema = require("./validator");
const validate = require(
    "../../middlewares/validator"
);

const router = express.Router();

router.get(
    "/",
    controller.findAll
);

router.get(
    "/pegawai/:id",
    controller.findByPegawai
);

router.get(
    "/petugas/:id",
    controller.findByPetugas
);

router.get(
    "/unit/:id",
    controller.findByUnit
);

router.get(
    "/:id",
    controller.findById
);

router.post(
    "/",
    validate(schema.create),
    controller.create
);

module.exports = router;

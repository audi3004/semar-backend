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
    "/role/:id",
    controller.findByRole
);

router.get(
    "/module/:id",
    controller.findByModule
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

router.put(
    "/:id",
    validate(schema.update),
    controller.update
);

router.delete(
    "/:id",
    controller.delete
);

module.exports = router;
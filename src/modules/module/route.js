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
    "/all",
    controller.findAllWithInactive
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

router.patch(
    "/:id/activate",
    controller.activate
);

router.patch(
    "/:id/deactivate",
    controller.deactivate
);

router.delete(
    "/:id",
    controller.delete
);

module.exports = router;
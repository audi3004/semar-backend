const express = require("express");
const controller = require(
    "./controller"
);
const validator = require(
    "./validator"
);
const validate = require(
    "../../middlewares/validator"
);

const router = express.Router();

router.get(
    "/",
    validate(validator.query, "query"),
    controller.findAll
);
router.get(
    "/:id",
    validate(validator.params, "params"),
    controller.findById
);
router.post(
    "/",
    validate(validator.create),
    controller.create
);
router.put(
    "/:id",
    validate(validator.params, "params"),
    validate(validator.update),
    controller.update
);
router.delete(
    "/:id",
    validate(validator.params, "params"),
    controller.delete
);

module.exports = router;

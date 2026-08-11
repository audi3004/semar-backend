const express = require("express");

const router = express.Router();

const controller = require("./controller");
const validator = require("./validator");

const validate = require(
    "../../middlewares/validator"
);


router.get(
    "/",
    validate(
        validator.query,
        "query"
    ),
    controller.findAll
);

router.post("/rollover/preview", validate(validator.rollover), controller.rolloverPreview);
router.post("/rollover/execute", validate(validator.rollover), controller.executeRollover);


router.get(
    "/:id",
    validate(
        validator.params,
        "params"
    ),
    controller.findById
);


router.post(
    "/",
    validate(
        validator.create
    ),
    controller.create
);


router.put(
    "/:id",
    validate(
        validator.params,
        "params"
    ),
    validate(
        validator.update
    ),
    controller.update
);


router.delete(
    "/:id",
    validate(
        validator.params,
        "params"
    ),
    controller.delete
);

module.exports = router;

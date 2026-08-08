const express = require(
    "express"
);

const router =
    express.Router();

const controller = require(
    "./controller"
);

const schema = require(
    "./validator"
);

const validate = require(
    "../../middlewares/validator"
);

router.get(
    "/",
    validate(
        schema.query,
        "query"
    ),
    controller.findAll
);

router.get(
    "/cuti/:id",
    validate(
        schema.params,
        "params"
    ),
    controller.findByCuti
);

router.get(
    "/:id",
    validate(
        schema.params,
        "params"
    ),
    controller.findById
);

module.exports = router;

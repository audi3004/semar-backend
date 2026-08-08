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
    "/:id",
    validate(
        schema.params,
        "params"
    ),
    controller.findById
);


router.post(
    "/",
    validate(
        schema.create
    ),
    controller.create
);


router.put(
    "/:id",
    validate(
        schema.params,
        "params"
    ),
    validate(
        schema.update
    ),
    controller.update
);


router.delete(
    "/:id",
    validate(
        schema.params,
        "params"
    ),
    controller.delete
);

module.exports = router;
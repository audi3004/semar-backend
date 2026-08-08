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

/*
|--------------------------------------------------------------------------
| GET ALL
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    validate(
        schema.query,
        "query"
    ),
    controller.findAll
);

/*
|--------------------------------------------------------------------------
| CHECK AUTHORITY
|--------------------------------------------------------------------------
*/

router.get(
    "/authority/check",
    validate(
        schema.authorityQuery,
        "query"
    ),
    controller.hasAuthority
);

/*
|--------------------------------------------------------------------------
| GET APPROVERS
|--------------------------------------------------------------------------
*/

router.get(
    "/approvers",
    validate(
        schema.approverQuery,
        "query"
    ),
    controller.findApprovers
);

/*
|--------------------------------------------------------------------------
| GET BY USER
|--------------------------------------------------------------------------
*/

router.get(
    "/me",
    controller.findMine
);

router.get(
    "/user/:id",
    validate(
        schema.params,
        "params"
    ),
    validate(
        schema.activeQuery,
        "query"
    ),
    controller.findByUser
);

router.get(
    "/unit/:id",
    validate(
        schema.unitParams,
        "params"
    ),
    validate(
        schema.activeQuery,
        "query"
    ),
    controller.findByUnit
);

/*
|--------------------------------------------------------------------------
| GET BY ID
|--------------------------------------------------------------------------
*/

router.get(
    "/:id",
    validate(
        schema.params,
        "params"
    ),
    controller.findById
);

/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    validate(
        schema.create
    ),
    controller.create
);

/*
|--------------------------------------------------------------------------
| BULK CREATE
|--------------------------------------------------------------------------
*/

router.post(
    "/bulk",
    validate(
        schema.bulkCreate
    ),
    controller.createBulk
);

/*
|--------------------------------------------------------------------------
| UPDATE
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| UPDATE STATUS
|--------------------------------------------------------------------------
*/

router.patch(
    "/:id/status",
    validate(
        schema.params,
        "params"
    ),
    validate(
        schema.updateStatus
    ),
    controller.updateStatus
);

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

router.delete(
    "/:id",
    validate(
        schema.params,
        "params"
    ),
    controller.delete
);

module.exports = router;

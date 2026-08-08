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
| GET SEMUA STATUS
|--------------------------------------------------------------------------
|
| Contoh:
|
| GET /api/status
| GET /api/status?id_role=2
| GET /api/status?kode_status=WAITING
| GET /api/status?is_final=Y
| GET /api/status?is_active=Y
|
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
| GET STATUS BERDASARKAN ROLE
|--------------------------------------------------------------------------
|
| Harus diletakkan sebelum route "/:id".
|
*/

router.get(
    "/role/:id",
    validate(
        schema.roleParams,
        "params"
    ),
    controller.findByRole
);

/*
|--------------------------------------------------------------------------
| GET DETAIL STATUS
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
| CREATE STATUS
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
| UPDATE STATUS
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
| DELETE STATUS
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
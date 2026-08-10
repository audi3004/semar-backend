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
const actionSchema = require("../../utils/workflowActionSchemas");
const uploadIjin = require("../../middlewares/uploadIjin");
const compressUploads = require("../../middlewares/compressUploads");
const handleUploadError = require("../../middlewares/handleUploadError");
const mapIjinFiles = require("../../middlewares/mapIjinFiles");

router.get(
    "/",
    validate(
        schema.query,
        "query"
    ),
    controller.findAll
);

router.get(
    "/pending",
    controller.findPending
);

router.get(
    "/petugas/:id",
    validate(
        schema.petugasParams,
        "params"
    ),
    controller.findByPetugas
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
    handleUploadError(uploadIjin),
    compressUploads,
    mapIjinFiles,
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
    handleUploadError(uploadIjin),
    compressUploads,
    mapIjinFiles,
    validate(
        schema.update
    ),
    controller.update
);

router.patch(
    "/:id/next",
    validate(
        schema.params,
        "params"
    ),
    handleUploadError(uploadIjin),
    compressUploads,
    mapIjinFiles,
    validate(schema.workflow),
    controller.next
);

router.patch(
    "/:id/revision",
    validate(
        schema.params,
        "params"
    ),
    validate(actionSchema.revision),
    controller.revision
);

router.patch(
    "/:id/reject",
    validate(
        schema.params,
        "params"
    ),
    validate(actionSchema.reject),
    controller.reject
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

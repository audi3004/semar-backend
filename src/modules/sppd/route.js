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
const uploadSppd = require("../../middlewares/uploadSppd");
const compressUploads = require("../../middlewares/compressUploads");
const handleUploadError = require("../../middlewares/handleUploadError");
const mapSppdFiles = require("../../middlewares/mapSppdFiles");

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
    handleUploadError(uploadSppd),
    compressUploads,
    mapSppdFiles,
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
    handleUploadError(uploadSppd),
    compressUploads,
    mapSppdFiles,
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
    handleUploadError(uploadSppd),
    compressUploads,
    mapSppdFiles,
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

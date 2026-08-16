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

const uploadLembur = require(
    "../../middlewares/uploadLembur"
);

const handleUploadError = require(
    "../../middlewares/handleUploadError"
);

const mapLemburFiles = require(
    "../../middlewares/mapLemburFiles"
);
const compressUploads = require("../../middlewares/compressUploads");
const actionSchema = require("../../utils/workflowActionSchemas");

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
    "/petugas-berhalangan",
    validate(schema.replacementQuery, "query"),
    controller.findReplacementCandidates
);

router.get("/dasar-tersedia", controller.findAvailableBases);

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
    handleUploadError(uploadLembur),
    compressUploads,
    mapLemburFiles(true),
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
    handleUploadError(uploadLembur),
    compressUploads,
    mapLemburFiles(false),
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
    handleUploadError(uploadLembur),
    compressUploads,
    mapLemburFiles(false),
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

const express = require("express");
const controller = require("./controller");
const uploadWorkflowSignature = require("../../middlewares/uploadWorkflowSignature");
const handleUploadError = require("../../middlewares/handleUploadError");

const router = express.Router();

router.post(
    "/bulk-approve",
    handleUploadError(uploadWorkflowSignature),
    controller.bulkApprove
);

module.exports = router;

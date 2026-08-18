const path = require("path");
const response = require("../../utils/response");
const workflowService = require("./service");
const { getRelativeDirectory } = require("../../middlewares/uploadWorkflowSignature");

class WorkflowController {
    async bulkApprove(req, res) {
        try {
            const signatureFile = Object.values(req.files || {}).flat()[0];
            const signaturePath = signatureFile
                ? `/uploads/workflow/${path.join(getRelativeDirectory(), signatureFile.filename).replace(/\\/g, "/")}`
                : null;
            const data = await workflowService.bulkApprove(
                req.body.transactions,
                signaturePath,
                req.user
            );
            return response.updated(res, data, `${data.total} transaksi berhasil disetujui`);
        } catch (error) {
            return response.error(res, error.message, error.statusCode || 500);
        }
    }
}

module.exports = new WorkflowController();

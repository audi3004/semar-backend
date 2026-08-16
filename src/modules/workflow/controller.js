const path = require("path");
const response = require("../../utils/response");
const workflowService = require("./service");
const { getRelativeDirectory } = require("../../middlewares/uploadWorkflowSignature");

class WorkflowController {
    async bulkApproveApproval1(req, res) {
        try {
            const signaturePath = req.file
                ? `/uploads/workflow/${path.join(getRelativeDirectory(), req.file.filename).replace(/\\/g, "/")}`
                : null;
            const data = await workflowService.bulkApproveApproval1(
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

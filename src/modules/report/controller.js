const service = require("./service");
const response = require("../../utils/response");

class ReportController {
    async permohonan(req, res) {
        try {
            return response.success(res, await service.permohonan(req.user, req.query), "Report permohonan berhasil diambil");
        } catch (error) {
            return response.error(res, error.message, error.statusCode || 500);
        }
    }
}

module.exports = new ReportController();

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

    async create(req, res) {
        try {
            return response.success(res, await service.create(req.user, req.body), "Report berhasil dibuat");
        } catch (error) { return response.error(res, error.message, error.statusCode || 500); }
    }

    async sign(req, res) {
        try {
            return response.success(res, await service.sign(req.user, req.params.id, req.body.signature), "Tanda tangan report berhasil disimpan");
        } catch (error) { return response.error(res, error.message, error.statusCode || 500); }
    }

    async exportData(req, res) {
        try {
            return response.success(res, await service.exportData(req.user, req.params.id), "Data export report berhasil diambil");
        } catch (error) { return response.error(res, error.message, error.statusCode || 500); }
    }
}

module.exports = new ReportController();

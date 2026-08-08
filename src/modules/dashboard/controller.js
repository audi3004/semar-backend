const service = require("./service");
const response = require("../../utils/response");

class DashboardController {
    async transactions(req, res) {
        try {
            const data = await service.analytics(req.user, req.query);
            return response.success(res, data, "Data analytics dashboard berhasil diambil");
        } catch (error) {
            return response.error(res, error.message, error.statusCode || 500);
        }
    }
}

module.exports = new DashboardController();

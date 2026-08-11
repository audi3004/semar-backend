const service = require("./service");
const response = require("../../utils/response");

class ParameterUpahTahunanController {
    async findAll(req, res) {
        try { return response.success(res, await service.findAll(req.query), "Parameter upah tahunan berhasil diambil"); }
        catch (error) { return response.error(res, error.message, error.statusCode || 500); }
    }
    async create(req, res) {
        try { return response.created(res, await service.create(req.body, req.user?.id_user), "Parameter upah tahunan berhasil ditambahkan"); }
        catch (error) { return response.error(res, error.message, error.statusCode || 500); }
    }
    async update(req, res) {
        try { return response.updated(res, await service.update(req.params.id, req.body, req.user?.id_user), "Parameter upah tahunan berhasil diperbarui"); }
        catch (error) { return response.error(res, error.message, error.statusCode || 500); }
    }
}

module.exports = new ParameterUpahTahunanController();

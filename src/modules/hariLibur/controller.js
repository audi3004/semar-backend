const service = require("./service");
const response = require(
    "../../utils/response"
);

class HariLiburController {
    async findAll(req, res) {
        try {
            const data =
                await service.findAll(
                    req.query
                );
            return response.success(
                res,
                data,
                "Data hari libur berhasil diambil"
            );
        } catch (error) {
            return response.error(
                res,
                error.message,
                error.statusCode || 500
            );
        }
    }

    async findById(req, res) {
        try {
            const data =
                await service.findById(
                    req.params.id
                );
            return response.success(
                res,
                data,
                "Detail hari libur berhasil diambil"
            );
        } catch (error) {
            return response.error(
                res,
                error.message,
                error.statusCode || 500
            );
        }
    }

    async create(req, res) {
        try {
            const data =
                await service.create(
                    req.body,
                    req.user?.id_user ?? null
                );
            return response.created(
                res,
                data,
                "Data hari libur berhasil ditambahkan"
            );
        } catch (error) {
            return response.error(
                res,
                error.message,
                error.statusCode || 500
            );
        }
    }

    async update(req, res) {
        try {
            const data =
                await service.update(
                    req.params.id,
                    req.body,
                    req.user?.id_user ?? null
                );
            return response.updated(
                res,
                data,
                "Data hari libur berhasil diperbarui"
            );
        } catch (error) {
            return response.error(
                res,
                error.message,
                error.statusCode || 500
            );
        }
    }

    async delete(req, res) {
        try {
            await service.delete(
                req.params.id
            );
            return response.deleted(
                res,
                "Data hari libur berhasil dihapus"
            );
        } catch (error) {
            return response.error(
                res,
                error.message,
                error.statusCode || 500
            );
        }
    }
}

module.exports =
    new HariLiburController();

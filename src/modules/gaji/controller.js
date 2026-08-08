const gajiService = require(
    "./service"
);

const response = require(
    "../../utils/response"
);

class GajiController {
    async findAll(req, res) {
        try {
            const data =
                await gajiService.findAll(
                    req.query
                );

            return response.success(
                res,
                data,
                "Data gaji berhasil diambil"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async findById(req, res) {
        try {
            const data =
                await gajiService.findById(
                    req.params.id
                );

            return response.success(
                res,
                data,
                "Detail gaji berhasil diambil"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async create(req, res) {
        try {
            const createdBy =
                req.user
                    ?.id_user ??
                null;

            const data =
                await gajiService.create(
                    req.body,
                    createdBy
                );

            return response.created(
                res,
                data,
                "Data gaji berhasil ditambahkan"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async update(req, res) {
        try {
            const updatedBy =
                req.user
                    ?.id_user ??
                null;

            const data =
                await gajiService.update(
                    req.params.id,
                    req.body,
                    updatedBy
                );

            return response.updated(
                res,
                data,
                "Data gaji berhasil diperbarui"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async delete(req, res) {
        try {
            await gajiService.delete(
                req.params.id
            );

            return response.deleted(
                res,
                "Data gaji berhasil dihapus"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }
}

module.exports =
    new GajiController();
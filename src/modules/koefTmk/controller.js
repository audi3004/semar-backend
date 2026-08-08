const koefTmkService = require(
    "./service"
);

const response = require(
    "../../utils/response"
);

class KoefTmkController {
    async findAll(req, res) {
        try {
            const data =
                await koefTmkService
                    .findAll(
                        req.query
                    );

            return response.success(
                res,
                data,
                "Data koefisien TMK berhasil diambil"
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
                await koefTmkService
                    .findById(
                        req.params.id
                    );

            return response.success(
                res,
                data,
                "Detail koefisien TMK berhasil diambil"
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
                await koefTmkService
                    .create(
                        req.body,
                        createdBy
                    );

            return response.created(
                res,
                data,
                "Data koefisien TMK berhasil ditambahkan"
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
                await koefTmkService
                    .update(
                        req.params.id,
                        req.body,
                        updatedBy
                    );

            return response.updated(
                res,
                data,
                "Data koefisien TMK berhasil diperbarui"
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
            await koefTmkService.delete(
                req.params.id
            );

            return response.deleted(
                res,
                "Data koefisien TMK berhasil dihapus"
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
    new KoefTmkController();
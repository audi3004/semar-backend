const petugasService = require(
    "./service"
);

const response = require(
    "../../utils/response"
);

class PetugasController {
    async findAll(req, res) {
        try {
            const data =
                await petugasService
                    .findAll(
                        req.query
                    );

            return response.success(
                res,
                data,
                "Data petugas berhasil diambil"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode ||
                500
            );
        }
    }

    async findById(req, res) {
        try {
            const data =
                await petugasService
                    .findById(
                        req.params.id
                    );

            return response.success(
                res,
                data,
                "Detail petugas berhasil diambil"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode ||
                500
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
                await petugasService
                    .create(
                        req.body,
                        createdBy
                    );

            return response.created(
                res,
                data,
                "Data petugas berhasil ditambahkan"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode ||
                500
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
                await petugasService
                    .update(
                        req.params.id,
                        req.body,
                        updatedBy
                    );

            return response.updated(
                res,
                data,
                "Data petugas berhasil diperbarui"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode ||
                500
            );
        }
    }

    async delete(req, res) {
        try {
            await petugasService
                .delete(
                    req.params.id
                );

            return response.deleted(
                res,
                "Data petugas berhasil dihapus"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode ||
                500
            );
        }
    }
}

module.exports =
    new PetugasController();
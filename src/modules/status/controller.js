const statusService = require(
    "./service"
);

const response = require(
    "../../utils/response"
);

class StatusController {
    async findAll(
        req,
        res
    ) {
        try {
            const data =
                await statusService
                    .findAll(
                        req.query
                    );

            return response.success(
                res,
                data,
                "Data status berhasil diambil"
            );
        } catch (error) {
            return response.error(
                res,
                error.message,
                error.statusCode ||
                500
            );
        }
    }

    async findById(
        req,
        res
    ) {
        try {
            const data =
                await statusService
                    .findById(
                        req.params.id
                    );

            return response.success(
                res,
                data,
                "Detail status berhasil diambil"
            );
        } catch (error) {
            return response.error(
                res,
                error.message,
                error.statusCode ||
                500
            );
        }
    }

    async findByRole(
        req,
        res
    ) {
        try {
            const data =
                await statusService
                    .findByRole(
                        req.params.id
                    );

            return response.success(
                res,
                data,
                "Data status berdasarkan role berhasil diambil"
            );
        } catch (error) {
            return response.error(
                res,
                error.message,
                error.statusCode ||
                500
            );
        }
    }

    async create(
        req,
        res
    ) {
        try {
            const createdBy =
                req.user
                    ?.id_user ??
                null;

            const data =
                await statusService
                    .create(
                        req.body,
                        createdBy
                    );

            return response.created(
                res,
                data,
                "Data status berhasil ditambahkan"
            );
        } catch (error) {
            return response.error(
                res,
                error.message,
                error.statusCode ||
                500
            );
        }
    }

    async update(
        req,
        res
    ) {
        try {
            const updatedBy =
                req.user
                    ?.id_user ??
                null;

            const data =
                await statusService
                    .update(
                        req.params.id,
                        req.body,
                        updatedBy
                    );

            return response.updated(
                res,
                data,
                "Data status berhasil diperbarui"
            );
        } catch (error) {
            return response.error(
                res,
                error.message,
                error.statusCode ||
                500
            );
        }
    }

    async delete(
        req,
        res
    ) {
        try {
            await statusService.delete(
                req.params.id
            );

            return response.deleted(
                res,
                "Data status berhasil dihapus"
            );
        } catch (error) {
            return response.error(
                res,
                error.message,
                error.statusCode ||
                500
            );
        }
    }
}

module.exports =
    new StatusController();
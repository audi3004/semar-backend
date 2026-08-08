const roleService = require(
    "./service"
);

const response = require(
    "../../utils/response"
);

class RoleController {
    async findAll(
        req,
        res
    ) {
        try {
            const data =
                await roleService
                    .findAll(
                        req.query
                    );

            return response.success(
                res,
                data,
                "Data role berhasil diambil"
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
                await roleService
                    .findById(
                        req.params.id
                    );

            return response.success(
                res,
                data,
                "Detail role berhasil diambil"
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
                await roleService
                    .create(
                        req.body,
                        createdBy
                    );

            return response.created(
                res,
                data,
                "Data role berhasil ditambahkan"
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
                await roleService
                    .update(
                        req.params.id,
                        req.body,
                        updatedBy
                    );

            return response.updated(
                res,
                data,
                "Data role berhasil diperbarui"
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
            await roleService.delete(
                req.params.id
            );

            return response.deleted(
                res,
                "Data role berhasil dihapus"
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
    new RoleController();
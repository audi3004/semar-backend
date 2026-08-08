const unitRoleService = require(
    "./service"
);

const response = require(
    "../../utils/response"
);

class UnitRoleController {
    async findAll(
        req,
        res
    ) {
        try {
            const data =
                await unitRoleService
                    .findAll(
                        req.query
                    );

            return response.success(
                res,
                data,
                "Data unit role berhasil diambil"
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
                await unitRoleService
                    .findById(
                        req.params.id
                    );

            return response.success(
                res,
                data,
                "Detail unit role berhasil diambil"
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

    async findByUser(
        req,
        res
    ) {
        try {
            const data =
                await unitRoleService
                    .findByUser(
                        req.params.id,
                        req.query
                    );

            return response.success(
                res,
                data,
                "Data unit role user berhasil diambil"
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

    async findMine(
        req,
        res
    ) {
        try {
            const data =
                await unitRoleService
                    .findByUser(
                        req.user.id_user,
                        { is_active: "Y" }
                    );

            return response.success(
                res,
                data,
                "Data unit role user login berhasil diambil"
            );
        } catch (error) {
            return response.error(
                res,
                error.message,
                error.statusCode || 500
            );
        }
    }

    async findByUnit(
        req,
        res
    ) {
        try {
            const data =
                await unitRoleService
                    .findByUnit(
                        req.params.id,
                        req.query
                    );

            return response.success(
                res,
                data,
                "Data user approval unit berhasil diambil"
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

    async findApprovers(
        req,
        res
    ) {
        try {
            const data =
                await unitRoleService
                    .findApprovers(
                        req.query.id_unit,
                        req.query.id_role
                    );

            return response.success(
                res,
                data,
                "Data approver berhasil diambil"
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

    async hasAuthority(
        req,
        res
    ) {
        try {
            const data =
                await unitRoleService
                    .hasAuthority(
                        req.query.id_user,
                        req.query.id_unit,
                        req.query.id_role
                    );

            return response.success(
                res,
                data,
                "Pengecekan otorisasi berhasil"
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
            const data =
                await unitRoleService
                    .create(
                        req.body,
                        req.user ??
                        null
                    );

            return response.created(
                res,
                data,
                "Unit role berhasil ditambahkan"
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

    async createBulk(
        req,
        res
    ) {
        try {
            const data =
                await unitRoleService
                    .createBulk(
                        req.body,
                        req.user ??
                        null
                    );

            return response.created(
                res,
                data,
                "Unit role berhasil ditambahkan"
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
            const data =
                await unitRoleService
                    .update(
                        req.params.id,
                        req.body,
                        req.user ??
                        null
                    );

            return response.updated(
                res,
                data,
                "Unit role berhasil diperbarui"
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

    async updateStatus(
        req,
        res
    ) {
        try {
            const data =
                await unitRoleService
                    .updateStatus(
                        req.params.id,
                        req.body
                            .is_active,
                        req.user ??
                        null
                    );

            return response.updated(
                res,
                data,
                "Status unit role berhasil diperbarui"
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
            await unitRoleService.delete(
                req.params.id
            );

            return response.deleted(
                res,
                "Unit role berhasil dihapus"
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
    new UnitRoleController();

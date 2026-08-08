const userService = require("./service");
const response = require(
    "../../utils/response"
);

class UserController {
    async findAll(req, res) {
        try {
            const users =
                await userService.findAll();

            return response.success(
                res,
                users,
                "Data user berhasil diambil"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async findAllWithInactive(req, res) {
        try {
            const users =
                await userService
                    .findAllWithInactive();

            return response.success(
                res,
                users,
                "Data user berhasil diambil"
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
            const user =
                await userService.findById(
                    req.params.id
                );

            return response.success(
                res,
                user,
                "Detail user berhasil diambil"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async findByRole(req, res) {
        try {
            const users =
                await userService.findByRole(
                    req.params.id
                );

            return response.success(
                res,
                users,
                "Data user berdasarkan role berhasil diambil"
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
            const user =
                await userService.create(
                    req.body,
                    req.user?.id_user || null
                );

            return response.created(
                res,
                user,
                "User berhasil ditambahkan"
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
            const user =
                await userService.update(
                    req.params.id,
                    req.body,
                    req.user?.id_user || null
                );

            return response.updated(
                res,
                user,
                "User berhasil diperbarui"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async changePassword(req, res) {
        try {
            await userService.changePassword(
                req.params.id,
                req.body,
                req.user?.id_user || null
            );

            return response.success(
                res,
                null,
                "Password berhasil diperbarui"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async activate(req, res) {
        try {
            await userService.activate(
                req.params.id,
                req.user?.id_user || null
            );

            return response.success(
                res,
                null,
                "User berhasil diaktifkan"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async deactivate(req, res) {
        try {
            await userService.deactivate(
                req.params.id,
                req.user?.id_user || null
            );

            return response.success(
                res,
                null,
                "User berhasil dinonaktifkan"
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
            await userService.delete(
                req.params.id
            );

            return response.deleted(
                res,
                "User berhasil dihapus"
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

module.exports = new UserController();
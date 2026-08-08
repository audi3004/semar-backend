const moduleService = require("./service");
const response = require(
    "../../utils/response"
);

class ModuleController {
    async findAll(req, res) {
        try {
            const modules =
                await moduleService.findAll();

            return response.success(
                res,
                modules,
                "Data module berhasil diambil"
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
            const modules =
                await moduleService
                    .findAllWithInactive();

            return response.success(
                res,
                modules,
                "Data module berhasil diambil"
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
            const module =
                await moduleService.findById(
                    req.params.id
                );

            return response.success(
                res,
                module,
                "Detail module berhasil diambil"
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
            const module =
                await moduleService.create(
                    req.body,
                    req.user?.id_user || null
                );

            return response.created(
                res,
                module,
                "Module berhasil ditambahkan"
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
            const module =
                await moduleService.update(
                    req.params.id,
                    req.body,
                    req.user?.id_user || null
                );

            return response.updated(
                res,
                module,
                "Module berhasil diperbarui"
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
            await moduleService.activate(
                req.params.id,
                req.user?.id_user || null
            );

            return response.success(
                res,
                null,
                "Module berhasil diaktifkan"
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
            await moduleService.deactivate(
                req.params.id,
                req.user?.id_user || null
            );

            return response.success(
                res,
                null,
                "Module berhasil dinonaktifkan"
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
            await moduleService.delete(
                req.params.id
            );

            return response.deleted(
                res,
                "Module berhasil dihapus"
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

module.exports = new ModuleController();
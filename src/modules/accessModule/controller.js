const accessModuleService = require(
    "./service"
);
const response = require(
    "../../utils/response"
);

class AccessModuleController {
    async findAll(req, res) {
        try {
            const access =
                await accessModuleService
                    .findAll();

            return response.success(
                res,
                access,
                "Data hak akses berhasil diambil"
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
            const access =
                await accessModuleService
                    .findById(req.params.id);

            return response.success(
                res,
                access,
                "Detail hak akses berhasil diambil"
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
            const access =
                await accessModuleService
                    .findByRole(req.params.id);

            return response.success(
                res,
                access,
                "Hak akses berdasarkan role berhasil diambil"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async findByModule(req, res) {
        try {
            const access =
                await accessModuleService
                    .findByModule(req.params.id);

            return response.success(
                res,
                access,
                "Hak akses berdasarkan module berhasil diambil"
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
            const access =
                await accessModuleService
                    .create(
                        req.body,
                        req.user?.id_user ||
                        null
                    );

            return response.created(
                res,
                access,
                "Hak akses berhasil ditambahkan"
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
            const access =
                await accessModuleService
                    .update(
                        req.params.id,
                        req.body,
                        req.user?.id_user ||
                        null
                    );

            return response.updated(
                res,
                access,
                "Hak akses berhasil diperbarui"
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
            await accessModuleService.delete(
                req.params.id
            );

            return response.deleted(
                res,
                "Hak akses berhasil dihapus"
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
    new AccessModuleController();
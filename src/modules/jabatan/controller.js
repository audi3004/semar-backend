const jabatanService = require("./service");
const response = require("../../utils/response");

class JabatanController {
    async findAll(req, res) {
        try {
            const jabatan =
                await jabatanService.findAll();

            return response.success(
                res,
                jabatan,
                "Data jabatan berhasil diambil"
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
            const jabatan =
                await jabatanService
                    .findAllWithInactive();

            return response.success(
                res,
                jabatan,
                "Data jabatan berhasil diambil"
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
            const jabatan =
                await jabatanService.findById(
                    req.params.id
                );

            return response.success(
                res,
                jabatan,
                "Detail jabatan berhasil diambil"
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
            const jabatan =
                await jabatanService.create(
                    req.body,
                    req.user?.id_user || null
                );

            return response.created(
                res,
                jabatan,
                "Jabatan berhasil ditambahkan"
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
            const jabatan =
                await jabatanService.update(
                    req.params.id,
                    req.body,
                    req.user?.id_user || null
                );

            return response.updated(
                res,
                jabatan,
                "Jabatan berhasil diperbarui"
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
            await jabatanService.activate(
                req.params.id,
                req.user?.id_user || null
            );

            return response.success(
                res,
                null,
                "Jabatan berhasil diaktifkan"
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
            await jabatanService.deactivate(
                req.params.id,
                req.user?.id_user || null
            );

            return response.success(
                res,
                null,
                "Jabatan berhasil dinonaktifkan"
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
            await jabatanService.delete(
                req.params.id
            );

            return response.deleted(
                res,
                "Jabatan berhasil dihapus"
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

module.exports = new JabatanController();
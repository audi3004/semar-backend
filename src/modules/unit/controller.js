const unitService = require("./service");
const response = require("../../utils/response");

class UnitController {
    async findAll(req, res) {
        try {
            const units =
                await unitService.findAll();

            return response.success(
                res,
                units,
                "Data unit berhasil diambil"
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
            const units =
                await unitService
                    .findAllWithInactive();

            return response.success(
                res,
                units,
                "Data unit berhasil diambil"
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
            const unit =
                await unitService.findById(
                    req.params.id
                );

            return response.success(
                res,
                unit,
                "Detail unit berhasil diambil"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async findByParent(req, res) {
        try {
            const units =
                await unitService.findByParent(
                    req.params.id
                );

            return response.success(
                res,
                units,
                "Data sub unit berhasil diambil"
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
            const unit =
                await unitService.create(
                    req.body,
                    req.user?.id_user || null
                );

            return response.created(
                res,
                unit,
                "Unit berhasil ditambahkan"
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
            const unit =
                await unitService.update(
                    req.params.id,
                    req.body,
                    req.user?.id_user || null
                );

            return response.updated(
                res,
                unit,
                "Unit berhasil diperbarui"
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
            await unitService.activate(
                req.params.id,
                req.user?.id_user || null
            );

            return response.success(
                res,
                null,
                "Unit berhasil diaktifkan"
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
            await unitService.deactivate(
                req.params.id,
                req.user?.id_user || null
            );

            return response.success(
                res,
                null,
                "Unit berhasil dinonaktifkan"
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
            await unitService.delete(
                req.params.id
            );

            return response.deleted(
                res,
                "Unit berhasil dihapus"
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

module.exports = new UnitController();
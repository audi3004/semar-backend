const umkService = require("./service");
const response = require("../../utils/response");

class UmkController {
    async findAll(req, res) {
        try {
            const data =
                await umkService.findAll({
                    jenis_wilayah:
                        req.query
                            .jenis_wilayah,

                    nama_wilayah:
                        req.query
                            .nama_wilayah,

                    tahun_umk:
                        req.query
                            .tahun_umk,

                    is_active:
                        req.query
                            .is_active,
                });

            return response.success(
                res,
                data,
                "Data UMK berhasil diambil"
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
            const umk =
                await umkService
                    .findAllWithInactive();

            return response.success(
                res,
                umk,
                "Data UMK berhasil diambil"
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
            const umk =
                await umkService.findById(
                    req.params.id
                );

            return response.success(
                res,
                umk,
                "Detail UMK berhasil diambil"
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
            const umk =
                await umkService.create(
                    req.body,
                    req.user?.id_user || null
                );

            return response.created(
                res,
                umk,
                "Data UMK berhasil ditambahkan"
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
            const umk =
                await umkService.update(
                    req.params.id,
                    req.body,
                    req.user?.id_user || null
                );

            return response.updated(
                res,
                umk,
                "Data UMK berhasil diperbarui"
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
            await umkService.activate(
                req.params.id,
                req.user?.id_user || null
            );

            return response.success(
                res,
                null,
                "Data UMK berhasil diaktifkan"
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
            await umkService.deactivate(
                req.params.id,
                req.user?.id_user || null
            );

            return response.success(
                res,
                null,
                "Data UMK berhasil dinonaktifkan"
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
            await umkService.delete(
                req.params.id
            );

            return response.deleted(
                res,
                "Data UMK berhasil dihapus"
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

module.exports = new UmkController();
const pegawaiService = require("./service");
const response = require(
    "../../utils/response"
);

class PegawaiController {
    async findAll(req, res) {
        try {
            const pegawai =
                await pegawaiService.findAll();

            return response.success(
                res,
                pegawai,
                "Data pegawai berhasil diambil"
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
            const pegawai =
                await pegawaiService
                    .findAllWithInactive();

            return response.success(
                res,
                pegawai,
                "Data pegawai berhasil diambil"
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
            const pegawai =
                await pegawaiService.findById(
                    req.params.id
                );

            return response.success(
                res,
                pegawai,
                "Detail pegawai berhasil diambil"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async findByUnit(req, res) {
        try {
            const pegawai =
                await pegawaiService.findByUnit(
                    req.params.id
                );

            return response.success(
                res,
                pegawai,
                "Data pegawai berdasarkan unit berhasil diambil"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async findByJabatan(req, res) {
        try {
            const pegawai =
                await pegawaiService
                    .findByJabatan(
                        req.params.id
                    );

            return response.success(
                res,
                pegawai,
                "Data pegawai berdasarkan jabatan berhasil diambil"
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
            const pegawai =
                await pegawaiService.create(
                    req.body,
                    req.user?.id_user || null
                );

            return response.created(
                res,
                pegawai,
                "Pegawai berhasil ditambahkan"
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
            const pegawai =
                await pegawaiService.update(
                    req.params.id,
                    req.body,
                    req.user?.id_user || null
                );

            return response.updated(
                res,
                pegawai,
                "Pegawai berhasil diperbarui"
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
            await pegawaiService.activate(
                req.params.id,
                req.user?.id_user || null
            );

            return response.success(
                res,
                null,
                "Pegawai berhasil diaktifkan"
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
            await pegawaiService.deactivate(
                req.params.id,
                req.user?.id_user || null
            );

            return response.success(
                res,
                null,
                "Pegawai berhasil dinonaktifkan"
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
            await pegawaiService.delete(
                req.params.id
            );

            return response.deleted(
                res,
                "Pegawai berhasil dihapus"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async syncProjects(req, res) {
        try {
            const pegawai = await pegawaiService.syncProjects(
                req.params.id,
                req.body.project_ids,
                req.user?.id_user || null
            );
            return response.updated(res, pegawai, "Assignment project pegawai berhasil diperbarui");
        } catch (err) {
            return response.error(res, err.message, err.statusCode || 500);
        }
    }
}

module.exports = new PegawaiController();

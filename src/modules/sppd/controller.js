const sppdService = require(
    "./service"
);

const response = require(
    "../../utils/response"
);

class SppdController {
    async findAll(
        req,
        res
    ) {
        try {
            const data =
                await sppdService
                    .findAll(
                        req.query,
                        req.user
                    );

            return response.success(
                res,
                data,
                "Data SPPD berhasil diambil"
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
                await sppdService
                    .findById(
                        req.params.id,
                        req.user
                    );

            return response.success(
                res,
                data,
                "Detail SPPD berhasil diambil"
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

    async findPending(
        req,
        res
    ) {
        try {
            const data =
                await sppdService
                    .findPending(req.user);

            return response.success(
                res,
                data,
                "Data SPPD yang masih diproses berhasil diambil"
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

    async findByPetugas(
        req,
        res
    ) {
        try {
            const data =
                await sppdService
                    .findByPetugas(
                        req.params.id
                    );

            return response.success(
                res,
                data,
                "Data SPPD petugas berhasil diambil"
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
                await sppdService
                    .create(
                        req.body,
                        req.user ??
                        null
                    );

            return response.created(
                res,
                data,
                "Data SPPD berhasil ditambahkan"
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
                await sppdService
                    .update(
                        req.params.id,
                        req.body,
                        req.user ??
                        null
                    );

            return response.updated(
                res,
                data,
                "Data SPPD berhasil diperbarui"
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

    async next(
        req,
        res
    ) {
        try {
            const data =
                await sppdService
                    .moveToNextStatus(
                        req.params.id,
                        req.user,
                        req.body
                    );

            return response.updated(
                res,
                data,
                "Status SPPD berhasil diproses ke tahap berikutnya"
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

    async revision(
        req,
        res
    ) {
        try {
            const data =
                await sppdService
                    .moveToRevision(
                        req.params.id,
                        req.user,
                        req.body
                    );

            return response.updated(
                res,
                data,
                "SPPD berhasil dikembalikan untuk direvisi"
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

    async reject(
        req,
        res
    ) {
        try {
            const data =
                await sppdService
                    .moveToRejected(
                        req.params.id,
                        req.user,
                        req.body
                    );

            return response.updated(
                res,
                data,
                "SPPD berhasil ditolak"
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
            await sppdService.delete(
                req.params.id,
                req.user
            );

            return response.deleted(
                res,
                "Data SPPD berhasil dihapus"
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
    new SppdController();

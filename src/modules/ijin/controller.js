const ijinService = require(
    "./service"
);

const response = require(
    "../../utils/response"
);

class IjinController {
    async findAll(
        req,
        res
    ) {
        try {
            const data =
                await ijinService
                    .findAll(
                        req.query
                    );

            return response.success(
                res,
                data,
                "Data ijin berhasil diambil"
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
                await ijinService
                    .findById(
                        req.params.id
                    );

            return response.success(
                res,
                data,
                "Detail ijin berhasil diambil"
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
                await ijinService
                    .findPending(req.user);

            return response.success(
                res,
                data,
                "Data ijin yang masih diproses berhasil diambil"
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
                await ijinService
                    .findByPetugas(
                        req.params.id
                    );

            return response.success(
                res,
                data,
                "Data ijin petugas berhasil diambil"
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
                await ijinService
                    .create(
                        req.body,
                        req.user ??
                        null
                    );

            return response.created(
                res,
                data,
                "Data ijin berhasil ditambahkan"
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
                await ijinService
                    .update(
                        req.params.id,
                        req.body,
                        req.user ??
                        null
                    );

            return response.updated(
                res,
                data,
                "Data ijin berhasil diperbarui"
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
                await ijinService
                    .moveToNextStatus(
                        req.params.id,
                        req.user,
                        req.body
                    );

            return response.updated(
                res,
                data,
                "Status ijin berhasil diproses ke tahap berikutnya"
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
                await ijinService
                    .moveToRevision(
                        req.params.id,
                        req.user,
                        req.body
                    );

            return response.updated(
                res,
                data,
                "Ijin berhasil dikembalikan untuk direvisi"
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
                await ijinService
                    .moveToRejected(
                        req.params.id,
                        req.user,
                        req.body
                    );

            return response.updated(
                res,
                data,
                "Ijin berhasil ditolak"
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
            await ijinService.delete(
                req.params.id,
                req.user
            );

            return response.deleted(
                res,
                "Data ijin berhasil dihapus"
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
    new IjinController();

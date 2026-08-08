const sakitService = require(
    "./service"
);

const response = require(
    "../../utils/response"
);

class SakitController {
    async findAll(
        req,
        res
    ) {
        try {
            const data =
                await sakitService
                    .findAll(
                        req.query
                    );

            return response.success(
                res,
                data,
                "Data sakit berhasil diambil"
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
                await sakitService
                    .findById(
                        req.params.id
                    );

            return response.success(
                res,
                data,
                "Detail sakit berhasil diambil"
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
                await sakitService
                    .findPending(req.user);

            return response.success(
                res,
                data,
                "Data sakit yang masih diproses berhasil diambil"
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
                await sakitService
                    .findByPetugas(
                        req.params.id
                    );

            return response.success(
                res,
                data,
                "Data sakit petugas berhasil diambil"
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
                await sakitService
                    .create(
                        req.body,
                        req.user ??
                        null
                    );

            return response.created(
                res,
                data,
                "Data sakit berhasil ditambahkan"
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
                await sakitService
                    .update(
                        req.params.id,
                        req.body,
                        req.user ??
                        null
                    );

            return response.updated(
                res,
                data,
                "Data sakit berhasil diperbarui"
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
                await sakitService
                    .moveToNextStatus(
                        req.params.id,
                        req.user,
                        req.body
                    );

            return response.updated(
                res,
                data,
                "Status sakit berhasil diproses ke tahap berikutnya"
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
                await sakitService
                    .moveToRevision(
                        req.params.id,
                        req.user,
                        req.body
                    );

            return response.updated(
                res,
                data,
                "Pengajuan sakit berhasil dikembalikan untuk direvisi"
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
                await sakitService
                    .moveToRejected(
                        req.params.id,
                        req.user,
                        req.body
                    );

            return response.updated(
                res,
                data,
                "Pengajuan sakit berhasil ditolak"
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
            await sakitService.delete(
                req.params.id,
                req.user
            );

            return response.deleted(
                res,
                "Data sakit berhasil dihapus"
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
    new SakitController();

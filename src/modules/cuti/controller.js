const cutiService = require(
    "./service"
);

const response = require(
    "../../utils/response"
);

class CutiController {
    async findAll(
        req,
        res
    ) {
        try {
            const data =
                await cutiService
                    .findAll(
                        req.query,
                        req.user
                    );

            return response.success(
                res,
                data,
                "Data cuti berhasil diambil"
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
                await cutiService
                    .findById(
                        req.params.id,
                        req.user
                    );

            return response.success(
                res,
                data,
                "Detail cuti berhasil diambil"
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
                await cutiService
                    .findPending(req.user);

            return response.success(
                res,
                data,
                "Data cuti yang masih diproses berhasil diambil"
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
                await cutiService
                    .findByPetugas(
                        req.params.id
                    );

            return response.success(
                res,
                data,
                "Data cuti petugas berhasil diambil"
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
                await cutiService
                    .create(
                        req.body,
                        req.user ??
                        null
                    );

            return response.created(
                res,
                data,
                "Data cuti berhasil ditambahkan"
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
                await cutiService
                    .update(
                        req.params.id,
                        req.body,
                        req.user ??
                        null
                    );

            return response.updated(
                res,
                data,
                "Data cuti berhasil diperbarui"
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
                await cutiService
                    .moveToNextStatus(
                        req.params.id,
                        req.user,
                        req.body
                    );

            return response.updated(
                res,
                data,
                "Status cuti berhasil diproses ke tahap berikutnya"
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
                await cutiService
                    .moveToRevision(
                        req.params.id,
                        req.user,
                        req.body
                    );

            return response.updated(
                res,
                data,
                "Pengajuan cuti berhasil dikembalikan untuk direvisi"
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
                await cutiService
                    .moveToRejected(
                        req.params.id,
                        req.user,
                        req.body
                    );

            return response.updated(
                res,
                data,
                "Pengajuan cuti berhasil ditolak"
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
            await cutiService.delete(
                req.params.id,
                req.user
            );

            return response.deleted(
                res,
                "Data cuti berhasil dihapus"
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
    new CutiController();

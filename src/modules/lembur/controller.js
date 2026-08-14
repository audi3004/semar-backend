const lemburService = require(
    "./service"
);

const response = require(
    "../../utils/response"
);

class LemburController {
    async findReplacementCandidates(req, res) {
        try {
            const data = await lemburService.findReplacementCandidates(
                req.query.tanggal
            );
            return response.success(
                res,
                data,
                data.length
                    ? "Kandidat petugas yang sedang berhalangan berhasil diambil"
                    : "Tidak ada petugas dengan pengajuan cuti, ijin, atau sakit pada tanggal tersebut"
            );
        } catch (error) {
            return response.error(res, error.message, error.statusCode || 500);
        }
    }

    async findAll(
        req,
        res
    ) {
        try {
            const data =
                await lemburService
                    .findAll(
                        req.query,
                        req.user
                    );

            return response.success(
                res,
                data,
                "Data lembur berhasil diambil"
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
                await lemburService
                    .findById(
                        req.params.id,
                        req.user
                    );

            return response.success(
                res,
                data,
                "Detail lembur berhasil diambil"
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
                await lemburService
                    .findPending(req.user);

            return response.success(
                res,
                data,
                "Data lembur yang masih diproses berhasil diambil"
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
                await lemburService
                    .findByPetugas(
                        req.params.id,
                        req.user
                    );

            return response.success(
                res,
                data,
                "Data lembur petugas berhasil diambil"
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
                await lemburService
                    .create(
                        req.body,
                        req.user ??
                        null
                    );

            return response.created(
                res,
                data,
                "Data lembur berhasil ditambahkan"
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
                await lemburService
                    .update(
                        req.params.id,
                        req.body,
                        req.user ??
                        null
                    );

            return response.updated(
                res,
                data,
                "Data lembur berhasil diperbarui"
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
                await lemburService
                    .moveToNextStatus(
                        req.params.id,
                        req.user,
                        req.body
                    );

            return response.updated(
                res,
                data,
                "Status lembur berhasil diproses ke tahap berikutnya"
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
                await lemburService
                    .moveToRevision(
                        req.params.id,
                        req.user,
                        req.body
                    );

            return response.updated(
                res,
                data,
                "Pengajuan lembur berhasil dikembalikan untuk direvisi"
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
                await lemburService
                    .moveToRejected(
                        req.params.id,
                        req.user,
                        req.body
                    );

            return response.updated(
                res,
                data,
                "Pengajuan lembur berhasil ditolak"
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
            await lemburService.delete(
                req.params.id,
                req.user
            );

            return response.deleted(
                res,
                "Data lembur berhasil dihapus"
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
    new LemburController();

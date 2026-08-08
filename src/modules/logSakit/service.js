const logSakitRepository =
    require("./repository");

const AppError = require(
    "../../utils/appError"
);

class LogSakitService {
    normalizeDate(value) {
        return value
            ? String(value)
                .slice(0, 10)
            : value;
    }

    async checkLogSakit(
        id_log_sakit
    ) {
        const log =
            await logSakitRepository
                .findById(
                    id_log_sakit
                );

        if (!log) {
            throw new AppError(
                "Log sakit tidak ditemukan",
                404
            );
        }

        return log;
    }

    async findAll(
        filters = {}
    ) {
        return await logSakitRepository
            .findAll({
                ...filters,
                aksi: filters.aksi
                    ? String(
                        filters.aksi
                    )
                        .trim()
                        .toUpperCase()
                    : undefined,
                tgl_awal:
                    this.normalizeDate(
                        filters.tgl_awal
                    ),
                tgl_akhir:
                    this.normalizeDate(
                        filters.tgl_akhir
                    ),
            });
    }

    async findById(
        id_log_sakit
    ) {
        return await this.checkLogSakit(
            id_log_sakit
        );
    }

    async findBySakit(
        id_sakit
    ) {
        return await logSakitRepository
            .findBySakit(
                id_sakit
            );
    }

    async create(
        data,
        transaction = null
    ) {
        return await logSakitRepository
            .create(
                data,
                transaction
            );
    }
}

module.exports =
    new LogSakitService();

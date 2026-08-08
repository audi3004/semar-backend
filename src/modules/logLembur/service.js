const logLemburRepository =
    require("./repository");

const AppError = require(
    "../../utils/appError"
);

class LogLemburService {
    normalizeDate(value) {
        return value
            ? String(value)
                .slice(0, 10)
            : value;
    }

    async checkLogLembur(
        id_log_lembur
    ) {
        const log =
            await logLemburRepository
                .findById(
                    id_log_lembur
                );

        if (!log) {
            throw new AppError(
                "Log lembur tidak ditemukan",
                404
            );
        }

        return log;
    }

    async findAll(
        filters = {}
    ) {
        return await logLemburRepository
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
        id_log_lembur
    ) {
        return await this
            .checkLogLembur(
                id_log_lembur
            );
    }

    async findByLembur(
        id_lembur
    ) {
        return await logLemburRepository
            .findByLembur(
                id_lembur
            );
    }

    async create(
        data,
        transaction = null
    ) {
        return await logLemburRepository
            .create(
                data,
                transaction
            );
    }
}

module.exports =
    new LogLemburService();

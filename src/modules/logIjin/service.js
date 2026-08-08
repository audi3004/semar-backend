const logIjinRepository =
    require("./repository");

const AppError = require(
    "../../utils/appError"
);

class LogIjinService {
    normalizeDate(value) {
        return value
            ? String(value)
                .slice(0, 10)
            : value;
    }

    async checkLogIjin(
        id_log_ijin
    ) {
        const log =
            await logIjinRepository
                .findById(
                    id_log_ijin
                );

        if (!log) {
            throw new AppError(
                "Log ijin tidak ditemukan",
                404
            );
        }

        return log;
    }

    async findAll(
        filters = {}
    ) {
        return await logIjinRepository
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
        id_log_ijin
    ) {
        return await this.checkLogIjin(
            id_log_ijin
        );
    }

    async findByIjin(
        id_ijin
    ) {
        return await logIjinRepository
            .findByIjin(
                id_ijin
            );
    }

    async create(
        data,
        transaction = null
    ) {
        return await logIjinRepository
            .create(
                data,
                transaction
            );
    }
}

module.exports =
    new LogIjinService();

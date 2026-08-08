const logSppdRepository =
    require("./repository");

const AppError = require(
    "../../utils/appError"
);

class LogSppdService {
    normalizeDate(value) {
        return value
            ? String(value)
                .slice(0, 10)
            : value;
    }

    async checkLogSppd(
        id_log_sppd
    ) {
        const log =
            await logSppdRepository
                .findById(
                    id_log_sppd
                );

        if (!log) {
            throw new AppError(
                "Log SPPD tidak ditemukan",
                404
            );
        }

        return log;
    }

    async findAll(
        filters = {}
    ) {
        return await logSppdRepository
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
        id_log_sppd
    ) {
        return await this.checkLogSppd(
            id_log_sppd
        );
    }

    async findBySppd(
        id_sppd
    ) {
        return await logSppdRepository
            .findBySppd(
                id_sppd
            );
    }

    async create(
        data,
        transaction = null
    ) {
        return await logSppdRepository
            .create(
                data,
                transaction
            );
    }
}

module.exports =
    new LogSppdService();

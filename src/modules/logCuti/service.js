const logCutiRepository =
    require("./repository");

const AppError = require(
    "../../utils/appError"
);

class LogCutiService {
    normalizeDate(value) {
        if (!value) {
            return value;
        }

        return String(value)
            .slice(0, 10);
    }

    async checkLogCuti(
        id_log_cuti
    ) {
        const log =
            await logCutiRepository
                .findById(
                    id_log_cuti
                );

        if (!log) {
            throw new AppError(
                "Log cuti tidak ditemukan",
                404
            );
        }

        return log;
    }

    async findAll(
        filters = {}
    ) {
        return await logCutiRepository
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
        id_log_cuti
    ) {
        return await this
            .checkLogCuti(
                id_log_cuti
            );
    }

    async findByCuti(
        id_cuti
    ) {
        return await logCutiRepository
            .findByCuti(
                id_cuti
            );
    }

    async create(
        data,
        transaction = null
    ) {
        return await logCutiRepository
            .create(
                data,
                transaction
            );
    }
}

module.exports =
    new LogCutiService();

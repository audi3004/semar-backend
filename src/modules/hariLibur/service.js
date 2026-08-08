const repository = require(
    "./repository"
);
const AppError = require(
    "../../utils/appError"
);

class HariLiburService {
    normalizeText(value) {
        if (
            value === undefined ||
            value === null
        ) {
            return value;
        }

        return String(value)
            .trim()
            .replace(/\s+/g, " ");
    }

    async check(id_hari_libur) {
        const data =
            await repository.findById(
                id_hari_libur
            );

        if (!data) {
            throw new AppError(
                "Data hari libur tidak ditemukan",
                404
            );
        }

        return data;
    }

    async ensureDateAvailable(
        tanggal,
        excludeId = null
    ) {
        const duplicate =
            await repository.findByDate(
                tanggal,
                excludeId
            );

        if (duplicate) {
            throw new AppError(
                `Hari libur tanggal ${tanggal} sudah tersedia`,
                409
            );
        }
    }

    async findAll(filters = {}) {
        return await repository.findAll({
            ...filters,
            nama_hari_libur:
                this.normalizeText(
                    filters.nama_hari_libur
                ),
            is_active:
                filters.is_active
                    ?.trim()
                    .toUpperCase(),
        });
    }

    async findById(id_hari_libur) {
        return await this.check(
            id_hari_libur
        );
    }

    async create(data, created_by) {
        await this.ensureDateAvailable(
            data.tanggal
        );

        return await repository.create(
            {
                tanggal: data.tanggal,
                nama_hari_libur:
                    this.normalizeText(
                        data.nama_hari_libur
                    ),
                keterangan:
                    this.normalizeText(
                        data.keterangan
                    ) || null,
                is_active:
                    data.is_active ?? "Y",
            },
            created_by
        );
    }

    async update(
        id_hari_libur,
        data,
        updated_by
    ) {
        const current =
            await this.check(
                id_hari_libur
            );
        const tanggal =
            data.tanggal ??
            current.tanggal;

        await this.ensureDateAvailable(
            tanggal,
            id_hari_libur
        );

        return await repository.update(
            id_hari_libur,
            {
                ...data,
                tanggal,
                nama_hari_libur:
                    this.normalizeText(
                        data.nama_hari_libur ??
                        current.nama_hari_libur
                    ),
                keterangan:
                    data.keterangan !==
                    undefined
                        ? this.normalizeText(
                            data.keterangan
                        ) || null
                        : current.keterangan,
            },
            updated_by
        );
    }

    async delete(id_hari_libur) {
        await this.check(id_hari_libur);
        await repository.delete(
            id_hari_libur
        );
        return true;
    }
}

module.exports =
    new HariLiburService();

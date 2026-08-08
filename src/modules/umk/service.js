const umkRepository = require(
    "./repository"
);

const AppError = require(
    "../../utils/appError"
);

class UmkService {
    normalizeJenisWilayah(value) {
        return value
            ? value
                .trim()
                .toUpperCase()
            : value;
    }

    normalizeNamaWilayah(value) {
        return value
            ? value.trim()
            : value;
    }

    async checkUmk(id_umk) {
        const umk =
            await umkRepository.findById(
                id_umk
            );

        if (!umk) {
            throw new AppError(
                "Data UMK tidak ditemukan",
                404
            );
        }

        return umk;
    }

    async ensureAvailable(
        jenis_wilayah,
        nama_wilayah,
        tahun_umk,
        excludeId = null
    ) {
        const duplicate =
            await umkRepository
                .findDuplicate(
                    jenis_wilayah,
                    nama_wilayah,
                    tahun_umk,
                    excludeId
                );

        if (duplicate) {
            throw new AppError(
                `UMK ${nama_wilayah} untuk tahun ${tahun_umk} sudah tersedia`,
                409
            );
        }
    }

    async findAll(filters) {
        const normalizedFilters = {
            ...filters,

            jenis_wilayah:
                this.normalizeJenisWilayah(
                    filters
                        .jenis_wilayah
                ),
        };

        return await umkRepository
            .findAll(
                normalizedFilters
            );
    }

    async findById(id_umk) {
        return await this.checkUmk(
            id_umk
        );
    }

    async create(
        data,
        created_by
    ) {
        const jenisWilayah =
            this.normalizeJenisWilayah(
                data.jenis_wilayah
            );

        const namaWilayah =
            this.normalizeNamaWilayah(
                data.nama_wilayah
            );

        await this.ensureAvailable(
            jenisWilayah,
            namaWilayah,
            data.tahun_umk
        );

        return await umkRepository.create(
            {
                jenis_wilayah:
                    jenisWilayah,

                nama_wilayah:
                    namaWilayah,

                tahun_umk:
                    data.tahun_umk,

                nominal_umk:
                    data.nominal_umk,

                is_active:
                    data.is_active ??
                    "Y",
            },
            created_by
        );
    }

    async update(
        id_umk,
        data,
        updated_by
    ) {
        const currentUmk =
            await this.checkUmk(
                id_umk
            );

        const jenisWilayah =
            this.normalizeJenisWilayah(
                data.jenis_wilayah ??
                currentUmk
                    .jenis_wilayah
            );

        const namaWilayah =
            this.normalizeNamaWilayah(
                data.nama_wilayah ??
                currentUmk
                    .nama_wilayah
            );

        const tahunUmk =
            data.tahun_umk ??
            currentUmk.tahun_umk;

        await this.ensureAvailable(
            jenisWilayah,
            namaWilayah,
            tahunUmk,
            id_umk
        );

        return await umkRepository.update(
            id_umk,
            {
                ...data,

                jenis_wilayah:
                    jenisWilayah,

                nama_wilayah:
                    namaWilayah,

                tahun_umk:
                    tahunUmk,
            },
            updated_by
        );
    }

    async delete(id_umk) {
        await this.checkUmk(id_umk);

        await umkRepository.delete(
            id_umk
        );

        return true;
    }
}

module.exports = new UmkService();
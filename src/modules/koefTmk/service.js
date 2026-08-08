const koefTmkRepository = require(
    "./repository"
);

const AppError = require(
    "../../utils/appError"
);

class KoefTmkService {
    normalizeNullableText(value) {
        if (
            value === undefined ||
            value === null
        ) {
            return value;
        }

        const normalized =
            String(value)
                .trim()
                .replace(/\s+/g, " ");

        return normalized || null;
    }

    normalizeMasaKerja(value) {
        if (
            value === undefined ||
            value === null
        ) {
            return value;
        }

        return value
            .trim()
            .replace(/\s+/g, " ");
    }

    normalizeStatus(value) {
        if (
            value === undefined ||
            value === null
        ) {
            return value;
        }

        return value
            .trim()
            .toUpperCase();
    }

    normalizeDecimal(value) {
        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return value;
        }

        return Number(value);
    }

    async checkKoefTmk(id_koef_tmk) {
        const data =
            await koefTmkRepository.findById(
                id_koef_tmk
            );

        if (!data) {
            throw new AppError(
                "Data koefisien TMK tidak ditemukan",
                404
            );
        }

        return data;
    }

    async ensureMasaKerjaAvailable(
        masa_kerja,
        excludeId = null
    ) {
        const duplicate =
            await koefTmkRepository
                .findByMasaKerja(
                    masa_kerja,
                    excludeId
                );

        if (duplicate) {
            throw new AppError(
                `Masa kerja "${masa_kerja}" sudah tersedia`,
                409
            );
        }
    }

    validatePercentage(
        value,
        fieldName
    ) {
        const numberValue =
            Number(value);

        if (
            Number.isNaN(numberValue)
        ) {
            throw new AppError(
                `${fieldName} harus berupa angka`,
                400
            );
        }

        if (
            numberValue < 0 ||
            numberValue > 100
        ) {
            throw new AppError(
                `${fieldName} harus berada antara 0 sampai 100 persen`,
                400
            );
        }

        return numberValue;
    }

    async findAll(filters = {}) {
        const normalizedFilters = {
            ...filters,

            masa_kerja:
                this.normalizeMasaKerja(
                    filters.masa_kerja
                ),

            koef:
                this.normalizeDecimal(
                    filters.koef
                ),

            tmk:
                this.normalizeDecimal(
                    filters.tmk
                ),

            keterangan:
                this.normalizeNullableText(
                    filters.keterangan
                ),

            is_active:
                this.normalizeStatus(
                    filters.is_active
                ),
        };

        return await koefTmkRepository
            .findAll(
                normalizedFilters
            );
    }

    async findById(id_koef_tmk) {
        return await this.checkKoefTmk(
            id_koef_tmk
        );
    }

    async create(
        data,
        created_by = null
    ) {
        const masaKerja =
            this.normalizeMasaKerja(
                data.masa_kerja
            );

        const koef =
            this.validatePercentage(
                data.koef,
                "Koef"
            );

        const tmk =
            this.validatePercentage(
                data.tmk,
                "TMK"
            );

        const isActive =
            this.normalizeStatus(
                data.is_active ?? "Y"
            );

        await this
            .ensureMasaKerjaAvailable(
                masaKerja
            );

        return await koefTmkRepository
            .create(
                {
                    masa_kerja:
                        masaKerja,

                    koef,

                    tmk,

                    keterangan:
                        this.normalizeNullableText(
                            data.keterangan
                        ) ?? null,

                    is_active:
                        isActive,
                },
                created_by
            );
    }

    async update(
        id_koef_tmk,
        data,
        updated_by = null
    ) {
        const currentData =
            await this.checkKoefTmk(
                id_koef_tmk
            );

        const masaKerja =
            this.normalizeMasaKerja(
                data.masa_kerja ??
                currentData
                    .masa_kerja
            );

        const koef =
            data.koef !== undefined
                ? this
                    .validatePercentage(
                        data.koef,
                        "Koef"
                    )
                : Number(
                    currentData.koef
                );

        const tmk =
            data.tmk !== undefined
                ? this
                    .validatePercentage(
                        data.tmk,
                        "TMK"
                    )
                : Number(
                    currentData.tmk
                );

        const isActive =
            this.normalizeStatus(
                data.is_active ??
                currentData
                    .is_active
            );

        const keterangan =
            data.keterangan !==
                undefined
                ? this.normalizeNullableText(
                    data.keterangan
                )
                : currentData
                    .keterangan;

        await this
            .ensureMasaKerjaAvailable(
                masaKerja,
                id_koef_tmk
            );

        return await koefTmkRepository
            .update(
                id_koef_tmk,
                {
                    masa_kerja:
                        masaKerja,

                    koef,

                    tmk,

                    keterangan,

                    is_active:
                        isActive,
                },
                updated_by
            );
    }

    async delete(id_koef_tmk) {
        await this.checkKoefTmk(
            id_koef_tmk
        );

        await koefTmkRepository.delete(
            id_koef_tmk
        );

        return true;
    }
}

module.exports = new KoefTmkService();

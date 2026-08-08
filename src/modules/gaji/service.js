const gajiRepository = require(
    "./repository"
);

const umkRepository = require(
    "../umk/repository"
);

const koefTmkRepository = require(
    "../koefTmk/repository"
);

const AppError = require(
    "../../utils/AppError"
);

class GajiService {
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

    async checkGaji(id_gaji) {
        const gaji =
            await gajiRepository.findById(
                id_gaji
            );

        if (!gaji) {
            throw new AppError(
                "Data gaji tidak ditemukan",
                404
            );
        }

        return gaji;
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

    async checkKoefTmk(
        id_koef_tmk
    ) {
        const koefTmk =
            await koefTmkRepository
                .findById(
                    id_koef_tmk
                );

        if (!koefTmk) {
            throw new AppError(
                "Data koefisien TMK tidak ditemukan",
                404
            );
        }

        return koefTmk;
    }

    async ensureAvailable(
        id_umk,
        id_koef_tmk,
        excludeId = null
    ) {
        const duplicate =
            await gajiRepository
                .findDuplicate(
                    id_umk,
                    id_koef_tmk,
                    excludeId
                );

        if (duplicate) {
            throw new AppError(
                "Kombinasi UMK dan koefisien TMK tersebut sudah memiliki data gaji",
                409
            );
        }
    }

    async findAll(filters = {}) {
        return await gajiRepository
            .findAll({
                ...filters,

                is_active:
                    this.normalizeStatus(
                        filters.is_active
                    ),
            });
    }

    async findById(id_gaji) {
        return await this.checkGaji(
            id_gaji
        );
    }

    async create(
        data,
        created_by = null
    ) {
        await this.checkUmk(
            data.id_umk
        );

        await this.checkKoefTmk(
            data.id_koef_tmk
        );

        await this.ensureAvailable(
            data.id_umk,
            data.id_koef_tmk
        );

        return await gajiRepository.create(
            {
                id_umk:
                    data.id_umk,

                id_koef_tmk:
                    data.id_koef_tmk,

                gaji_pokok:
                    data.gaji_pokok,

                is_active:
                    this.normalizeStatus(
                        data.is_active ??
                        "Y"
                    ),
            },
            created_by
        );
    }

    async update(
        id_gaji,
        data,
        updated_by = null
    ) {
        const currentGaji =
            await this.checkGaji(
                id_gaji
            );

        const idUmk =
            data.id_umk ??
            currentGaji.id_umk;

        const idKoefTmk =
            data.id_koef_tmk ??
            currentGaji
                .id_koef_tmk;

        if (
            data.id_umk !== undefined
        ) {
            await this.checkUmk(
                idUmk
            );
        }

        if (
            data.id_koef_tmk !==
            undefined
        ) {
            await this.checkKoefTmk(
                idKoefTmk
            );
        }

        await this.ensureAvailable(
            idUmk,
            idKoefTmk,
            id_gaji
        );

        return await gajiRepository.update(
            id_gaji,
            {
                ...data,

                id_umk:
                    idUmk,

                id_koef_tmk:
                    idKoefTmk,

                is_active:
                    this.normalizeStatus(
                        data.is_active ??
                        currentGaji
                            .is_active
                    ),
            },
            updated_by
        );
    }

    async delete(id_gaji) {
        await this.checkGaji(
            id_gaji
        );

        await gajiRepository.delete(
            id_gaji
        );

        return true;
    }
}

module.exports = new GajiService();

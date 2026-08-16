const petugasRepository = require(
    "./repository"
);

const unitRepository = require(
    "../unit/repository"
);

const jabatanRepository = require(
    "../jabatan/repository"
);

const umkRepository = require(
    "../umk/repository"
);
const projectRepository = require("../project/repository");

const AppError = require(
    "../../utils/appError"
);

class PetugasService {
    normalizeText(value) {
        if (
            value === undefined ||
            value === null
        ) {
            return value;
        }

        return value
            .trim()
            .replace(
                /\s+/g,
                " "
            );
    }

    normalizeNip(value) {
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

    async checkPetugas(
        id_petugas
    ) {
        const petugas =
            await petugasRepository
                .findById(
                    id_petugas
                );

        if (!petugas) {
            throw new AppError(
                "Data petugas tidak ditemukan",
                404
            );
        }

        return petugas;
    }

    async checkUnit(id_unit) {
        const unit =
            await unitRepository
                .findById(
                    id_unit
                );

        if (!unit) {
            throw new AppError(
                "Data unit tidak ditemukan",
                404
            );
        }

        return unit;
    }

    async checkJabatan(
        id_jabatan
    ) {
        if (
            id_jabatan === null ||
            id_jabatan === undefined
        ) {
            return null;
        }

        const jabatan =
            await jabatanRepository
                .findById(
                    id_jabatan
                );

        if (!jabatan) {
            throw new AppError(
                "Data jabatan tidak ditemukan",
                404
            );
        }

        return jabatan;
    }

    async checkUmk(
        id_umk
    ) {
        const umk =
            await umkRepository
                .findById(
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

    async ensureNipAvailable(
        nip,
        excludeId = null
    ) {
        const duplicate =
            await petugasRepository
                .findByNip(
                    nip,
                    excludeId
                );

        if (duplicate) {
            throw new AppError(
                `NIP petugas "${nip}" sudah digunakan`,
                409
            );
        }
    }

    async findAll(
        filters = {}
    ) {
        return await petugasRepository
            .findAll({
                ...filters,

                nip:
                    this.normalizeNip(
                        filters.nip
                    ),

                nama:
                    this.normalizeText(
                        filters.nama
                    ),

                is_active:
                    this.normalizeStatus(
                        filters
                            .is_active
                    ),
            });
    }

    async findById(
        id_petugas
    ) {
        return await this.checkPetugas(
            id_petugas
        );
    }

    async create(
        data,
        created_by = null
    ) {
        const nip =
            this.normalizeNip(
                data.nip
            );

        const nama =
            this.normalizeText(
                data.nama
            );

        const isActive =
            this.normalizeStatus(
                data.is_active ??
                "Y"
            );

        await this.checkUnit(
            data.id_unit
        );
        if (!await projectRepository.findById(data.id_project)) throw new AppError("Project petugas tidak ditemukan", 404);

        await this.checkJabatan(
            data.id_jabatan
        );

        if (data.id_umk) {
            await this.checkUmk(
                data.id_umk
            );
        }

        await this
            .ensureNipAvailable(
                nip
            );

        return await petugasRepository
            .create(
                {
                    id_unit:
                        data.id_unit,
                    id_project: data.id_project,

                    id_jabatan:
                        data.id_jabatan ??
                        null,

                    id_umk:
                        data.id_umk ??
                        null,

                    nip,

                    nama,

                    tgl_masuk:
                        data.tgl_masuk,

                    tgl_lahir:
                        data.tgl_lahir ??
                        null,

                    is_active:
                        isActive,
                },
                created_by
            );
    }

    async update(
        id_petugas,
        data,
        updated_by = null
    ) {
        const currentPetugas =
            await this.checkPetugas(
                id_petugas
            );

        const idUnit =
            data.id_unit ??
            currentPetugas
                .id_unit;

        const idJabatan =
            data.id_jabatan !==
                undefined
                ? data.id_jabatan
                : currentPetugas
                    .id_jabatan;
        const idProject = data.id_project ?? currentPetugas.id_project;

        const idUmk =
            data.id_umk ??
            currentPetugas
                .id_umk;

        const nip =
            this.normalizeNip(
                data.nip ??
                currentPetugas
                    .nip
            );

        const nama =
            this.normalizeText(
                data.nama ??
                currentPetugas
                    .nama
            );

        const isActive =
            this.normalizeStatus(
                data.is_active ??
                currentPetugas
                    .is_active
            );

        if (
            data.id_unit !==
            undefined
        ) {
            await this.checkUnit(
                idUnit
            );
        }
        if (data.id_project !== undefined && !await projectRepository.findById(idProject)) throw new AppError("Project petugas tidak ditemukan", 404);

        if (
            data.id_jabatan !==
            undefined
        ) {
            await this.checkJabatan(
                idJabatan
            );
        }

        if (
            data.id_umk !==
                undefined &&
            idUmk !== null
        ) {
            await this.checkUmk(
                idUmk
            );
        }

        await this
            .ensureNipAvailable(
                nip,
                id_petugas
            );

        return await petugasRepository
            .update(
                id_petugas,
                {
                    ...data,

                    id_unit:
                        idUnit,
                    id_project: idProject,

                    id_jabatan:
                        idJabatan,

                    id_umk:
                        idUmk,

                    nip,

                    nama,

                    tgl_lahir:
                        data.tgl_lahir !==
                            undefined
                            ? data.tgl_lahir
                            : currentPetugas
                                .tgl_lahir,

                    is_active:
                        isActive,
                },
                updated_by
            );
    }

    async delete(
        id_petugas
    ) {
        await this.checkPetugas(
            id_petugas
        );

        await petugasRepository
            .delete(
                id_petugas
            );

        return true;
    }
}

module.exports =
    new PetugasService();

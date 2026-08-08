const unitRepository = require("./repository");
const AppError = require("../../utils/appError");

class UnitService {
    async checkUnit(id_unit) {
        const unit =
            await unitRepository.findById(
                id_unit
            );

        if (!unit) {
            throw new AppError(
                "Unit tidak ditemukan",
                404
            );
        }

        return unit;
    }


    async checkIndukUnit(
        id_induk_unit,
        currentId = null
    ) {
        if (!id_induk_unit) {
            return null;
        }

        if (
            currentId &&
            Number(id_induk_unit) ===
            Number(currentId)
        ) {
            throw new AppError(
                "Unit tidak dapat menjadi induk bagi dirinya sendiri",
                400
            );
        }

        const induk =
            await unitRepository.findById(
                id_induk_unit
            );

        if (!induk) {
            throw new AppError(
                "Induk unit tidak ditemukan",
                404
            );
        }

        return induk;
    }

    async ensureUnitAvailable(
        nama_unit,
        id_induk_unit = null,
        excludeId = null
    ) {
        const exist =
            await unitRepository.findByName(
                nama_unit,
                id_induk_unit
            );

        if (
            exist &&
            exist.id_unit !== Number(excludeId)
        ) {
            throw new AppError(
                "Nama unit sudah digunakan pada induk unit tersebut",
                409
            );
        }
    }

    async findAll() {
        return await unitRepository.findAll();
    }

    async findAllWithInactive() {
        return await unitRepository
            .findAllWithInactive();
    }

    async findById(id_unit) {
        return await this.checkUnit(id_unit);
    }

    async findByParent(id_induk_unit) {
        await this.checkIndukUnit(
            id_induk_unit
        );

        return await unitRepository.findByParent(
            id_induk_unit
        );
    }

    async create(data, created_by) {

        await this.checkIndukUnit(
            data.id_induk_unit
        );

        await this.ensureUnitAvailable(
            data.nama_unit,
            data.id_induk_unit || null
        );

        return await unitRepository.create(
            data,
            created_by
        );
    }

    async update(
        id_unit,
        data,
        updated_by
    ) {
        const currentUnit =
            await this.checkUnit(id_unit);


        const idIndukUnit =
            data.id_induk_unit !== undefined
                ? data.id_induk_unit
                : currentUnit.id_induk_unit;

        const namaUnit =
            data.nama_unit ??
            currentUnit.nama_unit;

        await this.checkIndukUnit(
            idIndukUnit,
            id_unit
        );

        await this.ensureUnitAvailable(
            namaUnit,
            idIndukUnit,
            id_unit
        );

        return await unitRepository.update(
            id_unit,
            data,
            updated_by
        );
    }

    async activate(id_unit, updated_by) {
        await this.checkUnit(id_unit);

        return await unitRepository.activate(
            id_unit,
            updated_by
        );
    }

    async deactivate(id_unit, updated_by) {
        await this.checkUnit(id_unit);

        return await unitRepository.deactivate(
            id_unit,
            updated_by
        );
    }

    async delete(id_unit) {
        await this.checkUnit(id_unit);

        return await unitRepository.delete(
            id_unit
        );
    }
}

module.exports = new UnitService();
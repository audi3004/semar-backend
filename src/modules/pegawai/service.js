const pegawaiRepository = require("./repository");
const jabatanRepository = require(
    "../jabatan/repository"
);
const unitRepository = require(
    "../unit/repository"
);
const projectRepository = require("../project/repository");
const AppError = require(
    "../../utils/appError"
);

class PegawaiService {
    async checkPegawai(id_pegawai) {
        const pegawai =
            await pegawaiRepository.findById(
                id_pegawai
            );

        if (!pegawai) {
            throw new AppError(
                "Pegawai tidak ditemukan",
                404
            );
        }

        return pegawai;
    }

    async checkJabatan(id_jabatan) {
        const jabatan =
            await jabatanRepository.findById(
                id_jabatan
            );

        if (!jabatan) {
            throw new AppError(
                "Jabatan tidak ditemukan",
                404
            );
        }

        return jabatan;
    }

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

    async ensureNipAvailable(
        nip,
        excludeId = null
    ) {
        const exist =
            await pegawaiRepository.findByNip(
                nip
            );

        if (
            exist &&
            exist.id_pegawai !==
            Number(excludeId)
        ) {
            throw new AppError(
                "NIP sudah digunakan",
                409
            );
        }
    }

    async findAll() {
        return await pegawaiRepository.findAll();
    }

    async findAllWithInactive() {
        return await pegawaiRepository
            .findAllWithInactive();
    }

    async findById(id_pegawai) {
        return await this.checkPegawai(
            id_pegawai
        );
    }

    async findByUnit(id_unit) {
        await this.checkUnit(id_unit);

        return await pegawaiRepository.findByUnit(
            id_unit
        );
    }

    async findByJabatan(id_jabatan) {
        await this.checkJabatan(id_jabatan);

        return await pegawaiRepository
            .findByJabatan(id_jabatan);
    }

    async create(data, created_by) {
        await this.checkJabatan(
            data.id_jabatan
        );

        await this.checkUnit(
            data.id_unit
        );

        await this.ensureNipAvailable(
            data.nip
        );

        return await pegawaiRepository.create(
            data,
            created_by
        );
    }

    async update(
        id_pegawai,
        data,
        updated_by
    ) {
        await this.checkPegawai(id_pegawai);

        if (data.id_jabatan) {
            await this.checkJabatan(
                data.id_jabatan
            );
        }

        if (data.id_unit) {
            await this.checkUnit(
                data.id_unit
            );
        }

        if (data.nip) {
            await this.ensureNipAvailable(
                data.nip,
                id_pegawai
            );
        }

        return await pegawaiRepository.update(
            id_pegawai,
            data,
            updated_by
        );
    }

    async activate(
        id_pegawai,
        updated_by
    ) {
        await this.checkPegawai(id_pegawai);

        return await pegawaiRepository.activate(
            id_pegawai,
            updated_by
        );
    }

    async deactivate(
        id_pegawai,
        updated_by
    ) {
        await this.checkPegawai(id_pegawai);

        return await pegawaiRepository.deactivate(
            id_pegawai,
            updated_by
        );
    }

    async delete(id_pegawai) {
        await this.checkPegawai(id_pegawai);

        return await pegawaiRepository.delete(
            id_pegawai
        );
    }

    async syncProjects(id_pegawai, projectIds, updated_by) {
        await this.checkPegawai(id_pegawai);
        const uniqueIds = [...new Set(projectIds.map(Number))];
        for (const id of uniqueIds) {
            const project = await projectRepository.findById(id);
            if (!project || project.is_active !== "Y") {
                throw new AppError(`Project ${id} tidak ditemukan atau tidak aktif`, 400);
            }
        }
        return pegawaiRepository.syncProjects(id_pegawai, uniqueIds, updated_by);
    }
}

module.exports = new PegawaiService();

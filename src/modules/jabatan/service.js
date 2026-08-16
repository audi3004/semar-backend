const jabatanRepository = require("./repository");
const AppError = require("../../utils/appError");

class JabatanService {
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

    async ensureJabatanAvailable(
        nama_jabatan,
        excludeId = null
    ) {
        const exist =
            await jabatanRepository.findByName(
                nama_jabatan,
            );

        if (
            exist &&
            exist.id_jabatan !== Number(excludeId)
        ) {
            throw new AppError(
                "Nama jabatan sudah digunakan",
                409
            );
        }
    }

    async findAll() {
        return await jabatanRepository.findAll();
    }

    async findAllWithInactive() {
        return await jabatanRepository.findAllWithInactive();
    }

    async findById(id_jabatan) {
        return await this.checkJabatan(id_jabatan);
    }


    async create(data, created_by) {
        await this.ensureJabatanAvailable(
            data.nama_jabatan
        );

        return await jabatanRepository.create(
            data,
            created_by
        );
    }

    async update(
        id_jabatan,
        data,
        updated_by
    ) {
        const currentJabatan =
            await this.checkJabatan(id_jabatan);

        const namaJabatan =
            data.nama_jabatan ||
            currentJabatan.nama_jabatan;

        await this.ensureJabatanAvailable(
            namaJabatan,
            id_jabatan
        );

        return await jabatanRepository.update(
            id_jabatan,
            data,
            updated_by
        );
    }

    async activate(
        id_jabatan,
        updated_by
    ) {
        await this.checkJabatan(id_jabatan);

        return await jabatanRepository.activate(
            id_jabatan,
            updated_by
        );
    }

    async deactivate(
        id_jabatan,
        updated_by
    ) {
        await this.checkJabatan(id_jabatan);

        return await jabatanRepository.deactivate(
            id_jabatan,
            updated_by
        );
    }

    async delete(id_jabatan) {
        await this.checkJabatan(id_jabatan);

        return await jabatanRepository.delete(
            id_jabatan
        );
    }
}

module.exports = new JabatanService();

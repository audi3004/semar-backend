const {
    sequelize,
    Pegawai,
    Petugas,
} = require("../../models");
const mutasiRepository = require("./repository");
const pegawaiRepository = require("../pegawai/repository");
const petugasRepository = require("../petugas/repository");
const unitRepository = require("../unit/repository");
const AppError = require("../../utils/appError");

class MutasiService {
    async checkMutasi(id_mutasi) {
        const mutasi = await mutasiRepository.findById(id_mutasi);
        if (!mutasi) {
            throw new AppError("Data mutasi tidak ditemukan", 404);
        }
        return mutasi;
    }

    async checkPegawai(id_pegawai) {
        const pegawai = await pegawaiRepository.findById(id_pegawai);
        if (!pegawai) {
            throw new AppError("Pegawai tidak ditemukan", 404);
        }
        return pegawai;
    }

    async checkPetugas(id_petugas) {
        const petugas = await petugasRepository.findById(id_petugas);
        if (!petugas) {
            throw new AppError("Petugas tidak ditemukan", 404);
        }
        return petugas;
    }

    async checkUnit(id_unit) {
        const unit = await unitRepository.findById(id_unit);
        if (!unit) {
            throw new AppError("Unit tujuan tidak ditemukan", 404);
        }
        if (unit.is_active !== "Y") {
            throw new AppError("Unit tujuan sedang tidak aktif", 400);
        }
        return unit;
    }

    async findAll() {
        return await mutasiRepository.findAll();
    }

    async findById(id_mutasi) {
        return await this.checkMutasi(id_mutasi);
    }

    async findByPegawai(id_pegawai) {
        await this.checkPegawai(id_pegawai);
        return await mutasiRepository.findByPegawai(id_pegawai);
    }

    async findByPetugas(id_petugas) {
        await this.checkPetugas(id_petugas);
        return await mutasiRepository.findByPetugas(id_petugas);
    }

    async findByUnit(id_unit) {
        await this.checkUnit(id_unit);
        return await mutasiRepository.findByUnit(id_unit);
    }

    async create(data, created_by) {
        await this.checkUnit(data.id_unit_sesudah);

        return await sequelize.transaction(async (transaction) => {
            const isPegawai = Boolean(data.id_pegawai);
            const Model = isPegawai ? Pegawai : Petugas;
            const primaryKey = isPegawai ? "id_pegawai" : "id_petugas";
            const personId = data[primaryKey];

            const person = await Model.findByPk(personId, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!person) {
                throw new AppError(
                    isPegawai
                        ? "Pegawai tidak ditemukan"
                        : "Petugas tidak ditemukan",
                    404
                );
            }

            if (person.is_active !== "Y") {
                throw new AppError(
                    isPegawai
                        ? "Pegawai sedang tidak aktif"
                        : "Petugas sedang tidak aktif",
                    400
                );
            }

            if (
                Number(person.id_unit) ===
                Number(data.id_unit_sesudah)
            ) {
                throw new AppError(
                    "Personel sudah berada pada unit tujuan",
                    400
                );
            }

            const mutasi = await mutasiRepository.create(
                {
                    id_pegawai: data.id_pegawai ?? null,
                    id_petugas: data.id_petugas ?? null,
                    id_unit_sebelum: person.id_unit,
                    id_unit_sesudah: data.id_unit_sesudah,
                    tanggal_mutasi: data.tanggal_mutasi,
                    keterangan: data.keterangan?.trim() || null,
                },
                created_by,
                transaction
            );

            const repository = isPegawai
                ? pegawaiRepository
                : petugasRepository;

            await repository.updateUnit(
                personId,
                data.id_unit_sesudah,
                created_by,
                transaction
            );

            return mutasi.id_mutasi;
        }).then((id_mutasi) =>
            mutasiRepository.findById(id_mutasi)
        );
    }
}

module.exports = new MutasiService();

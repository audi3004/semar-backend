const umkRepository = require(
    "./repository"
);

const AppError = require(
    "../../utils/appError"
);
const { Op } = require("sequelize");
const { sequelize, Umk, Petugas, PetugasUmkHistory, UmkRolloverBatch, ParameterUpahTahunan } = require("../../models");

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

        if (data.id_umk_sebelumnya) await this.checkUmk(data.id_umk_sebelumnya);

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

                id_umk_sebelumnya: data.id_umk_sebelumnya || null,

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

        if (data.id_umk_sebelumnya) {
            if (Number(data.id_umk_sebelumnya) === Number(id_umk)) throw new AppError("UMK sebelumnya tidak boleh merujuk ke data yang sama", 400);
            await this.checkUmk(data.id_umk_sebelumnya);
        }

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

    async rolloverPreview({ tahun_sumber, tahun_tujuan }) {
        const [sourceUmks, targetUmks, parameter] = await Promise.all([
            Umk.findAll({ where: { tahun_umk: tahun_sumber } }),
            Umk.findAll({ where: { tahun_umk: tahun_tujuan } }),
            ParameterUpahTahunan.findOne({ where: { tahun: tahun_tujuan, status: "PUBLISHED" } }),
        ]);
        const sourceIds = sourceUmks.map((item) => Number(item.id_umk));
        const petugas = sourceIds.length ? await Petugas.findAll({
            where: { id_umk: { [Op.in]: sourceIds }, is_active: "Y" },
            attributes: ["id_petugas", "nip", "nama", "id_umk"],
        }) : [];
        const targetBySource = new Map(targetUmks
            .filter((item) => item.id_umk_sebelumnya)
            .map((item) => [Number(item.id_umk_sebelumnya), item]));
        const usedSourceIds = new Set(petugas.map((item) => Number(item.id_umk)));
        const unmapped = sourceUmks.filter((item) => usedSourceIds.has(Number(item.id_umk)) && !targetBySource.has(Number(item.id_umk)));
        const duplicateSources = targetUmks.reduce((result, item) => {
            const id = Number(item.id_umk_sebelumnya || 0);
            if (id && targetUmks.filter((candidate) => Number(candidate.id_umk_sebelumnya) === id).length > 1) result.add(id);
            return result;
        }, new Set());

        return {
            tahun_sumber,
            tahun_tujuan,
            jumlah_umk_sumber: sourceUmks.length,
            jumlah_umk_tujuan: targetUmks.length,
            jumlah_petugas: petugas.length,
            parameter_tahunan: parameter,
            umk_belum_dipetakan: unmapped.map((item) => ({ id_umk: item.id_umk, nama_wilayah: item.nama_wilayah })),
            id_umk_mapping_ganda: [...duplicateSources],
            siap_generate: Boolean(parameter) && petugas.length > 0 && unmapped.length === 0 && duplicateSources.size === 0,
        };
    }

    async executeRollover(payload, userId) {
        const preview = await this.rolloverPreview(payload);
        if (!preview.parameter_tahunan) throw new AppError(`Parameter upah tahun ${payload.tahun_tujuan} belum dipublikasikan`, 422);
        if (preview.umk_belum_dipetakan.length) throw new AppError("Masih ada UMK petugas yang belum dipetakan ke tahun tujuan", 422);
        if (preview.id_umk_mapping_ganda.length) throw new AppError("Terdapat mapping UMK tujuan yang ganda", 422);

        return sequelize.transaction(async (transaction) => {
            const sourceUmks = await Umk.findAll({ where: { tahun_umk: payload.tahun_sumber }, transaction, lock: transaction.LOCK.UPDATE });
            const sourceIds = sourceUmks.map((item) => Number(item.id_umk));
            const targetUmks = await Umk.findAll({ where: { tahun_umk: payload.tahun_tujuan }, transaction });
            const targetBySource = new Map(targetUmks.map((item) => [Number(item.id_umk_sebelumnya), item]));
            const petugas = sourceIds.length ? await Petugas.findAll({
                where: { id_umk: { [Op.in]: sourceIds }, is_active: "Y" }, transaction, lock: transaction.LOCK.UPDATE,
            }) : [];
            const effectiveStart = `${payload.tahun_tujuan}-01-01`;
            const endDate = new Date(Date.UTC(payload.tahun_tujuan, 0, 0)).toISOString().slice(0, 10);

            for (const employee of petugas) {
                const target = targetBySource.get(Number(employee.id_umk));
                if (!target) throw new AppError(`Mapping UMK untuk petugas ${employee.nip} tidak ditemukan`, 422);
                const openHistory = await PetugasUmkHistory.findOne({
                    where: { id_petugas: employee.id_petugas, berlaku_sampai: null }, transaction, lock: transaction.LOCK.UPDATE,
                });
                if (openHistory) await openHistory.update({ berlaku_sampai: endDate, updated_by: userId }, { transaction });
                else await PetugasUmkHistory.findOrCreate({
                    where: { id_petugas: employee.id_petugas, berlaku_mulai: `${payload.tahun_sumber}-01-01` },
                    defaults: { id_umk: employee.id_umk, berlaku_sampai: endDate, created_by: userId }, transaction,
                });
                await PetugasUmkHistory.findOrCreate({
                    where: { id_petugas: employee.id_petugas, berlaku_mulai: effectiveStart },
                    defaults: { id_umk: target.id_umk, berlaku_sampai: null, created_by: userId }, transaction,
                });
                await employee.update({ id_umk: target.id_umk, updated_by: userId }, { transaction });
            }

            const batch = await UmkRolloverBatch.create({
                tahun_sumber: payload.tahun_sumber,
                tahun_tujuan: payload.tahun_tujuan,
                jumlah_petugas: petugas.length,
                status: "SUCCESS",
                detail: JSON.stringify({ preview, effective_start: effectiveStart }),
                created_by: userId,
            }, { transaction });
            return { ...preview, jumlah_petugas_diperbarui: petugas.length, id_batch: batch.id_umk_rollover_batch };
        });
    }
}

module.exports = new UmkService();

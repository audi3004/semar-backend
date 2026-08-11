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
    "../../utils/appError"
);

class GajiService {
    resolveUmkForDate(employee, calculationDate) {
        const history = (employee.riwayatUmk || []).find((item) =>
            String(item.berlaku_mulai) <= calculationDate
            && (!item.berlaku_sampai || String(item.berlaku_sampai) >= calculationDate)
        );
        return history?.umk || employee.umk;
    }

    resolveAnnualParameter(parameters, calculationDate) {
        const year = Number(String(calculationDate).slice(0, 4));
        return [...(parameters || [])]
            .sort((a, b) => Number(b.tahun) - Number(a.tahun))
            .find((item) => Number(item.tahun) <= year);
    }

    completedYears(startDate, asOfDate) {
        const [startYear, startMonth, startDay] = String(startDate)
            .slice(0, 10)
            .split("-")
            .map(Number);
        const [endYear, endMonth, endDay] = String(asOfDate)
            .slice(0, 10)
            .split("-")
            .map(Number);

        let years = endYear - startYear;
        if (
            endMonth < startMonth ||
            (endMonth === startMonth && endDay < startDay)
        ) {
            years -= 1;
        }

        return Math.max(0, years);
    }

    async calculateEmployeeSalaries(asOfDate) {
        const calculationDate = asOfDate ||
            new Date().toISOString().slice(0, 10);
        const { petugas, coefficients, parameters } =
            await gajiRepository.findSalaryInputs();

        return petugas.map((record) => {
            const employee = record.get({ plain: true });
            const masaKerja = this.completedYears(
                employee.tgl_masuk,
                calculationDate
            );
            const coefficient = [...coefficients]
                .reverse()
                .find((item) => Number(item.masa_kerja) <= masaKerja);
            const effectiveUmk = this.resolveUmkForDate(employee, calculationDate);
            const annualParameter = this.resolveAnnualParameter(parameters, calculationDate);

            if (!effectiveUmk || !coefficient || !annualParameter) {
                return {
                    ...employee,
                    umk: effectiveUmk || employee.umk,
                    tanggal_perhitungan: calculationDate,
                    masa_kerja_tahun: masaKerja,
                    status_perhitungan: !effectiveUmk
                        ? "UMK petugas belum ditentukan"
                        : !coefficient
                            ? "Koefisien masa kerja tidak ditemukan"
                            : "Parameter upah tahunan belum tersedia",
                };
            }

            const nominalUmk = Number(effectiveUmk.nominal_umk);
            const nilaiRataRata = Number(annualParameter.nilai_rata_rata);
            const koef = Number(coefficient.koef);
            const tmk = Number(coefficient.tmk);
            const nilaiKoef = nominalUmk * koef;
            const nilaiTmk = nilaiRataRata * tmk;
            const totalGaji = nominalUmk + nilaiKoef + nilaiTmk;

            return {
                ...employee,
                umk: effectiveUmk,
                tanggal_perhitungan: calculationDate,
                masa_kerja_tahun: masaKerja,
                id_koef_tmk: coefficient.id_koef_tmk,
                tier_masa_kerja: Number(coefficient.masa_kerja),
                keterangan_koef_tmk: coefficient.keterangan,
                koef,
                tmk,
                tahun_parameter_upah: Number(annualParameter.tahun),
                nilai_rata_rata: nilaiRataRata,
                nilai_koef: Number(nilaiKoef.toFixed(2)),
                nilai_tmk: Number(nilaiTmk.toFixed(2)),
                total_gaji: Number(totalGaji.toFixed(2)),
                tarif_lembur_per_jam: Number((totalGaji / 173).toFixed(6)),
                status_perhitungan: "OK",
            };
        });
    }

    async calculateEmployeeSalary(idPetugas, asOfDate, transaction = null) {
        const calculationDate = asOfDate || new Date().toISOString().slice(0, 10);
        const { petugas, coefficients, parameters } =
            await gajiRepository.findSalaryInputByEmployee(idPetugas, transaction);

        if (!petugas) throw new AppError("Petugas tidak ditemukan", 404);
        const effectiveUmk = this.resolveUmkForDate(petugas, calculationDate);
        const annualParameter = this.resolveAnnualParameter(parameters, calculationDate);
        if (!effectiveUmk) throw new AppError("UMK petugas belum ditentukan", 422);
        if (!annualParameter) throw new AppError("Parameter upah tahunan belum tersedia", 422);

        const masaKerja = this.completedYears(petugas.tgl_masuk, calculationDate);
        const coefficient = coefficients.find(
            (item) => Number(item.masa_kerja) <= masaKerja
        );
        if (!coefficient) {
            throw new AppError(`Koefisien untuk masa kerja ${masaKerja} tahun tidak ditemukan`, 422);
        }

        const nominalUmk = Number(effectiveUmk.nominal_umk);
        const nilaiRataRata = Number(annualParameter.nilai_rata_rata);
        const totalGaji = nominalUmk
            + (nominalUmk * Number(coefficient.koef))
            + (nilaiRataRata * Number(coefficient.tmk));

        return {
            id_petugas: petugas.id_petugas,
            masa_kerja_tahun: masaKerja,
            id_umk: effectiveUmk.id_umk,
            id_koef_tmk: coefficient.id_koef_tmk,
            tahun_parameter_upah: Number(annualParameter.tahun),
            nilai_rata_rata: nilaiRataRata,
            total_gaji: Number(totalGaji.toFixed(2)),
            tarif_lembur_per_jam: Number((totalGaji / 173).toFixed(6)),
        };
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

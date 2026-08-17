const lemburRepository = require(
    "./repository"
);

const petugasRepository = require(
    "../petugas/repository"
);

const statusRepository = require(
    "../status/repository"
);

const logLemburService = require(
    "../logLembur/service"
);

const gajiService = require(
    "../gaji/service"
);

const {
    sequelize,
    SpklPetugas,
    Spkl,
    Cuti,
    Ijin,
    Sakit,
    Status,
    Lembur,
} = require("../../models");

const AppError = require(
    "../../utils/appError"
);
const getWorkflowScope = require("../../utils/workflowScope");
const { generateDocumentNumber } = require("../../utils/documentNumber");
const { assertWorkflowAssignment, resolveRevisionStatus, resolveNextStatusWithBypass } = require("../../utils/workflowAction");
const { scopeTransactionFilters, assertTransactionOwner } = require("../../utils/transactionAccess");

class LemburService {
    async findAvailableBases(user, tanggal = null) {
        this.validateAuthenticatedUser(user);
        if (!user.id_petugas) throw new AppError("Akun Maker tidak terhubung dengan data petugas", 422);
        return lemburRepository.findAvailableBases(user.id_petugas, tanggal ? this.normalizeDate(tanggal) : null);
    }

    async resolveBasis(data, user, transaction = null) {
        const type = String(data.dasar_lembur_type || "").toUpperCase();
        const config = { SPKL: ["id_spkl_petugas", SpklPetugas], CUTI: ["id_cuti", Cuti], IJIN: ["id_ijin", Ijin], SAKIT: ["id_sakit", Sakit] }[type];
        if (!config) throw new AppError("Dasar lembur wajib dipilih dari SPKL, Cuti, Ijin, atau Sakit", 422);
        const [field, Model] = config; const referenceId = data[field];
        if (!referenceId) throw new AppError(`Referensi ${type} wajib dipilih`, 422);
        const referenceCount = [data.id_spkl_petugas, data.id_cuti, data.id_ijin, data.id_sakit].filter((value) => value != null).length;
        if (referenceCount !== 1) throw new AppError("Tepat satu referensi dasar lembur wajib diisi", 422);
        if (type === "SPKL") {
            const assignment = await Model.findByPk(referenceId, { include: [{ model: Spkl, as: "spkl", required: true }], transaction, lock: transaction?.LOCK?.UPDATE });
            if (!assignment || Number(assignment.id_petugas) !== Number(data.id_petugas) || Number(user?.id_petugas) !== Number(assignment.id_petugas)) throw new AppError("Assignment SPKL tidak ditujukan kepada petugas ini", 403);
            if (assignment.spkl.status_spkl !== "ACTIVE" || !["ASSIGNED", "DRAFTED"].includes(assignment.status_penugasan)) throw new AppError("Assignment SPKL sudah tidak dapat digunakan", 409);
            if (await Lembur.findOne({ where: { id_spkl_petugas: referenceId }, transaction })) throw new AppError("Assignment SPKL sudah digunakan", 409);
            if (assignment.spkl.kode_jenis_pekerjaan === "SIAGA_HARI_LIBUR") await this.validateHoliday(assignment.spkl.tgl_lembur);
            return { type, assignment, source: assignment.spkl, tgl_lembur: assignment.spkl.tgl_lembur, kategori_lembur: assignment.spkl.kategori_lembur, jenis_pekerjaan: assignment.spkl.jenis_pekerjaan, area_group: assignment.spkl.area_group, detail_pekerjaan_lembur: assignment.spkl.detail_pekerjaan, id_petugas_cuti: null, is_hari_libur: assignment.spkl.kode_jenis_pekerjaan === "SIAGA_HARI_LIBUR" ? "Y" : "N", evidenceOptional: assignment.spkl.kode_jenis_pekerjaan === "SIAGA_HARI_LIBUR" };
        }
        const source = await Model.findByPk(referenceId, { include: [{ model: Status, as: "status", required: true }], transaction });
        if (!source || ["DRAFT", "REVISION", "REJECTED", "CANCELLED"].includes(source.status.kode_status)) throw new AppError(`Transaksi ${type} tidak valid sebagai dasar lembur`, 422);
        if (Number(source.id_petugas) === Number(data.id_petugas)) throw new AppError("Petugas tidak dapat menggantikan dirinya sendiri", 422);
        if (await Lembur.findOne({ where: { [field]: referenceId }, transaction })) throw new AppError(`Transaksi ${type} sudah digunakan sebagai dasar lembur`, 409);
        const maker = await this.checkPetugas(data.id_petugas); const replaced = await this.checkPetugas(source.id_petugas);
        if (Number(maker.id_unit) !== Number(replaced.id_unit)) throw new AppError("Petugas pengganti harus berada pada unit yang sama", 422);
        const date = this.normalizeDate(data.tgl_lembur); const start = this.normalizeDate(type === "CUTI" ? source.tgl_mulai : source.tanggal); const end = this.normalizeDate(source.tgl_selesai);
        if (!date || date < start || date > end) throw new AppError(`Tanggal lembur harus berada dalam periode ${type}`, 422);
        return { type, source, tgl_lembur: date, kategori_lembur: "005 - Piket Tanggal Merah / Cuti Pengganti", jenis_pekerjaan: `Pengganti ${type}`, area_group: data.area_group, detail_pekerjaan_lembur: data.detail_pekerjaan_lembur, id_petugas_cuti: source.id_petugas, is_hari_libur: "N", evidenceOptional: true };
    }
    async findReplacementCandidates(tanggal) {
        return await lemburRepository.findReplacementCandidates(
            this.normalizeDate(tanggal)
        );
    }

    async validateReplacementCandidate(idPetugas, tanggal) {
        const candidates = await this.findReplacementCandidates(tanggal);
        if (!candidates.some((item) => Number(item.id_petugas) === Number(idPetugas))) {
            throw new AppError(
                "Petugas yang digantikan tidak memiliki pengajuan cuti, ijin, atau sakit aktif pada tanggal lembur",
                422
            );
        }
    }

    async validateHoliday(tanggal) {
        const holiday = await lemburRepository.findHolidayByDate(tanggal);
        if (!holiday) {
            throw new AppError(
                `Tanggal ${tanggal} tidak terdaftar sebagai hari libur aktif pada Master Hari Libur`,
                422
            );
        }
        return holiday;
    }

    isHolidayOvertime(jenisPekerjaan) {
        return this.normalizeText(jenisPekerjaan) === "Siaga / Libur Nasional";
    }

    isLeaveReplacement(jenisPekerjaan) {
        return this.normalizeText(jenisPekerjaan) === "Pengganti Piket (Operator sedang cuti)";
    }

    calculateOvertimeCost(hourlyRate, hours) {
        return Number((Number(hourlyRate) * Number(hours)).toFixed(2));
    }

    getStoredHourlyRate(lembur) {
        const effectiveHours = Number(
            lembur.jumlah_jam_koreksi ?? lembur.total_jam
        );
        if (effectiveHours <= 0) return 0;
        return Number(lembur.biaya_lembur || 0) / effectiveHours;
    }

    getSignatureField(user) {
        const code = String(user?.kode_role || user?.role?.kode_role || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        const mapping = {
            MAKER: "maker_signature",
            CHECKER: "checker_signature",
            VERIFICATION: "verification_signature",
            VERIFIKASI: "verification_signature",
            APPROVED1: "approval_1_signature",
            APPROVAL1: "approval_1_signature",
            APPROVED2: "approval_2_signature",
            APPROVAL2: "approval_2_signature",
            APPROVED3: "approval_3_signature",
            APPROVAL3: "approval_3_signature",
        };
        return mapping[code] || null;
    }

    async generateDocumentNumber(tglLembur, idPetugas) {
        return generateDocumentNumber("LMB", tglLembur, idPetugas);
    }
    getSnapshot(lembur) {
        if (!lembur) {
            return null;
        }

        const snapshot =
            typeof lembur.toJSON ===
            "function"
                ? lembur.toJSON()
                : {
                    ...lembur,
                };

        delete snapshot.logs;

        return snapshot;
    }

    async createLog(
        {
            id_lembur,
            id_status_sebelum =
                null,
            id_status_sesudah =
                null,
            aksi,
            keterangan = null,
            data_sebelum = null,
            data_sesudah = null,
            created_by = null,
        },
        transaction
    ) {
        return await logLemburService
            .create(
                {
                    id_lembur,
                    id_status_sebelum,
                    id_status_sesudah,
                    aksi,
                    keterangan,
                    data_sebelum,
                    data_sesudah,
                    created_by,
                },
                transaction
            );
    }

    normalizeText(value) {
        if (
            value === undefined ||
            value === null
        ) {
            return value;
        }

        return String(value)
            .trim()
            .replace(/\s+/g, " ");
    }

    normalizeNullableText(
        value
    ) {
        if (
            value === undefined
        ) {
            return undefined;
        }

        if (
            value === null
        ) {
            return null;
        }

        const result =
            String(value).trim();

        return result || null;
    }

    normalizeDate(value) {
        if (!value) {
            return value;
        }

        if (
            value instanceof Date
        ) {
            return value
                .toISOString()
                .slice(0, 10);
        }

        return String(value)
            .slice(0, 10);
    }

    normalizeTime(value) {
        if (!value) {
            return value;
        }

        const time =
            String(value).trim();

        if (
            /^\d{2}:\d{2}$/.test(
                time
            )
        ) {
            return `${time}:00`;
        }

        return time;
    }

    timeToMinutes(time) {
        const [
            hour,
            minute,
            second = 0,
        ] = String(time)
            .split(":")
            .map(Number);

        if (
            Number.isNaN(hour) ||
            Number.isNaN(minute) ||
            Number.isNaN(second)
        ) {
            throw new AppError(
                "Format jam lembur tidak valid",
                400
            );
        }

        return (
            hour * 60 +
            minute +
            second / 60
        );
    }

    validateTimeRange(
        jam_mulai,
        jam_selesai
    ) {
        const startMinutes =
            this.timeToMinutes(
                jam_mulai
            );

        const endMinutes =
            this.timeToMinutes(
                jam_selesai
            );

        if (
            startMinutes >=
            endMinutes
        ) {
            throw new AppError(
                "Jam mulai harus lebih kecil dari jam selesai",
                400
            );
        }
    }

    calculateTotalHours(
        jam_mulai,
        jam_selesai
    ) {
        const startMinutes =
            this.timeToMinutes(
                jam_mulai
            );

        const endMinutes =
            this.timeToMinutes(
                jam_selesai
            );

        const totalMinutes =
            endMinutes -
            startMinutes;

        return Number(
            (
                totalMinutes / 60
            ).toFixed(2)
        );
    }

    async checkLembur(
        id_lembur
    ) {
        const lembur =
            await lemburRepository
                .findById(
                    id_lembur
                );

        if (!lembur) {
            throw new AppError(
                "Data lembur tidak ditemukan",
                404
            );
        }

        return lembur;
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

        if (
            petugas.is_active !==
            "Y"
        ) {
            throw new AppError(
                "Petugas sedang tidak aktif",
                400
            );
        }

        return petugas;
    }

    async getInitialStatus() {
        const status =
            await statusRepository
                .findInitial();

        if (!status) {
            throw new AppError(
                "Status awal belum dikonfigurasi pada Master Status",
                500
            );
        }

        if (
            status.is_active !==
            "Y"
        ) {
            throw new AppError(
                "Status awal sedang tidak aktif",
                500
            );
        }

        return status;
    }

    getUserRoleId(user) {
        return (
            user?.id_role ??
            user?.role?.id_role ??
            null
        );
    }

    isSuperAdmin(user) {
        return (
            user?.is_super_admin ===
            "Y" ||
            user?.role
                ?.is_super_admin ===
            "Y" ||
            user?.kode_role ===
            "SUPER_ADMIN" ||
            user?.role?.kode_role ===
            "SUPER_ADMIN"
        );
    }

    validateAuthenticatedUser(
        user
    ) {
        if (!user) {
            throw new AppError(
                "User belum terautentikasi",
                401
            );
        }
    }

    validateStatusAuthority(
        status,
        user
    ) {
        this.validateAuthenticatedUser(
            user
        );

        if (
            this.isSuperAdmin(user)
        ) {
            return;
        }

        if (!status.id_role) {
            throw new AppError(
                "Status ini tidak memiliki role pemroses",
                403
            );
        }

        const idRoleUser =
            this.getUserRoleId(
                user
            );

        if (!idRoleUser) {
            throw new AppError(
                "Role user tidak ditemukan",
                403
            );
        }

        if (
            Number(
                status.id_role
            ) !==
            Number(idRoleUser)
        ) {
            throw new AppError(
                `Transaksi ini hanya dapat diproses oleh role ${status.role
                    ?.nama_role ||
                status.role
                    ?.kode_role ||
                status.id_role
                }`,
                403
            );
        }
    }

    validateEditableStatus(
        status,
        user
    ) {
        if (
            status.is_final ===
            "Y"
        ) {
            throw new AppError(
                "Lembur dengan status final tidak dapat diubah",
                400
            );
        }

        this.validateStatusAuthority(
            status,
            user
        );

        // The role owning the current non-final status may apply workflow corrections.
    }

    async ensureNoOverlap(
        id_petugas,
        tgl_lembur,
        jam_mulai,
        jam_selesai,
        excludeId = null
    ) {
        const existingLembur =
            await lemburRepository
                .findOverlapping(
                    id_petugas,
                    tgl_lembur,
                    jam_mulai,
                    jam_selesai,
                    excludeId
                );

        if (existingLembur) {
            throw new AppError(
                "Masih terdapat pengajuan lembur pada rentang jam tersebut",
                409
            );
        }
    }

    async checkDestinationStatus(
        id_status,
        fieldName
    ) {
        const status =
            await statusRepository
                .findRawById(
                    id_status
                );

        if (!status) {
            throw new AppError(
                `${fieldName} tidak ditemukan`,
                404
            );
        }

        if (
            status.is_active !==
            "Y"
        ) {
            throw new AppError(
                `${fieldName} sedang tidak aktif`,
                400
            );
        }

        return status;
    }

    async findAll(
        filters = {},
        user = null
    ) {
        filters = scopeTransactionFilters(filters, user);
        return await lemburRepository
            .findAll({
                id_petugas:
                    filters.id_petugas,

                id_petugas_cuti:
                    filters.id_petugas_cuti,

                id_status:
                    filters.id_status,

                id_role:
                    filters.id_role,

                tgl_lembur:
                    this.normalizeDate(
                        filters.tgl_lembur
                    ),

                kategori_lembur:
                    this.normalizeText(
                        filters.kategori_lembur
                    ),

                kode_status:
                    filters.kode_status
                        ? String(
                            filters.kode_status
                        )
                            .trim()
                            .toUpperCase()
                        : undefined,

                is_final:
                    filters.is_final
                        ? String(
                            filters.is_final
                        )
                            .trim()
                            .toUpperCase()
                        : undefined,

                tgl_awal:
                    this.normalizeDate(
                        filters.tgl_awal
                    ),

                tgl_akhir:
                    this.normalizeDate(
                        filters.tgl_akhir
                    ),
            });
    }

    async findById(
        id_lembur,
        user = null
    ) {
        return assertTransactionOwner(await this.checkLembur(
            id_lembur
        ), user);
    }

    async findPending(user) {
        const scope = await getWorkflowScope(user);
        return await lemburRepository
            .findPending(scope);
    }

    async findByPetugas(
        id_petugas,
        user = null
    ) {
        const scopedFilters = scopeTransactionFilters({ id_petugas }, user);
        id_petugas = scopedFilters.id_petugas;
        await this.checkPetugas(
            id_petugas
        );

        return await lemburRepository
            .findByPetugas(
                id_petugas
            );
    }

    async create(
        data,
        user = null
    ) {
        data = scopeTransactionFilters(data, user);
        const basis = await this.resolveBasis(data, user);
        const tglLembur = this.normalizeDate(basis.tgl_lembur);

        const jamMulai =
            this.normalizeTime(
                data.jam_mulai
            );

        const jamSelesai =
            this.normalizeTime(
                data.jam_selesai
            );

        this.validateTimeRange(
            jamMulai,
            jamSelesai
        );

        await this.checkPetugas(
            data.id_petugas
        );
        if (!/^\d{2}:00:00$/.test(jamMulai) || !/^\d{2}:00:00$/.test(jamSelesai)) throw new AppError("Jam lembur harus bulat tanpa menit", 422);
        const isEvidenceOptional = basis.evidenceOptional === true
            || ["CUTI", "IJIN", "SAKIT"].includes(basis.type)
            || basis.source?.kode_jenis_pekerjaan === "SIAGA_HARI_LIBUR";
        if (!isEvidenceOptional && (!data.surat_perintah_lembur || !data.foto_kegiatan_1 || !data.foto_kegiatan_2)) {
            throw new AppError("Surat perintah lembur dan dua foto kegiatan wajib untuk pekerjaan lembur reguler", 422);
        }

        const totalJam = this.calculateTotalHours(
            jamMulai,
            jamSelesai
        );
        const salary = await gajiService.calculateEmployeeSalary(
            data.id_petugas,
            tglLembur
        );
        const biayaLembur = this.calculateOvertimeCost(
            salary.tarif_lembur_per_jam,
            data.jumlah_jam_koreksi ?? totalJam
        );

        const isHariLibur = basis.is_hari_libur;

        await this.ensureNoOverlap(
            data.id_petugas,
            tglLembur,
            jamMulai,
            jamSelesai
        );

        const initialStatus =
            await this
                .getInitialStatus();

        if (
            user &&
            initialStatus.id_role
        ) {
            this.validateStatusAuthority(
                initialStatus,
                user
            );
        }

        const nomorDokumen = await this.generateDocumentNumber(tglLembur, data.id_petugas);
        const idLembur =
            await sequelize.transaction(
                async (
                    transaction
                ) => {
                    const lockedBasis = await this.resolveBasis(data, user, transaction);
                    const lembur =
                        await lemburRepository
                            .create(
                {
                    id_petugas:
                        data.id_petugas,

                    id_petugas_cuti: lockedBasis.id_petugas_cuti,
                    dasar_lembur_type: lockedBasis.type,
                    id_spkl_petugas: data.id_spkl_petugas ?? null, id_cuti: data.id_cuti ?? null, id_ijin: data.id_ijin ?? null, id_sakit: data.id_sakit ?? null,

                    id_status:
                        initialStatus
                            .id_status,

                    tgl_lembur:
                        tglLembur,

                    jam_mulai:
                        jamMulai,

                    jam_selesai:
                        jamSelesai,

                    total_jam:
                        totalJam,

                    biaya_lembur:
                        biayaLembur,

                    kategori_lembur:
                        this.normalizeText(
                            lockedBasis.kategori_lembur
                        ),

                    jenis_pekerjaan: this.normalizeNullableText(lockedBasis.jenis_pekerjaan),
                    area_group: this.normalizeNullableText(lockedBasis.area_group),
                    is_hari_libur: isHariLibur,

                    detail_pekerjaan_lembur:
                        this.normalizeNullableText(
                            lockedBasis.detail_pekerjaan_lembur
                        ),

                    foto_kegiatan_1:
                        data.foto_kegiatan_1,

                    foto_kegiatan_2:
                        data.foto_kegiatan_2,

                    surat_perintah_lembur:
                        data.surat_perintah_lembur,

                    maker_signature: data.maker_signature ?? null,
                    checker_signature: data.checker_signature ?? null,
                    verification_signature: data.verification_signature ?? null,
                    approval_1_signature: data.approval_1_signature ?? null,
                    approval_2_signature: data.approval_2_signature ?? null,
                    approval_3_signature: data.approval_3_signature ?? null,
                    jumlah_jam_koreksi: data.jumlah_jam_koreksi ?? null,
                    catatan_koreksi: this.normalizeNullableText(data.catatan_koreksi),
                    nomor_dokumen: nomorDokumen,

                    keterangan:
                        this.normalizeNullableText(
                            data.keterangan
                        ),
                },

                user?.id_user ??
                null,
                transaction
            );
                    if (lockedBasis.type === "SPKL") await lockedBasis.assignment.update({ status_penugasan: "DRAFTED" }, { transaction });

                    await this.createLog(
                        {
                            id_lembur:
                                lembur.id_lembur,
                            id_status_sesudah:
                                lembur.id_status,
                            aksi: "CREATE",
                            keterangan:
                                "Pengajuan lembur dibuat",
                            data_sesudah:
                                this.getSnapshot(
                                    lembur
                                ),
                            created_by:
                                user?.id_user ??
                                null,
                        },
                        transaction
                    );

                    return lembur
                        .id_lembur;
                }
            );

        return await lemburRepository
            .findById(idLembur);
    }

    async update(
        id_lembur,
        data,
        user = null
    ) {
        const currentLembur =
            await this.checkLembur(
                id_lembur
            );
        if (currentLembur.dasar_lembur_type) {
            const immutable = ["dasar_lembur_type", "id_spkl_petugas", "id_cuti", "id_ijin", "id_sakit", "id_petugas", "tgl_lembur", "kategori_lembur", "jenis_pekerjaan", "area_group"];
            const changed = immutable.find((field) => data[field] !== undefined && String(data[field] ?? "") !== String(currentLembur[field] ?? ""));
            if (changed) throw new AppError("Dasar dan data perintah lembur tidak dapat diubah setelah transaksi dibuat", 409);
        }
        assertTransactionOwner(currentLembur, user);
        data = scopeTransactionFilters(data, user);

        this.validateEditableStatus(
            currentLembur.status,
            user
        );
        await assertWorkflowAssignment(currentLembur, user);

        const idPetugas =
            data.id_petugas ??
            currentLembur.id_petugas;

        const idPetugasCuti =
            data.id_petugas_cuti !==
                undefined
                ? data.id_petugas_cuti
                : currentLembur
                    .id_petugas_cuti;

        const jenisPekerjaan = data.jenis_pekerjaan !== undefined
            ? this.normalizeNullableText(data.jenis_pekerjaan)
            : currentLembur.jenis_pekerjaan;

        const tglLembur =
            this.normalizeDate(
                data.tgl_lembur ??
                currentLembur
                    .tgl_lembur
            );

        const jamMulai =
            this.normalizeTime(
                data.jam_mulai ??
                currentLembur
                    .jam_mulai
            );

        const jamSelesai =
            this.normalizeTime(
                data.jam_selesai ??
                currentLembur
                    .jam_selesai
            );

        this.validateTimeRange(
            jamMulai,
            jamSelesai
        );

        if (
            data.id_petugas !==
            undefined
        ) {
            await this.checkPetugas(
                idPetugas
            );
        }

        if (
            data.id_petugas_cuti !==
                undefined &&
            idPetugasCuti !== null
        ) {
            await this.checkPetugas(
                idPetugasCuti
            );
        }

        if (this.isLeaveReplacement(jenisPekerjaan) && idPetugasCuti === null) {
            throw new AppError(
                "Petugas yang digantikan wajib dipilih untuk lembur pengganti piket",
                422
            );
        }

        if (idPetugasCuti !== null) {
            await this.validateReplacementCandidate(
                idPetugasCuti,
                tglLembur
            );
        }

        const isHariLibur = this.isHolidayOvertime(jenisPekerjaan)
            ? "Y"
            : (data.is_hari_libur !== undefined
                ? data.is_hari_libur
                : currentLembur.is_hari_libur);
        if (isHariLibur === "Y") {
            await this.validateHoliday(tglLembur);
        }

        await this.ensureNoOverlap(
            idPetugas,
            tglLembur,
            jamMulai,
            jamSelesai,
            id_lembur
        );

        const totalJam = this.calculateTotalHours(
            jamMulai,
            jamSelesai
        );
        const jumlahJamKoreksi = data.jumlah_jam_koreksi !== undefined
            ? data.jumlah_jam_koreksi
            : currentLembur.jumlah_jam_koreksi;
        let hourlyRate = data.jumlah_jam_koreksi !== undefined
            ? this.getStoredHourlyRate(currentLembur)
            : 0;
        if (hourlyRate <= 0) {
            const salary = await gajiService.calculateEmployeeSalary(
                idPetugas,
                tglLembur
            );
            hourlyRate = salary.tarif_lembur_per_jam;
        }
        const biayaLembur = this.calculateOvertimeCost(
            hourlyRate,
            jumlahJamKoreksi ?? totalJam
        );

        await sequelize.transaction(
            async (
                transaction
            ) => {
                const updatedLembur =
                    await lemburRepository
                        .update(
                            id_lembur,

                {
                    id_petugas:
                        idPetugas,

                    id_petugas_cuti:
                        idPetugasCuti,

                    tgl_lembur:
                        tglLembur,

                    jam_mulai:
                        jamMulai,

                    jam_selesai:
                        jamSelesai,

                    total_jam:
                        totalJam,

                    biaya_lembur:
                        biayaLembur,

                    kategori_lembur:
                        data.kategori_lembur !==
                            undefined
                            ? this.normalizeText(
                                data.kategori_lembur
                            )
                            : currentLembur
                                .kategori_lembur,

                    jenis_pekerjaan: jenisPekerjaan,
                    area_group: data.area_group !== undefined
                        ? this.normalizeNullableText(data.area_group)
                        : currentLembur.area_group,
                    is_hari_libur: isHariLibur,

                    detail_pekerjaan_lembur:
                        data.detail_pekerjaan_lembur !==
                            undefined
                            ? this.normalizeNullableText(
                                data.detail_pekerjaan_lembur
                            )
                            : currentLembur
                                .detail_pekerjaan_lembur,

                    foto_kegiatan_1:
                        data.foto_kegiatan_1 ??
                        currentLembur
                            .foto_kegiatan_1,

                    foto_kegiatan_2:
                        data.foto_kegiatan_2 ??
                        currentLembur
                            .foto_kegiatan_2,

                    surat_perintah_lembur:
                        data.surat_perintah_lembur ??
                        currentLembur
                            .surat_perintah_lembur,

                    maker_signature: data.maker_signature ?? currentLembur.maker_signature,
                    checker_signature: data.checker_signature ?? currentLembur.checker_signature,
                    verification_signature: data.verification_signature ?? currentLembur.verification_signature,
                    approval_1_signature: data.approval_1_signature ?? currentLembur.approval_1_signature,
                    approval_2_signature: data.approval_2_signature ?? currentLembur.approval_2_signature,
                    approval_3_signature: data.approval_3_signature ?? currentLembur.approval_3_signature,
                    jumlah_jam_koreksi: jumlahJamKoreksi,
                    catatan_koreksi: data.catatan_koreksi !== undefined ? this.normalizeNullableText(data.catatan_koreksi) : currentLembur.catatan_koreksi,
                    nomor_dokumen: currentLembur.nomor_dokumen,

                    keterangan:
                        data.keterangan !==
                            undefined
                            ? this.normalizeNullableText(
                                data.keterangan
                            )
                            : currentLembur
                                .keterangan,
                },

                user?.id_user ??
                null,
                transaction
            );

                await this.createLog(
                    {
                        id_lembur,
                        id_status_sebelum:
                            currentLembur
                                .id_status,
                        id_status_sesudah:
                            updatedLembur
                                .id_status,
                        aksi: "UPDATE",
                        keterangan:
                            "Data pengajuan lembur diperbarui",
                        data_sebelum:
                            this.getSnapshot(
                                currentLembur
                            ),
                        data_sesudah:
                            this.getSnapshot(
                                updatedLembur
                            ),
                        created_by:
                            user?.id_user ??
                            null,
                    },
                    transaction
                );
            }
        );

        return await lemburRepository
            .findById(id_lembur);
    }

    async moveToNextStatus(
        id_lembur,
        user,
        workflowData = {}
    ) {
        const lembur =
            await this.checkLembur(
                id_lembur
            );
        assertTransactionOwner(lembur, user);

        if (
            lembur.status.is_final ===
            "Y"
        ) {
            throw new AppError(
                "Lembur sudah berada pada status final",
                400
            );
        }

        this.validateStatusAuthority(
            lembur.status,
            user
        );

        await assertWorkflowAssignment(lembur, user);

        if (
            !lembur.status
                .id_status_next
        ) {
            throw new AppError(
                "Status berikutnya belum dikonfigurasi",
                400
            );
        }

        const { status: nextStatus, bypassed } = await resolveNextStatusWithBypass(
            lembur.status,
            lembur.petugas.id_unit,
            lembur.id_project
        );

        const signatureField = this.getSignatureField(user);
        const workflowUpdate = {};
        if (signatureField && workflowData[signatureField]) workflowUpdate[signatureField] = workflowData[signatureField];
        if (workflowData.jumlah_jam_koreksi !== undefined) {
            let hourlyRate = this.getStoredHourlyRate(lembur);
            if (hourlyRate <= 0) {
                const salary = await gajiService.calculateEmployeeSalary(
                    lembur.id_petugas,
                    lembur.tgl_lembur
                );
                hourlyRate = salary.tarif_lembur_per_jam;
            }
            workflowUpdate.jumlah_jam_koreksi = workflowData.jumlah_jam_koreksi;
            workflowUpdate.biaya_lembur = this.calculateOvertimeCost(
                hourlyRate,
                workflowData.jumlah_jam_koreksi
            );
        }
        if (workflowData.catatan_koreksi !== undefined) workflowUpdate.catatan_koreksi = this.normalizeNullableText(workflowData.catatan_koreksi);
        if (Object.keys(workflowUpdate).length) {
            await lemburRepository.update(id_lembur, workflowUpdate, user?.id_user ?? null);
        }

        await this.updateStatusWithLog(
            lembur,
            nextStatus,
            "NEXT",
            bypassed.length
                ? `Status lembur diproses dengan auto-skip: ${bypassed.map((item) => `${item.nama_status} (${item.reason})`).join(", ")}`
                : "Status lembur diproses ke tahap berikutnya",
            user
        );
        if (lembur.id_spkl_petugas && String(user?.kode_role || "").toUpperCase() === "MAKER") {
            await SpklPetugas.update({ status_penugasan: "SUBMITTED" }, { where: { id_spkl_petugas: lembur.id_spkl_petugas } });
        }

        return await lemburRepository
            .findById(id_lembur);
    }

    async moveToRevision(
        id_lembur,
        user,
        workflowData = {}
    ) {
        const lembur =
            await this.checkLembur(
                id_lembur
            );

        if (
            lembur.status.is_final ===
            "Y"
        ) {
            throw new AppError(
                "Lembur dengan status final tidak dapat direvisi",
                400
            );
        }

        this.validateStatusAuthority(
            lembur.status,
            user
        );
        await assertWorkflowAssignment(lembur, user);
        const revisionStatus = await resolveRevisionStatus(lembur.status, workflowData.target_role);

        await this.updateStatusWithLog(
            lembur,
            revisionStatus,
            "REVISION",
            workflowData.notes,
            user
        );

        return await lemburRepository
            .findById(id_lembur);
    }

    async moveToRejected(
        id_lembur,
        user,
        workflowData = {}
    ) {
        const lembur =
            await this.checkLembur(
                id_lembur
            );

        if (
            lembur.status.is_final ===
            "Y"
        ) {
            throw new AppError(
                "Lembur sudah berada pada status final",
                400
            );
        }

        this.validateStatusAuthority(
            lembur.status,
            user
        );
        await assertWorkflowAssignment(lembur, user);

        if (
            !lembur.status
                .id_status_rejected
        ) {
            throw new AppError(
                "Status penolakan belum dikonfigurasi",
                400
            );
        }

        const rejectedStatus =
            await this
                .checkDestinationStatus(
                    lembur.status
                        .id_status_rejected,
                    "Status penolakan"
                );

        await this.updateStatusWithLog(
            lembur,
            rejectedStatus,
            "REJECT",
            workflowData.notes,
            user
        );

        return await lemburRepository
            .findById(id_lembur);
    }

    async updateStatusWithLog(
        currentLembur,
        destinationStatus,
        aksi,
        keterangan,
        user
    ) {
        await sequelize.transaction(
            async (
                transaction
            ) => {
                const updatedLembur =
                    await lemburRepository
                        .updateStatus(
                            currentLembur
                                .id_lembur,
                            destinationStatus
                                .id_status,
                            user?.id_user ??
                            null,
                            transaction
                        );

                await this.createLog(
                    {
                        id_lembur:
                            currentLembur
                                .id_lembur,
                        id_status_sebelum:
                            currentLembur
                                .id_status,
                        id_status_sesudah:
                            destinationStatus
                                .id_status,
                        aksi,
                        keterangan,
                        data_sebelum:
                            this.getSnapshot(
                                currentLembur
                            ),
                        data_sesudah:
                            this.getSnapshot(
                                updatedLembur
                            ),
                        created_by:
                            user?.id_user ??
                            null,
                    },
                    transaction
                );
            }
        );
    }

    async delete(
        id_lembur,
        user
    ) {
        const lembur =
            await this.checkLembur(
                id_lembur
            );

        this.validateEditableStatus(
            lembur.status,
            user
        );

        await sequelize.transaction(
            async (
                transaction
            ) => {
                await this.createLog(
                    {
                        id_lembur,
                        id_status_sebelum:
                            lembur.id_status,
                        aksi: "DELETE",
                        keterangan:
                            "Pengajuan lembur dihapus",
                        data_sebelum:
                            this.getSnapshot(
                                lembur
                            ),
                        created_by:
                            user?.id_user ??
                            null,
                    },
                    transaction
                );

                await lemburRepository
                    .delete(
                        id_lembur,
                        transaction
                    );
                if (lembur.id_spkl_petugas) await SpklPetugas.update({ status_penugasan: "ASSIGNED" }, { where: { id_spkl_petugas: lembur.id_spkl_petugas }, transaction });
            }
        );

        return true;
    }
}

module.exports =
    new LemburService();

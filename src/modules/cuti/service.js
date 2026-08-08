const cutiRepository = require(
    "./repository"
);

const petugasRepository = require(
    "../petugas/repository"
);

const statusRepository = require(
    "../status/repository"
);

const logCutiService = require(
    "../logCuti/service"
);

const {
    sequelize,
} = require("../../models");

const AppError = require(
    "../../utils/AppError"
);
const getWorkflowScope = require("../../utils/workflowScope");
const { assertWorkflowAssignment, resolveRevisionStatus, resolveNextStatusWithBypass } = require("../../utils/workflowAction");

class CutiService {
    getSignatureField(user) {
        const code = String(user?.kode_role || user?.role?.kode_role || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        return {
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
        }[code] || null;
    }

    getSnapshot(cuti) {
        if (!cuti) {
            return null;
        }

        const snapshot =
            typeof cuti.toJSON ===
            "function"
                ? cuti.toJSON()
                : {
                    ...cuti,
                };

        delete snapshot.logs;

        return snapshot;
    }

    async createLog(
        {
            id_cuti,
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
        return await logCutiService
            .create(
                {
                    id_cuti,
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

    normalizeCode(value) {
        if (
            value === undefined ||
            value === null
        ) {
            return value;
        }

        const result =
            String(value)
                .trim()
                .toUpperCase();

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

    validateDateRange(
        tgl_mulai,
        tgl_selesai
    ) {
        const startDate =
            new Date(
                `${tgl_mulai}T00:00:00`
            );

        const endDate =
            new Date(
                `${tgl_selesai}T00:00:00`
            );

        if (
            Number.isNaN(
                startDate.getTime()
            ) ||
            Number.isNaN(
                endDate.getTime()
            )
        ) {
            throw new AppError(
                "Tanggal cuti tidak valid",
                400
            );
        }

        if (
            startDate > endDate
        ) {
            throw new AppError(
                "Tanggal mulai tidak boleh melebihi tanggal selesai",
                400
            );
        }
    }

    validateSubmissionDate(
        tgl_pengajuan,
        tgl_mulai
    ) {
        const submissionDate =
            new Date(
                `${tgl_pengajuan}T00:00:00`
            );

        const startDate =
            new Date(
                `${tgl_mulai}T00:00:00`
            );

        if (
            Number.isNaN(
                submissionDate.getTime()
            ) ||
            Number.isNaN(
                startDate.getTime()
            )
        ) {
            throw new AppError(
                "Tanggal pengajuan atau tanggal mulai tidak valid",
                400
            );
        }

        if (
            submissionDate >
            startDate
        ) {
            throw new AppError(
                "Tanggal pengajuan tidak boleh melebihi tanggal mulai cuti",
                400
            );
        }
    }

    calculateDuration(
        tgl_mulai,
        tgl_selesai
    ) {
        const startDate =
            new Date(
                `${tgl_mulai}T00:00:00`
            );

        const endDate =
            new Date(
                `${tgl_selesai}T00:00:00`
            );

        const difference =
            endDate.getTime() -
            startDate.getTime();

        return (
            Math.floor(
                difference /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            ) + 1
        );
    }

    async checkCuti(
        id_cuti
    ) {
        const cuti =
            await cutiRepository
                .findById(
                    id_cuti
                );

        if (!cuti) {
            throw new AppError(
                "Data cuti tidak ditemukan",
                404
            );
        }

        return cuti;
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
                "Cuti dengan status final tidak dapat diubah",
                400
            );
        }

        this.validateStatusAuthority(
            status,
            user
        );

        // The role owning the current non-final status may apply workflow corrections.
    }

    async ensureNumberAvailable(
        no_cuti,
        excludeId = null
    ) {
        const existingCuti =
            await cutiRepository
                .findByNumber(
                    no_cuti,
                    excludeId
                );

        if (existingCuti) {
            throw new AppError(
                `Nomor cuti "${no_cuti}" sudah digunakan`,
                409
            );
        }
    }

    async ensureNoOverlap(
        id_petugas,
        tgl_mulai,
        tgl_selesai,
        excludeId = null
    ) {
        const existingCuti =
            await cutiRepository
                .findOverlapping(
                    id_petugas,
                    tgl_mulai,
                    tgl_selesai,
                    excludeId
                );

        if (existingCuti) {
            throw new AppError(
                "Masih terdapat pengajuan cuti pada rentang tanggal tersebut",
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

    async generateCutiNumber(
        tgl_pengajuan
    ) {
        const year =
            new Date(
                `${tgl_pengajuan}T00:00:00`
            ).getFullYear();

        const lastCuti =
            await cutiRepository
                .findLastNumberByYear(
                    year
                );

        let nextNumber = 1;

        if (
            lastCuti?.no_cuti
        ) {
            const match =
                lastCuti.no_cuti.match(
                    /^CUTI\/(\d+)\/\d{4}$/
                );

            if (match) {
                nextNumber =
                    Number(
                        match[1]
                    ) + 1;
            }
        }

        return (
            `CUTI/` +
            `${String(
                nextNumber
            ).padStart(
                5,
                "0"
            )}/` +
            `${year}`
        );
    }

    async findAll(
        filters = {}
    ) {
        return await cutiRepository
            .findAll({
                id_petugas:
                    filters.id_petugas,

                id_status:
                    filters.id_status,

                id_role:
                    filters.id_role,

                no_cuti:
                    this.normalizeText(
                        filters.no_cuti
                    ),

                jenis_cuti:
                    this.normalizeText(
                        filters.jenis_cuti
                    ),

                perihal:
                    this.normalizeText(
                        filters.perihal
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

                tgl_pengajuan:
                    this.normalizeDate(
                        filters
                            .tgl_pengajuan
                    ),

                tgl_mulai:
                    this.normalizeDate(
                        filters.tgl_mulai
                    ),

                tgl_selesai:
                    this.normalizeDate(
                        filters
                            .tgl_selesai
                    ),

                tgl_awal_filter:
                    this.normalizeDate(
                        filters
                            .tgl_awal_filter
                    ),

                tgl_akhir_filter:
                    this.normalizeDate(
                        filters
                            .tgl_akhir_filter
                    ),
            });
    }

    async findById(
        id_cuti
    ) {
        return await this.checkCuti(
            id_cuti
        );
    }

    async findPending(user) {
        const scope = await getWorkflowScope(user);
        return await cutiRepository
            .findPending(scope);
    }

    async findByPetugas(
        id_petugas
    ) {
        await this.checkPetugas(
            id_petugas
        );

        return await cutiRepository
            .findByPetugas(
                id_petugas
            );
    }

    async create(
        data,
        user = null
    ) {
        const tglPengajuan =
            this.normalizeDate(
                data.tgl_pengajuan
            );

        const tglMulai =
            this.normalizeDate(
                data.tgl_mulai
            );

        const tglSelesai =
            this.normalizeDate(
                data.tgl_selesai
            );

        this.validateDateRange(
            tglMulai,
            tglSelesai
        );

        this.validateSubmissionDate(
            tglPengajuan,
            tglMulai
        );

        await this.checkPetugas(
            data.id_petugas
        );

        await this.ensureNoOverlap(
            data.id_petugas,
            tglMulai,
            tglSelesai
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

        let noCuti =
            this.normalizeText(
                data.no_cuti
            );

        if (!noCuti) {
            noCuti =
                await this
                    .generateCutiNumber(
                        tglPengajuan
                    );
        }

        await this
            .ensureNumberAvailable(
                noCuti
            );

        const idCuti =
            await sequelize
                .transaction(
                    async (
                        transaction
                    ) => {
                        const cuti =
                            await cutiRepository
                                .create(
                {
                    id_petugas:
                        data.id_petugas,

                    id_status:
                        initialStatus
                            .id_status,

                    no_cuti:
                        noCuti,

                    tgl_pengajuan:
                        tglPengajuan,

                    jenis_cuti:
                        this.normalizeText(
                            data.jenis_cuti
                        ),

                    perihal:
                        this.normalizeText(
                            data.perihal
                        ),

                    tgl_mulai:
                        tglMulai,

                    tgl_selesai:
                        tglSelesai,

                    lama_hari:
                        this.calculateDuration(
                            tglMulai,
                            tglSelesai
                        ),

                    contact_alamat:
                        this.normalizeNullableText(
                            data.contact_alamat
                        ),

                    nomor_telepon_darurat:
                        this.normalizeNullableText(
                            data.nomor_telepon_darurat
                        ),

                    pengganti:
                        this.normalizeNullableText(
                            data.pengganti
                        ),

                    maker_signature: data.maker_signature ?? null,
                    checker_signature: data.checker_signature ?? null,
                    verification_signature: data.verification_signature ?? null,
                    approval_1_signature: data.approval_1_signature ?? null,
                    approval_2_signature: data.approval_2_signature ?? null,
                    approval_3_signature: data.approval_3_signature ?? null,
                },

                user?.id_user ??
                null,
                transaction
            );

                        await this
                            .createLog(
                                {
                                    id_cuti:
                                        cuti.id_cuti,
                                    id_status_sesudah:
                                        cuti.id_status,
                                    aksi:
                                        "CREATE",
                                    keterangan:
                                        "Pengajuan cuti dibuat",
                                    data_sesudah:
                                        this.getSnapshot(
                                            cuti
                                        ),
                                    created_by:
                                        user?.id_user ??
                                        null,
                                },
                                transaction
                            );

                        return cuti
                            .id_cuti;
                    }
                );

        return await cutiRepository
            .findById(idCuti);
    }

    async update(
        id_cuti,
        data,
        user = null
    ) {
        const currentCuti =
            await this.checkCuti(
                id_cuti
            );

        this.validateEditableStatus(
            currentCuti.status,
            user
        );
        await assertWorkflowAssignment(currentCuti, user);

        const idPetugas =
            data.id_petugas ??
            currentCuti.id_petugas;

        const tglPengajuan =
            this.normalizeDate(
                data.tgl_pengajuan ??
                currentCuti
                    .tgl_pengajuan
            );

        const tglMulai =
            this.normalizeDate(
                data.tgl_mulai ??
                currentCuti
                    .tgl_mulai
            );

        const tglSelesai =
            this.normalizeDate(
                data.tgl_selesai ??
                currentCuti
                    .tgl_selesai
            );

        this.validateDateRange(
            tglMulai,
            tglSelesai
        );

        this.validateSubmissionDate(
            tglPengajuan,
            tglMulai
        );

        if (
            data.id_petugas !==
            undefined
        ) {
            await this.checkPetugas(
                idPetugas
            );
        }

        await this.ensureNoOverlap(
            idPetugas,
            tglMulai,
            tglSelesai,
            id_cuti
        );

        const noCuti =
            data.no_cuti !==
                undefined
                ? this.normalizeText(
                    data.no_cuti
                )
                : currentCuti.no_cuti;

        await this
            .ensureNumberAvailable(
                noCuti,
                id_cuti
            );

        await sequelize.transaction(
            async (
                transaction
            ) => {
                const updatedCuti =
                    await cutiRepository
                        .update(
                            id_cuti,

                {
                    id_petugas:
                        idPetugas,

                    no_cuti:
                        noCuti,

                    tgl_pengajuan:
                        tglPengajuan,

                    jenis_cuti:
                        data.jenis_cuti !==
                            undefined
                            ? this.normalizeText(
                                data.jenis_cuti
                            )
                            : currentCuti
                                .jenis_cuti,

                    perihal:
                        data.perihal !==
                            undefined
                            ? this.normalizeText(
                                data.perihal
                            )
                            : currentCuti
                                .perihal,

                    tgl_mulai:
                        tglMulai,

                    tgl_selesai:
                        tglSelesai,

                    lama_hari:
                        this.calculateDuration(
                            tglMulai,
                            tglSelesai
                        ),

                    contact_alamat:
                        data.contact_alamat !==
                            undefined
                            ? this.normalizeNullableText(
                                data.contact_alamat
                            )
                            : currentCuti
                                .contact_alamat,

                    nomor_telepon_darurat:
                        data.nomor_telepon_darurat !== undefined
                            ? this.normalizeNullableText(data.nomor_telepon_darurat)
                            : currentCuti.nomor_telepon_darurat,

                    pengganti:
                        data.pengganti !==
                            undefined
                            ? this.normalizeNullableText(
                                data.pengganti
                            )
                            : currentCuti
                                .pengganti,

                    maker_signature: data.maker_signature ?? currentCuti.maker_signature,
                    checker_signature: data.checker_signature ?? currentCuti.checker_signature,
                    verification_signature: data.verification_signature ?? currentCuti.verification_signature,
                    approval_1_signature: data.approval_1_signature ?? currentCuti.approval_1_signature,
                    approval_2_signature: data.approval_2_signature ?? currentCuti.approval_2_signature,
                    approval_3_signature: data.approval_3_signature ?? currentCuti.approval_3_signature,
                },

                user?.id_user ??
                null,
                transaction
            );

                await this.createLog(
                    {
                        id_cuti,
                        id_status_sebelum:
                            currentCuti
                                .id_status,
                        id_status_sesudah:
                            updatedCuti
                                .id_status,
                        aksi: "UPDATE",
                        keterangan:
                            "Data pengajuan cuti diperbarui",
                        data_sebelum:
                            this.getSnapshot(
                                currentCuti
                            ),
                        data_sesudah:
                            this.getSnapshot(
                                updatedCuti
                            ),
                        created_by:
                            user?.id_user ??
                            null,
                    },
                    transaction
                );
            }
        );

        return await cutiRepository
            .findById(id_cuti);
    }

    async moveToNextStatus(
        id_cuti,
        user,
        workflowData = {}
    ) {
        const cuti =
            await this.checkCuti(
                id_cuti
            );

        if (
            cuti.status.is_final ===
            "Y"
        ) {
            throw new AppError(
                "Cuti sudah berada pada status final",
                400
            );
        }

        this.validateStatusAuthority(
            cuti.status,
            user
        );

        await assertWorkflowAssignment(cuti, user);

        if (
            !cuti.status
                .id_status_next
        ) {
            throw new AppError(
                "Status berikutnya belum dikonfigurasi",
                400
            );
        }

        const { status: nextStatus, bypassed } = await resolveNextStatusWithBypass(
            cuti.status,
            cuti.petugas.id_unit
        );

        const signatureField = this.getSignatureField(user);
        if (signatureField && workflowData[signatureField]) {
            await cutiRepository.update(
                id_cuti,
                { [signatureField]: workflowData[signatureField] },
                user?.id_user ?? null
            );
        }

        await this.updateStatusWithLog(
            cuti,
            nextStatus,
            "NEXT",
            bypassed.length
                ? `Status cuti diproses dengan auto-skip: ${bypassed.map((item) => `${item.nama_status} (${item.reason})`).join(", ")}`
                : "Status cuti diproses ke tahap berikutnya",
            user
        );

        return await cutiRepository
            .findById(id_cuti);
    }

    async moveToRevision(
        id_cuti,
        user,
        workflowData = {}
    ) {
        const cuti =
            await this.checkCuti(
                id_cuti
            );

        if (
            cuti.status.is_final ===
            "Y"
        ) {
            throw new AppError(
                "Cuti dengan status final tidak dapat direvisi",
                400
            );
        }

        this.validateStatusAuthority(
            cuti.status,
            user
        );
        await assertWorkflowAssignment(cuti, user);
        const revisionStatus = await resolveRevisionStatus(cuti.status, workflowData.target_role);

        await this.updateStatusWithLog(
            cuti,
            revisionStatus,
            "REVISION",
            workflowData.notes,
            user
        );

        return await cutiRepository
            .findById(id_cuti);
    }

    async moveToRejected(
        id_cuti,
        user,
        workflowData = {}
    ) {
        const cuti =
            await this.checkCuti(
                id_cuti
            );

        if (
            cuti.status.is_final ===
            "Y"
        ) {
            throw new AppError(
                "Cuti sudah berada pada status final",
                400
            );
        }

        this.validateStatusAuthority(
            cuti.status,
            user
        );
        await assertWorkflowAssignment(cuti, user);

        if (
            !cuti.status
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
                    cuti.status
                        .id_status_rejected,
                    "Status penolakan"
                );

        await this.updateStatusWithLog(
            cuti,
            rejectedStatus,
            "REJECT",
            workflowData.notes,
            user
        );

        return await cutiRepository
            .findById(id_cuti);
    }

    async updateStatusWithLog(
        currentCuti,
        destinationStatus,
        aksi,
        keterangan,
        user
    ) {
        await sequelize.transaction(
            async (
                transaction
            ) => {
                const updatedCuti =
                    await cutiRepository
                        .updateStatus(
                            currentCuti
                                .id_cuti,
                            destinationStatus
                                .id_status,
                            user?.id_user ??
                            null,
                            transaction
                        );

                await this.createLog(
                    {
                        id_cuti:
                            currentCuti
                                .id_cuti,
                        id_status_sebelum:
                            currentCuti
                                .id_status,
                        id_status_sesudah:
                            destinationStatus
                                .id_status,
                        aksi,
                        keterangan,
                        data_sebelum:
                            this.getSnapshot(
                                currentCuti
                            ),
                        data_sesudah:
                            this.getSnapshot(
                                updatedCuti
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
        id_cuti,
        user
    ) {
        const cuti =
            await this.checkCuti(
                id_cuti
            );

        this.validateEditableStatus(
            cuti.status,
            user
        );

        await sequelize.transaction(
            async (
                transaction
            ) => {
                await this.createLog(
                    {
                        id_cuti,
                        id_status_sebelum:
                            cuti.id_status,
                        aksi: "DELETE",
                        keterangan:
                            "Pengajuan cuti dihapus",
                        data_sebelum:
                            this.getSnapshot(
                                cuti
                            ),
                        created_by:
                            user?.id_user ??
                            null,
                    },
                    transaction
                );

                await cutiRepository
                    .delete(
                        id_cuti,
                        transaction
                    );
            }
        );

        return true;
    }
}

module.exports =
    new CutiService();

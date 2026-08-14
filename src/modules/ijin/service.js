const ijinRepository = require(
    "./repository"
);

const petugasRepository = require(
    "../petugas/repository"
);

const statusRepository = require(
    "../status/repository"
);

const logIjinService = require(
    "../logIjin/service"
);

const {
    sequelize,
} = require("../../models");

const AppError = require(
    "../../utils/appError"
);
const getWorkflowScope = require("../../utils/workflowScope");
const { generateDocumentNumber } = require("../../utils/documentNumber");
const { assertWorkflowAssignment, resolveRevisionStatus, resolveNextStatusWithBypass } = require("../../utils/workflowAction");
const { scopeTransactionFilters, assertTransactionOwner } = require("../../utils/transactionAccess");

class IjinService {
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

    async generateDocumentNumber(tanggal, idPetugas) {
        return generateDocumentNumber("IJIN", tanggal, idPetugas);
    }

    getSnapshot(ijin) {
        if (!ijin) {
            return null;
        }

        const snapshot =
            typeof ijin.toJSON ===
            "function"
                ? ijin.toJSON()
                : {
                    ...ijin,
                };

        delete snapshot.logs;

        return snapshot;
    }

    async createLog(
        {
            id_ijin,
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
        return await logIjinService
            .create(
                {
                    id_ijin,
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

    validateDateRange(
        tanggal,
        tgl_selesai
    ) {
        const startDate =
            new Date(
                `${tanggal}T00:00:00`
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
                "Tanggal ijin tidak valid",
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

    async checkIjin(
        id_ijin
    ) {
        const ijin =
            await ijinRepository
                .findById(
                    id_ijin
                );

        if (!ijin) {
            throw new AppError(
                "Data ijin tidak ditemukan",
                404
            );
        }

        return ijin;
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
            this.getUserRoleId(user);

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
                "Ijin dengan status final tidak dapat diubah",
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
        tanggal,
        tgl_selesai,
        excludeId = null
    ) {
        const existingIjin =
            await ijinRepository
                .findOverlapping(
                    id_petugas,
                    tanggal,
                    tgl_selesai,
                    excludeId
                );

        if (existingIjin) {
            throw new AppError(
                "Masih terdapat pengajuan ijin pada rentang tanggal tersebut",
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
        return await ijinRepository
            .findAll({
                id_petugas:
                    filters.id_petugas,

                id_status:
                    filters.id_status,

                id_role:
                    filters.id_role,

                agenda:
                    this.normalizeText(
                        filters.agenda
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

                tanggal:
                    this.normalizeDate(
                        filters.tanggal
                    ),

                tgl_selesai:
                    this.normalizeDate(
                        filters
                            .tgl_selesai
                    ),

                tgl_mulai_filter:
                    this.normalizeDate(
                        filters
                            .tgl_mulai_filter
                    ),

                tgl_akhir_filter:
                    this.normalizeDate(
                        filters
                            .tgl_akhir_filter
                    ),
            });
    }

    async findById(
        id_ijin,
        user = null
    ) {
        return assertTransactionOwner(await this.checkIjin(
            id_ijin
        ), user);
    }

    async findPending(user) {
        const scope = await getWorkflowScope(user);
        return await ijinRepository
            .findPending(scope);
    }

    async findByPetugas(
        id_petugas
    ) {
        await this.checkPetugas(
            id_petugas
        );

        return await ijinRepository
            .findByPetugas(
                id_petugas
            );
    }

    async create(
        data,
        user = null
    ) {
        data = scopeTransactionFilters(data, user);
        const tanggal =
            this.normalizeDate(
                data.tanggal
            );

        const tglSelesai =
            this.normalizeDate(
                data.tgl_selesai
            );

        this.validateDateRange(
            tanggal,
            tglSelesai
        );

        await this.checkPetugas(
            data.id_petugas
        );

        await this.ensureNoOverlap(
            data.id_petugas,
            tanggal,
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

        const nomorDokumen = await this.generateDocumentNumber(tanggal, data.id_petugas);

        const idIjin =
            await sequelize.transaction(
                async (
                    transaction
                ) => {
                    const ijin =
                        await ijinRepository
                            .create(
                {
                    id_petugas:
                        data.id_petugas,

                    id_status:
                        initialStatus
                            .id_status,

                    nomor_dokumen:
                        nomorDokumen,

                    agenda:
                        this.normalizeText(
                            data.agenda
                        ),

                    tanggal,

                    tgl_selesai:
                        tglSelesai,

                    foto:
                        this.normalizeNullableText(
                            data.foto
                        ),

                    maker_signature: data.maker_signature ?? null,
                    checker_signature: data.checker_signature ?? null,
                    verification_signature: data.verification_signature ?? null,
                    approval_1_signature: data.approval_1_signature ?? null,
                    approval_2_signature: data.approval_2_signature ?? null,
                    approval_3_signature: data.approval_3_signature ?? null,

                    jumlah_hari_disetujui:
                        data.jumlah_hari_disetujui ?? null,

                    keterangan:
                        this.normalizeNullableText(
                            data.keterangan
                        ),
                },

                user?.id_user ??
                null,
                transaction
            );

                    await this.createLog(
                        {
                            id_ijin:
                                ijin.id_ijin,
                            id_status_sesudah:
                                ijin.id_status,
                            aksi: "CREATE",
                            keterangan:
                                "Pengajuan ijin dibuat",
                            data_sesudah:
                                this.getSnapshot(
                                    ijin
                                ),
                            created_by:
                                user?.id_user ??
                                null,
                        },
                        transaction
                    );

                    return ijin
                        .id_ijin;
                }
            );

        return await ijinRepository
            .findById(idIjin);
    }

    async update(
        id_ijin,
        data,
        user = null
    ) {
        const currentIjin =
            await this.checkIjin(
                id_ijin
            );
        assertTransactionOwner(currentIjin, user);
        data = scopeTransactionFilters(data, user);

        this.validateEditableStatus(
            currentIjin.status,
            user
        );
        await assertWorkflowAssignment(currentIjin, user);

        const idPetugas =
            data.id_petugas ??
            currentIjin.id_petugas;

        const tanggal =
            this.normalizeDate(
                data.tanggal ??
                currentIjin
                    .tanggal
            );

        const tglSelesai =
            this.normalizeDate(
                data.tgl_selesai ??
                currentIjin
                    .tgl_selesai
            );

        this.validateDateRange(
            tanggal,
            tglSelesai
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
            tanggal,
            tglSelesai,
            id_ijin
        );

        await sequelize.transaction(
            async (
                transaction
            ) => {
                const updatedIjin =
                    await ijinRepository
                        .update(
                            id_ijin,

                {
                    id_petugas:
                        idPetugas,

                    nomor_dokumen: currentIjin.nomor_dokumen,

                    agenda:
                        data.agenda !==
                            undefined
                            ? this.normalizeText(
                                data.agenda
                            )
                            : currentIjin
                                .agenda,

                    tanggal,

                    tgl_selesai:
                        tglSelesai,

                    foto:
                        data.foto !==
                            undefined
                            ? this.normalizeNullableText(
                                data.foto
                            )
                            : currentIjin
                                .foto,

                    maker_signature: data.maker_signature ?? currentIjin.maker_signature,
                    checker_signature: data.checker_signature ?? currentIjin.checker_signature,
                    verification_signature: data.verification_signature ?? currentIjin.verification_signature,
                    approval_1_signature: data.approval_1_signature ?? currentIjin.approval_1_signature,
                    approval_2_signature: data.approval_2_signature ?? currentIjin.approval_2_signature,
                    approval_3_signature: data.approval_3_signature ?? currentIjin.approval_3_signature,

                    jumlah_hari_disetujui:
                        data.jumlah_hari_disetujui ?? currentIjin.jumlah_hari_disetujui,

                    keterangan:
                        data.keterangan !==
                            undefined
                            ? this.normalizeNullableText(
                                data.keterangan
                            )
                            : currentIjin
                                .keterangan,
                },

                user?.id_user ??
                null,
                transaction
            );

                await this.createLog(
                    {
                        id_ijin,
                        id_status_sebelum:
                            currentIjin
                                .id_status,
                        id_status_sesudah:
                            updatedIjin
                                .id_status,
                        aksi: "UPDATE",
                        keterangan:
                            "Data pengajuan ijin diperbarui",
                        data_sebelum:
                            this.getSnapshot(
                                currentIjin
                            ),
                        data_sesudah:
                            this.getSnapshot(
                                updatedIjin
                            ),
                        created_by:
                            user?.id_user ??
                            null,
                    },
                    transaction
                );
            }
        );

        return await ijinRepository
            .findById(id_ijin);
    }

    async moveToNextStatus(
        id_ijin,
        user,
        workflowData = {}
    ) {
        const ijin =
            await this.checkIjin(
                id_ijin
            );
        assertTransactionOwner(ijin, user);

        if (
            ijin.status.is_final ===
            "Y"
        ) {
            throw new AppError(
                "Ijin sudah berada pada status final",
                400
            );
        }

        this.validateStatusAuthority(
            ijin.status,
            user
        );

        await assertWorkflowAssignment(ijin, user);

        if (
            !ijin.status
                .id_status_next
        ) {
            throw new AppError(
                "Status berikutnya belum dikonfigurasi",
                400
            );
        }

        const { status: nextStatus, bypassed } = await resolveNextStatusWithBypass(
            ijin.status,
            ijin.petugas.id_unit,
            ijin.id_project
        );

        const signatureField = this.getSignatureField(user);
        const workflowUpdate = {};
        if (signatureField && workflowData[signatureField]) workflowUpdate[signatureField] = workflowData[signatureField];
        if (workflowData.jumlah_hari_disetujui !== undefined) workflowUpdate.jumlah_hari_disetujui = workflowData.jumlah_hari_disetujui;
        if (Object.keys(workflowUpdate).length) {
            await ijinRepository.update(id_ijin, workflowUpdate, user?.id_user ?? null);
        }

        await this.updateStatusWithLog(
            ijin,
            nextStatus,
            "NEXT",
            bypassed.length
                ? `Status ijin diproses dengan auto-skip: ${bypassed.map((item) => `${item.nama_status} (${item.reason})`).join(", ")}`
                : "Status ijin diproses ke tahap berikutnya",
            user
        );

        return await ijinRepository
            .findById(id_ijin);
    }

    async moveToRevision(
        id_ijin,
        user,
        workflowData = {}
    ) {
        const ijin =
            await this.checkIjin(
                id_ijin
            );

        if (
            ijin.status.is_final ===
            "Y"
        ) {
            throw new AppError(
                "Ijin dengan status final tidak dapat direvisi",
                400
            );
        }

        this.validateStatusAuthority(
            ijin.status,
            user
        );
        await assertWorkflowAssignment(ijin, user);
        const revisionStatus = await resolveRevisionStatus(ijin.status, workflowData.target_role);

        await this.updateStatusWithLog(
            ijin,
            revisionStatus,
            "REVISION",
            workflowData.notes,
            user
        );

        return await ijinRepository
            .findById(id_ijin);
    }

    async moveToRejected(
        id_ijin,
        user,
        workflowData = {}
    ) {
        const ijin =
            await this.checkIjin(
                id_ijin
            );

        if (
            ijin.status.is_final ===
            "Y"
        ) {
            throw new AppError(
                "Ijin sudah berada pada status final",
                400
            );
        }

        this.validateStatusAuthority(
            ijin.status,
            user
        );
        await assertWorkflowAssignment(ijin, user);

        if (
            !ijin.status
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
                    ijin.status
                        .id_status_rejected,
                    "Status penolakan"
                );

        await this.updateStatusWithLog(
            ijin,
            rejectedStatus,
            "REJECT",
            workflowData.notes,
            user
        );

        return await ijinRepository
            .findById(id_ijin);
    }

    async updateStatusWithLog(
        currentIjin,
        destinationStatus,
        aksi,
        keterangan,
        user
    ) {
        await sequelize.transaction(
            async (
                transaction
            ) => {
                const updatedIjin =
                    await ijinRepository
                        .updateStatus(
                            currentIjin
                                .id_ijin,
                            destinationStatus
                                .id_status,
                            user?.id_user ??
                            null,
                            transaction
                        );

                await this.createLog(
                    {
                        id_ijin:
                            currentIjin
                                .id_ijin,
                        id_status_sebelum:
                            currentIjin
                                .id_status,
                        id_status_sesudah:
                            destinationStatus
                                .id_status,
                        aksi,
                        keterangan,
                        data_sebelum:
                            this.getSnapshot(
                                currentIjin
                            ),
                        data_sesudah:
                            this.getSnapshot(
                                updatedIjin
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
        id_ijin,
        user
    ) {
        const ijin =
            await this.checkIjin(
                id_ijin
            );

        this.validateEditableStatus(
            ijin.status,
            user
        );

        await sequelize.transaction(
            async (
                transaction
            ) => {
                await this.createLog(
                    {
                        id_ijin,
                        id_status_sebelum:
                            ijin.id_status,
                        aksi: "DELETE",
                        keterangan:
                            "Pengajuan ijin dihapus",
                        data_sebelum:
                            this.getSnapshot(
                                ijin
                            ),
                        created_by:
                            user?.id_user ??
                            null,
                    },
                    transaction
                );

                await ijinRepository
                    .delete(
                        id_ijin,
                        transaction
                    );
            }
        );

        return true;
    }
}

module.exports =
    new IjinService();

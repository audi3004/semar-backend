const sppdRepository = require(
    "./repository"
);

const petugasRepository = require(
    "../petugas/repository"
);

const statusRepository = require(
    "../status/repository"
);

const logSppdService = require(
    "../logSppd/service"
);

const {
    sequelize,
} = require("../../models");

const AppError = require(
    "../../utils/AppError"
);
const getWorkflowScope = require("../../utils/workflowScope");
const { assertWorkflowAssignment, resolveRevisionStatus, resolveNextStatusWithBypass } = require("../../utils/workflowAction");

class SppdService {
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

    getSnapshot(sppd) {
        if (!sppd) {
            return null;
        }

        const snapshot =
            typeof sppd.toJSON ===
            "function"
                ? sppd.toJSON()
                : {
                    ...sppd,
                };

        delete snapshot.logs;

        return snapshot;
    }

    async createLog(
        {
            id_sppd,
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
        return await logSppdService
            .create(
                {
                    id_sppd,
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

    normalizeDescription(value) {
        if (
            value === undefined ||
            value === null
        ) {
            return value;
        }

        const normalized =
            String(value).trim();

        return normalized || null;
    }

    normalizeMoney(value) {
        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return 0;
        }

        const result =
            Number(value);

        if (
            Number.isNaN(result)
        ) {
            throw new AppError(
                "Nilai biaya harus berupa angka",
                400
            );
        }

        if (result < 0) {
            throw new AppError(
                "Nilai biaya tidak boleh kurang dari 0",
                400
            );
        }

        return result;
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

    calculateDuration(
        tgl_berangkat,
        tgl_kembali
    ) {
        const start = new Date(
            `${tgl_berangkat}T00:00:00`
        );

        const end = new Date(
            `${tgl_kembali}T00:00:00`
        );

        const difference =
            end.getTime() -
            start.getTime();

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

    validateDateRange(
        tgl_berangkat,
        tgl_kembali
    ) {
        const start = new Date(
            `${tgl_berangkat}T00:00:00`
        );

        const end = new Date(
            `${tgl_kembali}T00:00:00`
        );

        if (
            Number.isNaN(
                start.getTime()
            ) ||
            Number.isNaN(
                end.getTime()
            )
        ) {
            throw new AppError(
                "Tanggal SPPD tidak valid",
                400
            );
        }

        if (start > end) {
            throw new AppError(
                "Tanggal berangkat tidak boleh melebihi tanggal kembali",
                400
            );
        }
    }

    async checkSppd(
        id_sppd
    ) {
        const sppd =
            await sppdRepository
                .findById(
                    id_sppd
                );

        if (!sppd) {
            throw new AppError(
                "Data SPPD tidak ditemukan",
                404
            );
        }

        return sppd;
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
            petugas.is_active !== "Y"
        ) {
            throw new AppError(
                "Petugas tidak aktif sehingga tidak dapat melakukan SPPD",
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
            status.is_active !== "Y"
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

    validateUserAuthenticated(
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
        this.validateUserAuthenticated(
            user
        );

        if (
            this.isSuperAdmin(
                user
            )
        ) {
            return;
        }

        if (!status.id_role) {
            throw new AppError(
                "Status ini tidak memiliki role pemroses",
                403
            );
        }

        const userRoleId =
            this.getUserRoleId(
                user
            );

        if (!userRoleId) {
            throw new AppError(
                "Role user tidak ditemukan",
                403
            );
        }

        if (
            Number(
                status.id_role
            ) !==
            Number(userRoleId)
        ) {
            throw new AppError(
                `Transaksi ini hanya dapat diproses oleh role ${status.role?.nama_role || status.role?.kode_role || status.id_role}`,
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
                "SPPD dengan status final tidak dapat diubah",
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
        no_sppd,
        excludeId = null
    ) {
        const duplicate =
            await sppdRepository
                .findByNumber(
                    no_sppd,
                    excludeId
                );

        if (duplicate) {
            throw new AppError(
                `Nomor SPPD "${no_sppd}" sudah digunakan`,
                409
            );
        }
    }

    async ensureScheduleAvailable(
        id_petugas,
        tgl_berangkat,
        tgl_kembali,
        excludeId = null
    ) {
        const overlapping =
            await sppdRepository
                .findOverlapping(
                    id_petugas,
                    tgl_berangkat,
                    tgl_kembali,
                    excludeId
                );

        if (overlapping) {
            throw new AppError(
                "Petugas masih memiliki SPPD aktif pada rentang tanggal tersebut",
                409
            );
        }
    }

    async generateSppdNumber() {
        const year =
            new Date().getFullYear();

        const lastSppd =
            await sppdRepository
                .findLastNumberByYear(
                    year
                );

        let nextNumber = 1;

        if (
            lastSppd?.no_sppd
        ) {
            const match =
                lastSppd.no_sppd.match(
                    /^SPPD\/(\d+)\/\d{4}$/
                );

            if (match) {
                nextNumber =
                    Number(
                        match[1]
                    ) + 1;
            }
        }

        return (
            `SPPD/` +
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
        return await sppdRepository
            .findAll({
                ...filters,

                no_sppd:
                    this.normalizeText(
                        filters.no_sppd
                    ),

                kota_tujuan:
                    this.normalizeText(
                        filters.kota_tujuan
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

                tgl_berangkat:
                    this.normalizeDate(
                        filters
                            .tgl_berangkat
                    ),

                tgl_kembali:
                    this.normalizeDate(
                        filters
                            .tgl_kembali
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
            });
    }

    async findById(
        id_sppd
    ) {
        return await this.checkSppd(
            id_sppd
        );
    }

    async findPending(user) {
        const scope = await getWorkflowScope(user);
        return await sppdRepository
            .findPending(scope);
    }

    async findByPetugas(
        id_petugas
    ) {
        await this.checkPetugas(
            id_petugas
        );

        return await sppdRepository
            .findByPetugas(
                id_petugas
            );
    }

    async create(
        data,
        user = null
    ) {
        const tglBerangkat =
            this.normalizeDate(
                data.tgl_berangkat
            );

        const tglKembali =
            this.normalizeDate(
                data.tgl_kembali
            );

        this.validateDateRange(
            tglBerangkat,
            tglKembali
        );

        await this.checkPetugas(
            data.id_petugas
        );

        await this
            .ensureScheduleAvailable(
                data.id_petugas,
                tglBerangkat,
                tglKembali
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

        let noSppd =
            this.normalizeText(
                data.no_sppd
            );

        if (!noSppd) {
            noSppd =
                await this
                    .generateSppdNumber();
        }

        await this
            .ensureNumberAvailable(
                noSppd
            );

        const idSppd =
            await sequelize.transaction(
                async (
                    transaction
                ) => {
                    const sppd =
                        await sppdRepository
                            .create(
                {
                    id_petugas:
                        data.id_petugas,

                    id_status:
                        initialStatus
                            .id_status,

                    no_sppd:
                        noSppd,

                    nomor_dokumen:
                        this.normalizeText(data.nomor_dokumen) || null,

                    kota_asal:
                        this.normalizeText(data.kota_asal),

                    kota_tujuan:
                        this.normalizeText(
                            data.kota_tujuan
                        ),

                    maksud_dinas:
                        this.normalizeText(
                            data.maksud_dinas
                        ),

                    tgl_berangkat:
                        tglBerangkat,

                    tgl_kembali:
                        tglKembali,

                    lama_dinas:
                        this.calculateDuration(
                            tglBerangkat,
                            tglKembali
                        ),

                    beban_anggaran:
                        this.normalizeText(data.beban_anggaran) || null,

                    maker_signature: data.maker_signature ?? null,
                    checker_signature: data.checker_signature ?? null,
                    verification_signature: data.verification_signature ?? null,
                    approval_1_signature: data.approval_1_signature ?? null,
                    approval_2_signature: data.approval_2_signature ?? null,
                    approval_3_signature: data.approval_3_signature ?? null,

                    rp_akomodasi:
                        this.normalizeMoney(
                            data.rp_akomodasi
                        ),

                    desc_akomodasi:
                        this.normalizeDescription(
                            data.desc_akomodasi
                        ),

                    rp_transportasi:
                        this.normalizeMoney(
                            data.rp_transportasi
                        ),

                    desc_transportasi:
                        this.normalizeDescription(
                            data.desc_transportasi
                        ),

                    rp_lain_lain:
                        this.normalizeMoney(
                            data.rp_lain_lain
                        ),

                    desc_lain_lain:
                        this.normalizeDescription(
                            data.desc_lain_lain
                        ),
                },

                user?.id_user ??
                null,
                transaction
            );

                    await this.createLog(
                        {
                            id_sppd:
                                sppd.id_sppd,
                            id_status_sesudah:
                                sppd.id_status,
                            aksi: "CREATE",
                            keterangan:
                                "Pengajuan SPPD dibuat",
                            data_sesudah:
                                this.getSnapshot(
                                    sppd
                                ),
                            created_by:
                                user?.id_user ??
                                null,
                        },
                        transaction
                    );

                    return sppd
                        .id_sppd;
                }
            );

        return await sppdRepository
            .findById(idSppd);
    }

    async update(
        id_sppd,
        data,
        user = null
    ) {
        const currentSppd =
            await this.checkSppd(
                id_sppd
            );

        this.validateEditableStatus(
            currentSppd.status,
            user
        );
        await assertWorkflowAssignment(currentSppd, user);

        const idPetugas =
            data.id_petugas ??
            currentSppd.id_petugas;

        const tglBerangkat =
            this.normalizeDate(
                data.tgl_berangkat ??
                currentSppd
                    .tgl_berangkat
            );

        const tglKembali =
            this.normalizeDate(
                data.tgl_kembali ??
                currentSppd
                    .tgl_kembali
            );

        this.validateDateRange(
            tglBerangkat,
            tglKembali
        );

        if (
            data.id_petugas !==
            undefined
        ) {
            await this.checkPetugas(
                idPetugas
            );
        }

        await this
            .ensureScheduleAvailable(
                idPetugas,
                tglBerangkat,
                tglKembali,
                id_sppd
            );

        const noSppd =
            this.normalizeText(
                data.no_sppd ??
                currentSppd
                    .no_sppd
            );

        await this
            .ensureNumberAvailable(
                noSppd,
                id_sppd
            );

        await sequelize.transaction(
            async (
                transaction
            ) => {
                const updatedSppd =
                    await sppdRepository
                        .update(
                            id_sppd,

                {
                    id_petugas:
                        idPetugas,

                    no_sppd:
                        noSppd,

                    nomor_dokumen:
                        data.nomor_dokumen !== undefined
                            ? this.normalizeText(data.nomor_dokumen) || null
                            : currentSppd.nomor_dokumen,

                    kota_asal:
                        this.normalizeText(
                            data.kota_asal ?? currentSppd.kota_asal
                        ),

                    kota_tujuan:
                        this.normalizeText(
                            data.kota_tujuan ??
                            currentSppd
                                .kota_tujuan
                        ),

                    maksud_dinas:
                        this.normalizeText(
                            data.maksud_dinas ??
                            currentSppd
                                .maksud_dinas
                        ),

                    tgl_berangkat:
                        tglBerangkat,

                    tgl_kembali:
                        tglKembali,

                    lama_dinas:
                        this.calculateDuration(
                            tglBerangkat,
                            tglKembali
                        ),

                    beban_anggaran:
                        data.beban_anggaran !== undefined
                            ? this.normalizeText(data.beban_anggaran) || null
                            : currentSppd.beban_anggaran,

                    maker_signature: data.maker_signature ?? currentSppd.maker_signature,
                    checker_signature: data.checker_signature ?? currentSppd.checker_signature,
                    verification_signature: data.verification_signature ?? currentSppd.verification_signature,
                    approval_1_signature: data.approval_1_signature ?? currentSppd.approval_1_signature,
                    approval_2_signature: data.approval_2_signature ?? currentSppd.approval_2_signature,
                    approval_3_signature: data.approval_3_signature ?? currentSppd.approval_3_signature,

                    rp_akomodasi:
                        data.rp_akomodasi !==
                            undefined
                            ? this.normalizeMoney(
                                data.rp_akomodasi
                            )
                            : Number(
                                currentSppd
                                    .rp_akomodasi
                            ),

                    desc_akomodasi:
                        data.desc_akomodasi !==
                            undefined
                            ? this.normalizeDescription(
                                data.desc_akomodasi
                            )
                            : currentSppd
                                .desc_akomodasi,

                    rp_transportasi:
                        data.rp_transportasi !==
                            undefined
                            ? this.normalizeMoney(
                                data.rp_transportasi
                            )
                            : Number(
                                currentSppd
                                    .rp_transportasi
                            ),

                    desc_transportasi:
                        data.desc_transportasi !==
                            undefined
                            ? this.normalizeDescription(
                                data.desc_transportasi
                            )
                            : currentSppd
                                .desc_transportasi,

                    rp_lain_lain:
                        data.rp_lain_lain !==
                            undefined
                            ? this.normalizeMoney(
                                data.rp_lain_lain
                            )
                            : Number(
                                currentSppd
                                    .rp_lain_lain
                            ),

                    desc_lain_lain:
                        data.desc_lain_lain !==
                            undefined
                            ? this.normalizeDescription(
                                data.desc_lain_lain
                            )
                            : currentSppd
                                .desc_lain_lain,
                },

                user?.id_user ??
                null,
                transaction
            );

                await this.createLog(
                    {
                        id_sppd,
                        id_status_sebelum:
                            currentSppd
                                .id_status,
                        id_status_sesudah:
                            updatedSppd
                                .id_status,
                        aksi: "UPDATE",
                        keterangan:
                            "Data pengajuan SPPD diperbarui",
                        data_sebelum:
                            this.getSnapshot(
                                currentSppd
                            ),
                        data_sesudah:
                            this.getSnapshot(
                                updatedSppd
                            ),
                        created_by:
                            user?.id_user ??
                            null,
                    },
                    transaction
                );
            }
        );

        return await sppdRepository
            .findById(id_sppd);
    }

    async moveToNextStatus(
        id_sppd,
        user,
        workflowData = {}
    ) {
        const sppd =
            await this.checkSppd(
                id_sppd
            );

        if (
            sppd.status.is_final ===
            "Y"
        ) {
            throw new AppError(
                "SPPD sudah berada pada status final",
                400
            );
        }

        this.validateStatusAuthority(
            sppd.status,
            user
        );

        await assertWorkflowAssignment(sppd, user);

        const signatureField = this.getSignatureField(user);
        if (signatureField && workflowData[signatureField]) {
            await sppdRepository.update(
                id_sppd,
                { [signatureField]: workflowData[signatureField] },
                user?.id_user ?? null
            );
        }

        if (
            !sppd.status
                .id_status_next
        ) {
            throw new AppError(
                "Status berikutnya belum dikonfigurasi",
                400
            );
        }

        const { status: nextStatus, bypassed } = await resolveNextStatusWithBypass(
            sppd.status,
            sppd.petugas.id_unit
        );

        await this.updateStatusWithLog(
            sppd,
            nextStatus,
            "NEXT",
            bypassed.length
                ? `Status SPPD diproses dengan auto-skip: ${bypassed.map((item) => `${item.nama_status} (${item.reason})`).join(", ")}`
                : "Status SPPD diproses ke tahap berikutnya",
            user
        );

        return await sppdRepository
            .findById(id_sppd);
    }

    async moveToRevision(
        id_sppd,
        user,
        workflowData = {}
    ) {
        const sppd =
            await this.checkSppd(
                id_sppd
            );

        if (
            sppd.status.is_final ===
            "Y"
        ) {
            throw new AppError(
                "SPPD dengan status final tidak dapat direvisi",
                400
            );
        }

        this.validateStatusAuthority(
            sppd.status,
            user
        );
        await assertWorkflowAssignment(sppd, user);
        const revisionStatus = await resolveRevisionStatus(sppd.status, workflowData.target_role);

        await this.updateStatusWithLog(
            sppd,
            revisionStatus,
            "REVISION",
            workflowData.notes,
            user
        );

        return await sppdRepository
            .findById(id_sppd);
    }

    async moveToRejected(
        id_sppd,
        user,
        workflowData = {}
    ) {
        const sppd =
            await this.checkSppd(
                id_sppd
            );

        if (
            sppd.status.is_final ===
            "Y"
        ) {
            throw new AppError(
                "SPPD sudah berada pada status final",
                400
            );
        }

        this.validateStatusAuthority(
            sppd.status,
            user
        );
        await assertWorkflowAssignment(sppd, user);

        if (
            !sppd.status
                .id_status_rejected
        ) {
            throw new AppError(
                "Status penolakan belum dikonfigurasi",
                400
            );
        }

        const rejectedStatus =
            await statusRepository
                .findRawById(
                    sppd.status
                        .id_status_rejected
                );

        if (!rejectedStatus) {
            throw new AppError(
                "Status penolakan tidak ditemukan",
                404
            );
        }

        if (
            rejectedStatus.is_active !==
            "Y"
        ) {
            throw new AppError(
                "Status penolakan sedang tidak aktif",
                400
            );
        }

        await this.updateStatusWithLog(
            sppd,
            rejectedStatus,
            "REJECT",
            workflowData.notes,
            user
        );

        return await sppdRepository
            .findById(id_sppd);
    }

    async updateStatusWithLog(
        currentSppd,
        destinationStatus,
        aksi,
        keterangan,
        user
    ) {
        await sequelize.transaction(
            async (
                transaction
            ) => {
                const updatedSppd =
                    await sppdRepository
                        .updateStatus(
                            currentSppd
                                .id_sppd,
                            destinationStatus
                                .id_status,
                            user?.id_user ??
                            null,
                            transaction
                        );

                await this.createLog(
                    {
                        id_sppd:
                            currentSppd
                                .id_sppd,
                        id_status_sebelum:
                            currentSppd
                                .id_status,
                        id_status_sesudah:
                            destinationStatus
                                .id_status,
                        aksi,
                        keterangan,
                        data_sebelum:
                            this.getSnapshot(
                                currentSppd
                            ),
                        data_sesudah:
                            this.getSnapshot(
                                updatedSppd
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
        id_sppd,
        user
    ) {
        const sppd =
            await this.checkSppd(
                id_sppd
            );

        this.validateEditableStatus(
            sppd.status,
            user
        );

        await sequelize.transaction(
            async (
                transaction
            ) => {
                await this.createLog(
                    {
                        id_sppd,
                        id_status_sebelum:
                            sppd.id_status,
                        aksi: "DELETE",
                        keterangan:
                            "Pengajuan SPPD dihapus",
                        data_sebelum:
                            this.getSnapshot(
                                sppd
                            ),
                        created_by:
                            user?.id_user ??
                            null,
                    },
                    transaction
                );

                await sppdRepository
                    .delete(
                        id_sppd,
                        transaction
                    );
            }
        );

        return true;
    }
}

module.exports =
    new SppdService();

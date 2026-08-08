const statusRepository = require(
    "./repository"
);

const roleRepository = require(
    "../role/repository"
);

const AppError = require(
    "../../utils/appError"
);

class StatusService {
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

    normalizeCode(value) {
        if (
            value === undefined ||
            value === null
        ) {
            return value;
        }

        return String(value)
            .trim()
            .toUpperCase()
            .replace(
                /[^A-Z0-9]+/g,
                "_"
            )
            .replace(
                /^_+|_+$/g,
                ""
            );
    }

    normalizeFlag(value) {
        if (
            value === undefined ||
            value === null
        ) {
            return value;
        }

        return String(value)
            .trim()
            .toUpperCase();
    }

    normalizeNullableId(value) {
        if (
            value === undefined
        ) {
            return undefined;
        }

        if (
            value === null ||
            value === ""
        ) {
            return null;
        }

        return Number(value);
    }

    async checkStatus(
        id_status
    ) {
        const status =
            await statusRepository
                .findById(
                    id_status
                );

        if (!status) {
            throw new AppError(
                "Data status tidak ditemukan",
                404
            );
        }

        return status;
    }

    async checkRawStatus(
        id_status,
        fieldName =
            "Status"
    ) {
        if (
            id_status === null ||
            id_status ===
            undefined
        ) {
            return null;
        }

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

        return status;
    }

    async checkRole(
        id_role
    ) {
        if (
            id_role === null ||
            id_role ===
            undefined
        ) {
            return null;
        }

        const role =
            await roleRepository
                .findById(
                    id_role
                );

        if (!role) {
            throw new AppError(
                "Data role tidak ditemukan",
                404
            );
        }

        if (
            role.is_active !==
            "Y"
        ) {
            throw new AppError(
                "Role yang dipilih sedang tidak aktif",
                400
            );
        }

        return role;
    }

    async ensureCodeAvailable(
        kode_status,
        excludeId = null
    ) {
        const duplicate =
            await statusRepository
                .findByCode(
                    kode_status,
                    excludeId
                );

        if (duplicate) {
            throw new AppError(
                `Kode status "${kode_status}" sudah digunakan`,
                409
            );
        }
    }

    async ensureNameAvailable(
        nama_status,
        excludeId = null
    ) {
        const duplicate =
            await statusRepository
                .findByName(
                    nama_status,
                    excludeId
                );

        if (duplicate) {
            throw new AppError(
                `Nama status "${nama_status}" sudah digunakan`,
                409
            );
        }
    }

    async ensureOrderAvailable(
        urutan_status,
        excludeId = null
    ) {
        const duplicate =
            await statusRepository
                .findByOrder(
                    urutan_status,
                    excludeId
                );

        if (duplicate) {
            throw new AppError(
                `Urutan status "${urutan_status}" sudah digunakan oleh status lain`,
                409
            );
        }
    }

    async ensureSingleInitial(
        is_initial,
        excludeId = null
    ) {
        if (
            is_initial !== "Y"
        ) {
            return;
        }

        const existingInitial =
            await statusRepository
                .findInitial(
                    excludeId
                );

        if (existingInitial) {
            throw new AppError(
                `Status awal sudah ditetapkan pada "${existingInitial.nama_status}"`,
                409
            );
        }
    }

    ensureNotSelfReference(
        id_status,
        references
    ) {
        if (!id_status) {
            return;
        }

        const {
            id_status_next,
            id_status_revision,
            id_status_rejected,
        } = references;

        if (
            Number(
                id_status_next
            ) ===
            Number(id_status)
        ) {
            throw new AppError(
                "Status berikutnya tidak boleh mengarah ke status yang sama",
                400
            );
        }

        if (
            Number(
                id_status_revision
            ) ===
            Number(id_status)
        ) {
            throw new AppError(
                "Status revisi tidak boleh mengarah ke status yang sama",
                400
            );
        }

        if (
            Number(
                id_status_rejected
            ) ===
            Number(id_status)
        ) {
            throw new AppError(
                "Status penolakan tidak boleh mengarah ke status yang sama",
                400
            );
        }
    }

    ensureReferencesAreDifferent(
        references
    ) {
        const values = [
            references.id_status_next,
            references
                .id_status_revision,
            references
                .id_status_rejected,
        ].filter(
            (value) =>
                value !== null &&
                value !== undefined
        );

        const uniqueValues =
            new Set(
                values.map(Number)
            );

        if (
            values.length !==
            uniqueValues.size
        ) {
            throw new AppError(
                "Status next, revision, dan rejected tidak boleh menunjuk ke status yang sama",
                400
            );
        }
    }

    validateFinalStatus({
        is_final,
        id_status_next,
        id_status_revision,
        id_status_rejected,
    }) {
        if (
            is_final !== "Y"
        ) {
            return;
        }

        if (
            id_status_next !==
            null &&
            id_status_next !==
            undefined
        ) {
            throw new AppError(
                "Status final tidak boleh memiliki status berikutnya",
                400
            );
        }

        if (
            id_status_revision !==
            null &&
            id_status_revision !==
            undefined
        ) {
            throw new AppError(
                "Status final tidak boleh memiliki status revisi",
                400
            );
        }

        if (
            id_status_rejected !==
            null &&
            id_status_rejected !==
            undefined
        ) {
            throw new AppError(
                "Status final tidak boleh memiliki status penolakan",
                400
            );
        }
    }

    validateInitialAndFinal(
        is_initial,
        is_final
    ) {
        if (
            is_initial === "Y" &&
            is_final === "Y"
        ) {
            throw new AppError(
                "Status tidak boleh menjadi status awal dan status final secara bersamaan",
                400
            );
        }
    }

    async validateReferencedStatuses(
        references
    ) {
        await Promise.all([
            this.checkRawStatus(
                references.id_status_next,
                "Status berikutnya"
            ),

            this.checkRawStatus(
                references
                    .id_status_revision,
                "Status revisi"
            ),

            this.checkRawStatus(
                references
                    .id_status_rejected,
                "Status penolakan"
            ),
        ]);
    }

    async findAll(
        filters = {}
    ) {
        return await statusRepository
            .findAll({
                id_role:
                    filters.id_role,

                kode_status:
                    this.normalizeCode(
                        filters
                            .kode_status
                    ),

                nama_status:
                    this.normalizeText(
                        filters
                            .nama_status
                    ),

                urutan_status:
                    filters
                        .urutan_status,

                is_initial:
                    this.normalizeFlag(
                        filters
                            .is_initial
                    ),

                is_final:
                    this.normalizeFlag(
                        filters.is_final
                    ),

                is_active:
                    this.normalizeFlag(
                        filters.is_active
                    ),
            });
    }

    async findById(
        id_status
    ) {
        return await this.checkStatus(
            id_status
        );
    }

    async findByRole(
        id_role
    ) {
        await this.checkRole(
            id_role
        );

        return await statusRepository
            .findByRole(
                id_role
            );
    }

    async create(
        data,
        created_by = null
    ) {
        const kodeStatus =
            this.normalizeCode(
                data.kode_status
            );

        const namaStatus =
            this.normalizeText(
                data.nama_status
            );

        const urutanStatus =
            Number(
                data.urutan_status
            );

        const idRole =
            this.normalizeNullableId(
                data.id_role
            );

        const idStatusNext =
            this.normalizeNullableId(
                data.id_status_next
            );

        const idStatusRevision =
            this.normalizeNullableId(
                data.id_status_revision
            );

        const idStatusRejected =
            this.normalizeNullableId(
                data.id_status_rejected
            );

        const isInitial =
            this.normalizeFlag(
                data.is_initial ??
                "N"
            );

        const isFinal =
            this.normalizeFlag(
                data.is_final ??
                "N"
            );

        const isActive =
            this.normalizeFlag(
                data.is_active ??
                "Y"
            );

        await this.checkRole(
            idRole
        );

        await this
            .ensureCodeAvailable(
                kodeStatus
            );

        await this
            .ensureNameAvailable(
                namaStatus
            );

        await this
            .ensureOrderAvailable(
                urutanStatus
            );

        await this
            .ensureSingleInitial(
                isInitial
            );

        this.validateInitialAndFinal(
            isInitial,
            isFinal
        );

        this.ensureReferencesAreDifferent({
            id_status_next:
                idStatusNext,

            id_status_revision:
                idStatusRevision,

            id_status_rejected:
                idStatusRejected,
        });

        this.validateFinalStatus({
            is_final:
                isFinal,

            id_status_next:
                idStatusNext,

            id_status_revision:
                idStatusRevision,

            id_status_rejected:
                idStatusRejected,
        });

        await this
            .validateReferencedStatuses({
                id_status_next:
                    idStatusNext,

                id_status_revision:
                    idStatusRevision,

                id_status_rejected:
                    idStatusRejected,
            });

        return await statusRepository
            .create(
                {
                    id_role:
                        idRole,

                    kode_status:
                        kodeStatus,

                    nama_status:
                        namaStatus,

                    urutan_status:
                        urutanStatus,

                    id_status_next:
                        idStatusNext,

                    id_status_revision:
                        idStatusRevision,

                    id_status_rejected:
                        idStatusRejected,

                    is_initial:
                        isInitial,

                    is_final:
                        isFinal,

                    is_active:
                        isActive,
                },
                created_by
            );
    }

    async update(
        id_status,
        data,
        updated_by = null
    ) {
        const currentStatus =
            await this.checkStatus(
                id_status
            );

        const kodeStatus =
            data.kode_status !==
                undefined
                ? this.normalizeCode(
                    data.kode_status
                )
                : currentStatus
                    .kode_status;

        const namaStatus =
            data.nama_status !==
                undefined
                ? this.normalizeText(
                    data.nama_status
                )
                : currentStatus
                    .nama_status;

        const urutanStatus =
            data.urutan_status !==
                undefined
                ? Number(
                    data
                        .urutan_status
                )
                : currentStatus
                    .urutan_status;

        const idRole =
            data.id_role !==
                undefined
                ? this
                    .normalizeNullableId(
                        data.id_role
                    )
                : currentStatus
                    .id_role;

        const idStatusNext =
            data.id_status_next !==
                undefined
                ? this
                    .normalizeNullableId(
                        data
                            .id_status_next
                    )
                : currentStatus
                    .id_status_next;

        const idStatusRevision =
            data
                .id_status_revision !==
                undefined
                ? this
                    .normalizeNullableId(
                        data
                            .id_status_revision
                    )
                : currentStatus
                    .id_status_revision;

        const idStatusRejected =
            data
                .id_status_rejected !==
                undefined
                ? this
                    .normalizeNullableId(
                        data
                            .id_status_rejected
                    )
                : currentStatus
                    .id_status_rejected;

        const isInitial =
            data.is_initial !==
                undefined
                ? this.normalizeFlag(
                    data.is_initial
                )
                : currentStatus
                    .is_initial;

        const isFinal =
            data.is_final !==
                undefined
                ? this.normalizeFlag(
                    data.is_final
                )
                : currentStatus
                    .is_final;

        const isActive =
            data.is_active !==
                undefined
                ? this.normalizeFlag(
                    data.is_active
                )
                : currentStatus
                    .is_active;

        await this.checkRole(
            idRole
        );

        await this
            .ensureCodeAvailable(
                kodeStatus,
                id_status
            );

        await this
            .ensureNameAvailable(
                namaStatus,
                id_status
            );

        await this
            .ensureOrderAvailable(
                urutanStatus,
                id_status
            );

        await this
            .ensureSingleInitial(
                isInitial,
                id_status
            );

        this.validateInitialAndFinal(
            isInitial,
            isFinal
        );

        this.ensureNotSelfReference(
            id_status,
            {
                id_status_next:
                    idStatusNext,

                id_status_revision:
                    idStatusRevision,

                id_status_rejected:
                    idStatusRejected,
            }
        );

        this.ensureReferencesAreDifferent({
            id_status_next:
                idStatusNext,

            id_status_revision:
                idStatusRevision,

            id_status_rejected:
                idStatusRejected,
        });

        this.validateFinalStatus({
            is_final:
                isFinal,

            id_status_next:
                idStatusNext,

            id_status_revision:
                idStatusRevision,

            id_status_rejected:
                idStatusRejected,
        });

        await this
            .validateReferencedStatuses({
                id_status_next:
                    idStatusNext,

                id_status_revision:
                    idStatusRevision,

                id_status_rejected:
                    idStatusRejected,
            });

        return await statusRepository
            .update(
                id_status,
                {
                    id_role:
                        idRole,

                    kode_status:
                        kodeStatus,

                    nama_status:
                        namaStatus,

                    urutan_status:
                        urutanStatus,

                    id_status_next:
                        idStatusNext,

                    id_status_revision:
                        idStatusRevision,

                    id_status_rejected:
                        idStatusRejected,

                    is_initial:
                        isInitial,

                    is_final:
                        isFinal,

                    is_active:
                        isActive,
                },
                updated_by
            );
    }

    async delete(
        id_status
    ) {
        const status =
            await this.checkStatus(
                id_status
            );

        if (
            status.is_initial ===
            "Y"
        ) {
            throw new AppError(
                "Status awal tidak dapat dihapus",
                400
            );
        }

        try {
            await statusRepository
                .delete(
                    id_status
                );

            return true;
        } catch (error) {
            if (
                error.name ===
                "SequelizeForeignKeyConstraintError" ||
                error.parent?.code ===
                "ER_ROW_IS_REFERENCED_2"
            ) {
                throw new AppError(
                    "Status tidak dapat dihapus karena masih digunakan oleh status atau transaksi lain",
                    409
                );
            }

            throw error;
        }
    }
}

module.exports =
    new StatusService();

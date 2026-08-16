const {
    Op,
} = require("sequelize");

const {
    Sakit,
    Petugas,
    Unit,
    Jabatan,
    Project,
    Umk,
    Status,
    Role,
    LogSakit,
    User,
    Pegawai,
} = require("../../models");
const resolveTransactionProject = require("../../utils/transactionProject");

class SakitRepository {
    getStatusInclude() {
        return {
            model: Status,
            as: "status",
            required: true,

            attributes: [
                "id_status",
                "id_role",
                "kode_status",
                "nama_status",
                "urutan_status",
                "id_status_next",
                "id_status_revision",
                "id_status_rejected",
                "is_initial",
                "is_final",
                "is_active",
            ],

            include: [
                {
                    model: Role,
                    as: "role",
                    required: false,

                    attributes: [
                        "id_role",
                        "kode_role",
                        "nama_role",
                        "level_role",
                        "is_super_admin",
                        "is_active",
                    ],
                },

                {
                    model: Status,
                    as: "nextStatus",
                    required: false,

                    attributes: [
                        "id_status",
                        "id_role",
                        "kode_status",
                        "nama_status",
                    ],

                    include: [
                        {
                            model: Role,
                            as: "role",
                            required: false,

                            attributes: [
                                "id_role",
                                "kode_role",
                                "nama_role",
                            ],
                        },
                    ],
                },

                {
                    model: Status,
                    as: "revisionStatus",
                    required: false,

                    attributes: [
                        "id_status",
                        "id_role",
                        "kode_status",
                        "nama_status",
                    ],

                    include: [
                        {
                            model: Role,
                            as: "role",
                            required: false,

                            attributes: [
                                "id_role",
                                "kode_role",
                                "nama_role",
                            ],
                        },
                    ],
                },

                {
                    model: Status,
                    as: "rejectedStatus",
                    required: false,

                    attributes: [
                        "id_status",
                        "id_role",
                        "kode_status",
                        "nama_status",
                    ],
                },
            ],
        };
    }

    getPetugasInclude() {
        return {
            model: Petugas,
            as: "petugas",
            required: true,

            include: [
                {
                    model: Unit,
                    as: "unit",
                    required: false,
                    include: [{
                        model: Unit,
                        as: "indukUnit",
                        required: false,
                        include: [{ model: Unit, as: "indukUnit", required: false }],
                    }],
                },

                {
                    model: Jabatan,
                    as: "jabatan",
                    required: false,
                },
                { model: Project, as: "project", required: false },

                {
                    model: Umk,
                    as: "umk",
                    required: false,
                },
            ],
        };
    }

    getInclude() {
        return [
            this.getPetugasInclude(),
            this.getStatusInclude(),
            {
                model: LogSakit,
                as: "logs",
                required: false,
                attributes: ["id_log_sakit", "id_status_sebelum", "id_status_sesudah", "aksi", "keterangan", "created_at", "created_by"],
                include: [{ model: User, as: "createdBy", required: false, attributes: ["id_user", "id_role", "id_pegawai", "id_petugas", "username"], include: [
                    { model: Role, as: "role", required: false, attributes: ["kode_role", "nama_role"] },
                    { model: Pegawai, as: "pegawai", required: false, attributes: ["nama", "nip"] },
                    { model: Petugas, as: "petugas", required: false, attributes: ["nama", "nip"] },
                ] }],
            },
        ];
    }

    async findAll(
        filters = {}
    ) {
        const where = {};

        if (filters.id_petugas) {
            where.id_petugas =
                filters.id_petugas;
        }

        if (filters.id_status) {
            where.id_status =
                filters.id_status;
        }

        if (filters.agenda) {
            where.agenda = {
                [Op.like]:
                    `%${filters.agenda}%`,
            };
        }

        if (filters.tanggal) {
            where.tanggal =
                filters.tanggal;
        }

        if (filters.tgl_selesai) {
            where.tgl_selesai =
                filters.tgl_selesai;
        }

        if (
            filters.tgl_mulai_filter &&
            filters.tgl_akhir_filter
        ) {
            where[Op.and] = [
                {
                    tanggal: {
                        [Op.lte]:
                            filters
                                .tgl_akhir_filter,
                    },
                },

                {
                    tgl_selesai: {
                        [Op.gte]:
                            filters
                                .tgl_mulai_filter,
                    },
                },
            ];
        }

        const statusInclude =
            this.getStatusInclude();

        if (filters.id_role) {
            statusInclude.where = {
                id_role:
                    filters.id_role,
            };
        }

        if (filters.kode_status) {
            statusInclude.where = {
                ...(statusInclude.where ||
                    {}),

                kode_status:
                    filters.kode_status,
            };
        }

        if (filters.is_final) {
            statusInclude.where = {
                ...(statusInclude.where ||
                    {}),

                is_final:
                    filters.is_final,
            };
        }

        return await Sakit.findAll({
            where,

            include: [
                this.getPetugasInclude(),
                statusInclude,
            ],

            order: [
                [
                    "tanggal",
                    "DESC",
                ],

                [
                    "id_sakit",
                    "DESC",
                ],
            ],
        });
    }

    async findById(
        id_sakit,
        transaction = null
    ) {
        return await Sakit.findByPk(
            id_sakit,
            {
                include:
                    this.getInclude(),
                transaction,
            }
        );
    }

    async findRawById(
        id_sakit
    ) {
        return await Sakit.findByPk(
            id_sakit
        );
    }

    async findPending(scope = null) {
        if (scope && scope.unitIds.length === 0) {
            return [];
        }

        const statusInclude =
            this.getStatusInclude();
        const petugasInclude =
            this.getPetugasInclude();
        const logInclude = this.getInclude().find((include) => include.as === "logs");

        statusInclude.where = {
            is_final: "N",
            is_active: "Y",
            ...(scope
                ? { id_role: scope.idRole }
                : {}),
        };

        if (scope) {
            petugasInclude.where = {
                id_unit: {
                    [Op.in]: scope.unitIds,
                },
            };
        }

        return await Sakit.findAll({
            where: scope ? { id_project: { [Op.in]: scope.projectIds || [] } } : undefined,
            include: [
                petugasInclude,
                statusInclude,
                logInclude,
            ],

            order: [
                [
                    "tanggal",
                    "ASC",
                ],

                [
                    "id_sakit",
                    "ASC",
                ],
            ],
        });
    }

    async findByPetugas(
        id_petugas
    ) {
        return await Sakit.findAll({
            where: {
                id_petugas,
            },

            include:
                this.getInclude(),

            order: [
                [
                    "tanggal",
                    "DESC",
                ],

                [
                    "id_sakit",
                    "DESC",
                ],
            ],
        });
    }

    async findOverlapping(
        id_petugas,
        tanggal,
        tgl_selesai,
        excludeId = null
    ) {
        const statusInclude =
            this.getStatusInclude();

        statusInclude.where = {
            kode_status: {
                [Op.notIn]: [
                    "REJECTED",
                    "CANCELLED",
                ],
            },
        };

        const where = {
            id_petugas,

            tanggal: {
                [Op.lte]:
                    tgl_selesai,
            },

            tgl_selesai: {
                [Op.gte]:
                    tanggal,
            },
        };

        if (excludeId) {
            where.id_sakit = {
                [Op.ne]:
                    excludeId,
            };
        }

        return await Sakit.findOne({
            where,

            include: [
                statusInclude,
            ],
        });
    }

    async create(
        data,
        created_by = null,
        transaction = null
    ) {
        data.id_project = await resolveTransactionProject(data, transaction);
        const result =
            await Sakit.create(
                {
                    ...data,
                    created_by,
                },
                {
                    transaction,
                }
            );

        return await this.findById(
            result.id_sakit,
            transaction
        );
    }

    async update(
        id_sakit,
        data,
        updated_by = null,
        transaction = null
    ) {
        await Sakit.update(
            {
                ...data,
                updated_by,
            },
            {
                where: {
                    id_sakit,
                },
                transaction,
            }
        );

        return await this.findById(
            id_sakit,
            transaction
        );
    }

    async updateStatus(
        id_sakit,
        id_status,
        updated_by = null,
        transaction = null
    ) {
        await Sakit.update(
            {
                id_status,
                updated_by,
            },
            {
                where: {
                    id_sakit,
                },
                transaction,
            }
        );

        return await this.findById(
            id_sakit,
            transaction
        );
    }

    async delete(
        id_sakit,
        transaction = null
    ) {
        return await Sakit.destroy({
            where: {
                id_sakit,
            },
            transaction,
        });
    }
}

module.exports =
    new SakitRepository();

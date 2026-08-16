const {
    Op,
} = require("sequelize");

const {
    Cuti,
    Petugas,
    Unit,
    Jabatan,
    Project,
    Umk,
    Status,
    Role,
    LogCuti,
    User,
    Pegawai,
} = require("../../models");
const resolveTransactionProject = require("../../utils/transactionProject");

class CutiRepository {
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
                model: LogCuti,
                as: "logs",
                required: false,
                attributes: ["id_log_cuti", "id_status_sebelum", "id_status_sesudah", "aksi", "keterangan", "created_at", "created_by"],
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

        if (filters.no_cuti) {
            where.no_cuti = {
                [Op.like]:
                    `%${filters.no_cuti}%`,
            };
        }

        if (filters.jenis_cuti) {
            where.jenis_cuti = {
                [Op.like]:
                    `%${filters.jenis_cuti}%`,
            };
        }

        if (filters.perihal) {
            where.perihal = {
                [Op.like]:
                    `%${filters.perihal}%`,
            };
        }

        if (filters.tgl_pengajuan) {
            where.tgl_pengajuan =
                filters.tgl_pengajuan;
        }

        if (filters.tgl_mulai) {
            where.tgl_mulai =
                filters.tgl_mulai;
        }

        if (filters.tgl_selesai) {
            where.tgl_selesai =
                filters.tgl_selesai;
        }

        /*
        |--------------------------------------------------------------------------
        | FILTER RENTANG TANGGAL
        |--------------------------------------------------------------------------
        |
        | Mengambil pengajuan yang beririsan dengan rentang filter.
        |
        */

        if (
            filters.tgl_awal_filter &&
            filters.tgl_akhir_filter
        ) {
            where[Op.and] = [
                {
                    tgl_mulai: {
                        [Op.lte]:
                            filters
                                .tgl_akhir_filter,
                    },
                },

                {
                    tgl_selesai: {
                        [Op.gte]:
                            filters
                                .tgl_awal_filter,
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

        return await Cuti.findAll({
            where,

            include: [
                this.getPetugasInclude(),
                statusInclude,
            ],

            order: [
                [
                    "tgl_pengajuan",
                    "DESC",
                ],

                [
                    "tgl_mulai",
                    "DESC",
                ],

                [
                    "id_cuti",
                    "DESC",
                ],
            ],
        });
    }

    async findById(
        id_cuti,
        transaction = null
    ) {
        return await Cuti.findByPk(
            id_cuti,
            {
                include:
                    this.getInclude(),
                transaction,
            }
        );
    }

    async findRawById(
        id_cuti
    ) {
        return await Cuti.findByPk(
            id_cuti
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

        return await Cuti.findAll({
            where: scope ? { id_project: { [Op.in]: scope.projectIds || [] } } : undefined,
            include: [
                petugasInclude,
                statusInclude,
                logInclude,
            ],

            order: [
                [
                    "tgl_pengajuan",
                    "ASC",
                ],

                [
                    "id_cuti",
                    "ASC",
                ],
            ],
        });
    }

    async findByPetugas(
        id_petugas
    ) {
        return await Cuti.findAll({
            where: {
                id_petugas,
            },

            include:
                this.getInclude(),

            order: [
                [
                    "tgl_pengajuan",
                    "DESC",
                ],

                [
                    "tgl_mulai",
                    "DESC",
                ],

                [
                    "id_cuti",
                    "DESC",
                ],
            ],
        });
    }

    async findByNumber(
        no_cuti,
        excludeId = null
    ) {
        const where = {
            no_cuti,
        };

        if (excludeId) {
            where.id_cuti = {
                [Op.ne]:
                    excludeId,
            };
        }

        return await Cuti.findOne({
            where,
        });
    }

    async findLastNumberByYear(
        year
    ) {
        return await Cuti.findOne({
            where: {
                no_cuti: {
                    [Op.like]:
                        `%/${year}`,
                },
            },

            order: [
                [
                    "id_cuti",
                    "DESC",
                ],
            ],
        });
    }

    async findOverlapping(
        id_petugas,
        tgl_mulai,
        tgl_selesai,
        excludeId = null
    ) {
        const statusInclude =
            this.getStatusInclude();

        /*
        |--------------------------------------------------------------------------
        | STATUS YANG DIABAIKAN
        |--------------------------------------------------------------------------
        |
        | Pengajuan rejected dan cancelled tidak dianggap bentrok.
        |
        */

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

            tgl_mulai: {
                [Op.lte]:
                    tgl_selesai,
            },

            tgl_selesai: {
                [Op.gte]:
                    tgl_mulai,
            },
        };

        if (excludeId) {
            where.id_cuti = {
                [Op.ne]:
                    excludeId,
            };
        }

        return await Cuti.findOne({
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
            await Cuti.create(
                {
                    ...data,
                    created_by,
                },
                {
                    transaction,
                }
            );

        return await this.findById(
            result.id_cuti,
            transaction
        );
    }

    async update(
        id_cuti,
        data,
        updated_by = null,
        transaction = null
    ) {
        await Cuti.update(
            {
                ...data,
                updated_by,
            },
            {
                where: {
                    id_cuti,
                },
                transaction,
            }
        );

        return await this.findById(
            id_cuti,
            transaction
        );
    }

    async updateStatus(
        id_cuti,
        id_status,
        updated_by = null,
        transaction = null
    ) {
        await Cuti.update(
            {
                id_status,
                updated_by,
            },
            {
                where: {
                    id_cuti,
                },
                transaction,
            }
        );

        return await this.findById(
            id_cuti,
            transaction
        );
    }

    async delete(
        id_cuti,
        transaction = null
    ) {
        return await Cuti.destroy({
            where: {
                id_cuti,
            },
            transaction,
        });
    }
}

module.exports =
    new CutiRepository();

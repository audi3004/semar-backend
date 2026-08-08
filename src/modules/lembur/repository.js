const {
    Op,
} = require("sequelize");

const {
    Lembur,
    Petugas,
    Unit,
    Jabatan,
    Project,
    Umk,
    Status,
    Role,
    LogLembur,
    User,
    Pegawai,
} = require("../../models");

class LemburRepository {
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
                },

                {
                    model: Jabatan,
                    as: "jabatan",
                    required: false,

                    include: [
                        {
                            model: Project,
                            as: "project",
                            required: false,
                        },
                    ],
                },

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
            {
                model: Petugas,
                as: "petugasCuti",
                required: false,
            },
            this.getStatusInclude(),
            {
                model: LogLembur,
                as: "logs",
                required: false,
                attributes: ["id_log_lembur", "id_status_sebelum", "id_status_sesudah", "aksi", "keterangan", "created_at", "created_by"],
                include: [{ model: User, as: "createdBy", required: false, attributes: ["id_user", "id_role", "id_pegawai", "id_petugas", "username"], include: [
                    { model: Role, as: "role", required: false, attributes: ["kode_role", "nama_role"] },
                    { model: Pegawai, as: "pegawai", required: false, attributes: ["nama"] },
                    { model: Petugas, as: "petugas", required: false, attributes: ["nama"] },
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

        if (filters.id_petugas_cuti) {
            where.id_petugas_cuti =
                filters.id_petugas_cuti;
        }

        if (filters.id_status) {
            where.id_status =
                filters.id_status;
        }

        if (filters.tgl_lembur) {
            where.tgl_lembur =
                filters.tgl_lembur;
        }

        if (filters.kategori_lembur) {
            where.kategori_lembur = {
                [Op.like]:
                    `%${filters.kategori_lembur}%`,
            };
        }

        if (
            filters.tgl_awal &&
            filters.tgl_akhir
        ) {
            where.tgl_lembur = {
                [Op.between]: [
                    filters.tgl_awal,
                    filters.tgl_akhir,
                ],
            };
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

        return await Lembur.findAll({
            where,

            include: [
                this.getPetugasInclude(),
                statusInclude,
            ],

            order: [
                [
                    "tgl_lembur",
                    "DESC",
                ],

                [
                    "jam_mulai",
                    "DESC",
                ],

                [
                    "id_lembur",
                    "DESC",
                ],
            ],
        });
    }

    async findById(
        id_lembur,
        transaction = null
    ) {
        return await Lembur.findByPk(
            id_lembur,
            {
                include:
                    this.getInclude(),
                transaction,
            }
        );
    }

    async findRawById(
        id_lembur
    ) {
        return await Lembur.findByPk(
            id_lembur
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

        return await Lembur.findAll({
            include: [
                petugasInclude,
                statusInclude,
            ],

            order: [
                [
                    "tgl_lembur",
                    "ASC",
                ],

                [
                    "jam_mulai",
                    "ASC",
                ],
            ],
        });
    }

    async findByPetugas(
        id_petugas
    ) {
        return await Lembur.findAll({
            where: {
                id_petugas,
            },

            include:
                this.getInclude(),

            order: [
                [
                    "tgl_lembur",
                    "DESC",
                ],

                [
                    "jam_mulai",
                    "DESC",
                ],

                [
                    "id_lembur",
                    "DESC",
                ],
            ],
        });
    }

    async findOverlapping(
        id_petugas,
        tgl_lembur,
        jam_mulai,
        jam_selesai,
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
            tgl_lembur,

            jam_mulai: {
                [Op.lt]:
                    jam_selesai,
            },

            jam_selesai: {
                [Op.gt]:
                    jam_mulai,
            },
        };

        if (excludeId) {
            where.id_lembur = {
                [Op.ne]:
                    excludeId,
            };
        }

        return await Lembur.findOne({
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
        const result =
            await Lembur.create(
                {
                    ...data,
                    created_by,
                },
                {
                    transaction,
                }
            );

        return await this.findById(
            result.id_lembur,
            transaction
        );
    }

    async update(
        id_lembur,
        data,
        updated_by = null,
        transaction = null
    ) {
        await Lembur.update(
            {
                ...data,
                updated_by,
            },
            {
                where: {
                    id_lembur,
                },
                transaction,
            }
        );

        return await this.findById(
            id_lembur,
            transaction
        );
    }

    async updateStatus(
        id_lembur,
        id_status,
        updated_by = null,
        transaction = null
    ) {
        await Lembur.update(
            {
                id_status,
                updated_by,
            },
            {
                where: {
                    id_lembur,
                },
                transaction,
            }
        );

        return await this.findById(
            id_lembur,
            transaction
        );
    }

    async delete(
        id_lembur,
        transaction = null
    ) {
        return await Lembur.destroy({
            where: {
                id_lembur,
            },
            transaction,
        });
    }
}

module.exports =
    new LemburRepository();

const {
    Op,
} = require("sequelize");

const {
    Sppd,
    Petugas,
    Unit,
    Jabatan,
    Project,
    Umk,
    Status,
    Role,
    LogSppd,
    User,
    Pegawai,
} = require("../../models");

class SppdRepository {
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
            this.getStatusInclude(),
            {
                model: LogSppd,
                as: "logs",
                required: false,
                attributes: ["id_log_sppd", "id_status_sebelum", "id_status_sesudah", "aksi", "keterangan", "created_at", "created_by"],
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

        if (filters.id_status) {
            where.id_status =
                filters.id_status;
        }

        if (filters.no_sppd) {
            where.no_sppd = {
                [Op.like]:
                    `%${filters.no_sppd}%`,
            };
        }

        if (filters.kota_tujuan) {
            where.kota_tujuan = {
                [Op.like]:
                    `%${filters.kota_tujuan}%`,
            };
        }

        if (filters.tgl_berangkat) {
            where.tgl_berangkat =
                filters.tgl_berangkat;
        }

        if (filters.tgl_kembali) {
            where.tgl_kembali =
                filters.tgl_kembali;
        }

        if (
            filters.tgl_mulai &&
            filters.tgl_selesai
        ) {
            where.tgl_berangkat = {
                [Op.between]: [
                    filters.tgl_mulai,
                    filters.tgl_selesai,
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

        return await Sppd.findAll({
            where,

            include: [
                this.getPetugasInclude(),
                statusInclude,
            ],

            order: [
                [
                    "tgl_berangkat",
                    "DESC",
                ],

                [
                    "id_sppd",
                    "DESC",
                ],
            ],
        });
    }

    async findById(
        id_sppd,
        transaction = null
    ) {
        return await Sppd.findByPk(
            id_sppd,
            {
                include:
                    this.getInclude(),
                transaction,
            }
        );
    }

    async findRawById(
        id_sppd
    ) {
        return await Sppd.findByPk(
            id_sppd
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

        return await Sppd.findAll({
            include: [
                petugasInclude,
                statusInclude,
            ],

            order: [
                [
                    "tgl_berangkat",
                    "ASC",
                ],

                [
                    "id_sppd",
                    "ASC",
                ],
            ],
        });
    }

    async findByPetugas(
        id_petugas
    ) {
        return await Sppd.findAll({
            where: {
                id_petugas,
            },

            include:
                this.getInclude(),

            order: [
                [
                    "tgl_berangkat",
                    "DESC",
                ],

                [
                    "id_sppd",
                    "DESC",
                ],
            ],
        });
    }

    async findByNumber(
        no_sppd,
        excludeId = null
    ) {
        const where = {
            no_sppd,
        };

        if (excludeId) {
            where.id_sppd = {
                [Op.ne]: excludeId,
            };
        }

        return await Sppd.findOne({
            where,
        });
    }

    async findLastNumberByYear(
        year
    ) {
        return await Sppd.findOne({
            where: {
                no_sppd: {
                    [Op.like]:
                        `%/${year}`,
                },
            },

            order: [
                [
                    "id_sppd",
                    "DESC",
                ],
            ],
        });
    }

    async findOverlapping(
        id_petugas,
        tgl_berangkat,
        tgl_kembali,
        excludeId = null
    ) {
        const statusInclude =
            this.getStatusInclude();

        statusInclude.where = {
            is_final: "N",
        };

        const where = {
            id_petugas,

            [Op.and]: [
                {
                    tgl_berangkat: {
                        [Op.lte]:
                            tgl_kembali,
                    },
                },

                {
                    tgl_kembali: {
                        [Op.gte]:
                            tgl_berangkat,
                    },
                },
            ],
        };

        if (excludeId) {
            where.id_sppd = {
                [Op.ne]:
                    excludeId,
            };
        }

        return await Sppd.findOne({
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
            await Sppd.create(
                {
                    ...data,
                    created_by,
                },
                {
                    transaction,
                }
            );

        return await this.findById(
            result.id_sppd,
            transaction
        );
    }

    async update(
        id_sppd,
        data,
        updated_by = null,
        transaction = null
    ) {
        await Sppd.update(
            {
                ...data,
                updated_by,
            },
            {
                where: {
                    id_sppd,
                },
                transaction,
            }
        );

        return await this.findById(
            id_sppd,
            transaction
        );
    }

    async updateStatus(
        id_sppd,
        id_status,
        updated_by = null,
        transaction = null
    ) {
        await Sppd.update(
            {
                id_status,
                updated_by,
            },
            {
                where: {
                    id_sppd,
                },
                transaction,
            }
        );

        return await this.findById(
            id_sppd,
            transaction
        );
    }

    async delete(
        id_sppd,
        transaction = null
    ) {
        return await Sppd.destroy({
            where: {
                id_sppd,
            },
            transaction,
        });
    }
}

module.exports =
    new SppdRepository();

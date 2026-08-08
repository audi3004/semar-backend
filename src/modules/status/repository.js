const {
    Op,
} = require("sequelize");

const {
    Status,
    Role,
} = require("../../models");

class StatusRepository {
    getInclude() {
        return [
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
                    "urutan_status",
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
                    "urutan_status",
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
                    "urutan_status",
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
                        ],
                    },
                ],
            },
        ];
    }

    async findAll(
        filters = {}
    ) {
        const where = {};

        if (filters.id_role) {
            where.id_role =
                filters.id_role;
        }

        if (filters.kode_status) {
            where.kode_status = {
                [Op.like]:
                    `%${filters.kode_status}%`,
            };
        }

        if (filters.nama_status) {
            where.nama_status = {
                [Op.like]:
                    `%${filters.nama_status}%`,
            };
        }

        if (
            filters.urutan_status !==
            undefined &&
            filters.urutan_status !==
            null &&
            filters.urutan_status !==
            ""
        ) {
            where.urutan_status =
                filters.urutan_status;
        }

        if (filters.is_initial) {
            where.is_initial =
                filters.is_initial;
        }

        if (filters.is_final) {
            where.is_final =
                filters.is_final;
        }

        if (filters.is_active) {
            where.is_active =
                filters.is_active;
        }

        return await Status.findAll({
            where,

            include:
                this.getInclude(),

            order: [
                [
                    "urutan_status",
                    "ASC",
                ],

                [
                    "nama_status",
                    "ASC",
                ],
            ],
        });
    }

    async findById(
        id_status
    ) {
        return await Status.findByPk(
            id_status,
            {
                include:
                    this.getInclude(),
            }
        );
    }

    async findRawById(
        id_status
    ) {
        return await Status.findByPk(
            id_status
        );
    }

    async findByCode(
        kode_status,
        excludeId = null
    ) {
        const where = {
            kode_status,
        };

        if (excludeId) {
            where.id_status = {
                [Op.ne]:
                    excludeId,
            };
        }

        return await Status.findOne({
            where,
        });
    }

    async findByName(
        nama_status,
        excludeId = null
    ) {
        const where = {
            nama_status,
        };

        if (excludeId) {
            where.id_status = {
                [Op.ne]:
                    excludeId,
            };
        }

        return await Status.findOne({
            where,
        });
    }

    async findByOrder(
        urutan_status,
        excludeId = null
    ) {
        const where = {
            urutan_status,
        };

        if (excludeId) {
            where.id_status = {
                [Op.ne]:
                    excludeId,
            };
        }

        return await Status.findOne({
            where,
        });
    }

    async findInitial(
        excludeId = null
    ) {
        const where = {
            is_initial: "Y",
        };

        if (excludeId) {
            where.id_status = {
                [Op.ne]:
                    excludeId,
            };
        }

        return await Status.findOne({
            where,
        });
    }

    async findByRole(
        id_role
    ) {
        return await Status.findAll({
            where: {
                id_role,
                is_active: "Y",
            },

            include:
                this.getInclude(),

            order: [
                [
                    "urutan_status",
                    "ASC",
                ],
            ],
        });
    }

    async create(
        data,
        created_by = null
    ) {
        const result =
            await Status.create({
                ...data,
                created_by,
            });

        return await this.findById(
            result.id_status
        );
    }

    async update(
        id_status,
        data,
        updated_by = null
    ) {
        await Status.update(
            {
                ...data,
                updated_by,
            },
            {
                where: {
                    id_status,
                },
            }
        );

        return await this.findById(
            id_status
        );
    }

    async delete(
        id_status
    ) {
        return await Status.destroy({
            where: {
                id_status,
            },
        });
    }
}

module.exports =
    new StatusRepository();
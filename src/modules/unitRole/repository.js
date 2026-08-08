const {
    Op,
} = require("sequelize");

const {
    UnitRole,
    User,
    Unit,
    Role,
} = require("../../models");

class UnitRoleRepository {
    getInclude() {
        return [
            {
                model: User,
                as: "user",
                required: true,

                attributes: {
                    exclude: [
                        "password",
                        "refresh_token_hash",
                        "refresh_token_expires_at",
                    ],
                },
            },

            {
                model: Unit,
                as: "unit",
                required: true,
            },

            {
                model: Role,
                as: "role",
                required: true,

                attributes: [
                    "id_role",
                    "kode_role",
                    "nama_role",
                    "level_role",
                    "is_super_admin",
                    "is_active",
                ],
            },
        ];
    }

    async findAll(
        filters = {}
    ) {
        const where = {};

        if (filters.id_user) {
            where.id_user =
                filters.id_user;
        }

        if (filters.id_unit) {
            where.id_unit =
                filters.id_unit;
        }

        if (filters.id_role) {
            where.id_role =
                filters.id_role;
        }

        if (filters.is_active) {
            where.is_active =
                filters.is_active;
        }

        const userInclude = {
            model: User,
            as: "user",
            required: true,

            attributes: {
                exclude: [
                    "password",
                    "refresh_token_hash",
                    "refresh_token_expires_at",
                ],
            },
        };

        const unitInclude = {
            model: Unit,
            as: "unit",
            required: true,
        };

        const roleInclude = {
            model: Role,
            as: "role",
            required: true,

            attributes: [
                "id_role",
                "kode_role",
                "nama_role",
                "level_role",
                "is_super_admin",
                "is_active",
            ],
        };

        if (filters.nama_user) {
            userInclude.where = {
                username: {
                    [Op.like]:
                        `%${filters.nama_user}%`,
                },
            };
        }

        if (filters.username) {
            userInclude.where = {
                ...(userInclude.where ||
                    {}),

                username: {
                    [Op.like]:
                        `%${filters.username}%`,
                },
            };
        }

        if (filters.nama_unit) {
            unitInclude.where = {
                nama_unit: {
                    [Op.like]:
                        `%${filters.nama_unit}%`,
                },
            };
        }


        if (filters.kode_role) {
            roleInclude.where = {
                kode_role:
                    filters.kode_role,
            };
        }

        return await UnitRole.findAll({
            where,

            include: [
                userInclude,
                unitInclude,
                roleInclude,
            ],

            order: [
                [
                    {
                        model: Unit,
                        as: "unit",
                    },
                    "nama_unit",
                    "ASC",
                ],

                [
                    {
                        model: Role,
                        as: "role",
                    },
                    "level_role",
                    "ASC",
                ],

                [
                    "id_unit_role",
                    "ASC",
                ],
            ],
        });
    }

    async findById(
        id_unit_role
    ) {
        return await UnitRole.findByPk(
            id_unit_role,
            {
                include:
                    this.getInclude(),
            }
        );
    }

    async findRawById(
        id_unit_role
    ) {
        return await UnitRole.findByPk(
            id_unit_role
        );
    }

    async findDuplicate(
        id_user,
        id_unit,
        id_role,
        excludeId = null
    ) {
        const where = {
            id_user,
            id_unit,
            id_role,
        };

        if (excludeId) {
            where.id_unit_role = {
                [Op.ne]:
                    excludeId,
            };
        }

        return await UnitRole.findOne({
            where,
        });
    }

    async findByUser(
        id_user,
        is_active = null
    ) {
        const where = {
            id_user,
        };

        if (is_active) {
            where.is_active =
                is_active;
        }

        return await UnitRole.findAll({
            where,

            include:
                this.getInclude(),

            order: [
                [
                    {
                        model: Unit,
                        as: "unit",
                    },
                    "nama_unit",
                    "ASC",
                ],

                [
                    {
                        model: Role,
                        as: "role",
                    },
                    "level_role",
                    "ASC",
                ],
            ],
        });
    }

    async findByUnit(
        id_unit,
        is_active = null
    ) {
        const where = {
            id_unit,
        };

        if (is_active) {
            where.is_active =
                is_active;
        }

        return await UnitRole.findAll({
            where,

            include:
                this.getInclude(),

            order: [
                [
                    {
                        model: Role,
                        as: "role",
                    },
                    "level_role",
                    "ASC",
                ],

                [
                    {
                        model: User,
                        as: "user",
                    },
                    "username",
                    "ASC",
                ],
            ],
        });
    }

    async findApprovers(
        id_unit,
        id_role
    ) {
        return await UnitRole.findAll({
            where: {
                id_unit,
                id_role,
                is_active: "Y",
            },

            include: [
                {
                    model: User,
                    as: "user",
                    required: true,

                    attributes: {
                        exclude: [
                            "password",
                            "refresh_token_hash",
                            "refresh_token_expires_at",
                        ],
                    },
                },

                {
                    model: Role,
                    as: "role",
                    required: true,
                },
            ],

            order: [
                [
                    {
                        model: User,
                        as: "user",
                    },
                    "username",
                    "ASC",
                ],
            ],
        });
    }

    async hasAuthority(
        id_user,
        id_unit,
        id_role
    ) {
        return await UnitRole.findOne({
            where: {
                id_user,
                id_unit,
                id_role,
                is_active: "Y",
            },
        });
    }

    async create(
        data,
        created_by = null
    ) {
        const result =
            await UnitRole.create({
                ...data,
                created_by,
            });

        return await this.findById(
            result.id_unit_role
        );
    }

    async bulkCreate(
        data,
        created_by = null
    ) {
        const rows = data.map(
            (item) => ({
                ...item,
                created_by,
            })
        );

        return await UnitRole.bulkCreate(
            rows
        );
    }

    async update(
        id_unit_role,
        data,
        updated_by = null
    ) {
        await UnitRole.update(
            {
                ...data,
                updated_by,
            },
            {
                where: {
                    id_unit_role,
                },
            }
        );

        return await this.findById(
            id_unit_role
        );
    }

    async updateStatus(
        id_unit_role,
        is_active,
        updated_by = null
    ) {
        await UnitRole.update(
            {
                is_active,
                updated_by,
            },
            {
                where: {
                    id_unit_role,
                },
            }
        );

        return await this.findById(
            id_unit_role
        );
    }

    async delete(
        id_unit_role
    ) {
        return await UnitRole.destroy({
            where: {
                id_unit_role,
            },
        });
    }
}

module.exports =
    new UnitRoleRepository();

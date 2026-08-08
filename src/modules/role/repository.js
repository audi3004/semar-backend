const {
    Op,
} = require(
    "sequelize"
);

const {
    Role,
} = require(
    "../../models"
);

class RoleRepository {
    async findAll(
        filters = {}
    ) {
        const where = {};

        if (
            filters.kode_role
        ) {
            where.kode_role = {
                [Op.like]:
                    `%${filters.kode_role}%`,
            };
        }

        if (
            filters.nama_role
        ) {
            where.nama_role = {
                [Op.like]:
                    `%${filters.nama_role}%`,
            };
        }

        if (
            filters.level_role !==
            undefined &&
            filters.level_role !==
            null &&
            filters.level_role !==
            ""
        ) {
            where.level_role =
                filters.level_role;
        }

        if (
            filters.is_super_admin
        ) {
            where.is_super_admin =
                filters
                    .is_super_admin;
        }

        if (
            filters.is_active
        ) {
            where.is_active =
                filters.is_active;
        }

        return await Role.findAll({
            where,

            order: [
                [
                    "level_role",
                    "ASC",
                ],

                [
                    "nama_role",
                    "ASC",
                ],
            ],
        });
    }

    async findById(
        id_role
    ) {
        return await Role.findByPk(
            id_role
        );
    }

    async findByCode(
        kode_role,
        excludeId = null
    ) {
        const where = {
            kode_role,
        };

        if (excludeId) {
            where.id_role = {
                [Op.ne]:
                    excludeId,
            };
        }

        return await Role.findOne({
            where,
        });
    }

    async findByName(
        nama_role,
        excludeId = null
    ) {
        const where = {
            nama_role,
        };

        if (excludeId) {
            where.id_role = {
                [Op.ne]:
                    excludeId,
            };
        }

        return await Role.findOne({
            where,
        });
    }

    async findByLevel(
        level_role,
        excludeId = null
    ) {
        const where = {
            level_role,
        };

        if (excludeId) {
            where.id_role = {
                [Op.ne]:
                    excludeId,
            };
        }

        return await Role.findOne({
            where,
        });
    }

    async findSuperAdmin(
        excludeId = null
    ) {
        const where = {
            is_super_admin:
                "Y",
        };

        if (excludeId) {
            where.id_role = {
                [Op.ne]:
                    excludeId,
            };
        }

        return await Role.findOne({
            where,
        });
    }

    async create(
        data,
        created_by = null
    ) {
        return await Role.create({
            ...data,
            created_by,
        });
    }

    async update(
        id_role,
        data,
        updated_by = null
    ) {
        await Role.update(
            {
                ...data,
                updated_by,
            },
            {
                where: {
                    id_role,
                },
            }
        );

        return await this.findById(
            id_role
        );
    }

    async delete(
        id_role
    ) {
        return await Role.destroy({
            where: {
                id_role,
            },
        });
    }
}

module.exports =
    new RoleRepository();
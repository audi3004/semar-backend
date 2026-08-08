const {
    AccessModule,
    Role,
    Module,
} = require("../../models");

const accessInclude = [
    {
        model: Role,
        as: "role",
        attributes: [
            "id_role",
            "nama_role",
        ],
    },
    {
        model: Module,
        as: "module",
        attributes: [
            "id_module",
            "kode_module",
            "nama_module",
            "deskripsi",
        ],
    },
];

class AccessModuleRepository {
    async findAll() {
        return await AccessModule.findAll({
            include: accessInclude,
            order: [
                ["id_role", "ASC"],
                ["id_module", "ASC"],
            ],
        });
    }

    async findById(id_access) {
        return await AccessModule.findByPk(
            id_access,
            {
                include: accessInclude,
            }
        );
    }

    async findByRole(id_role) {
        return await AccessModule.findAll({
            where: {
                id_role,
            },
            include: accessInclude,
            order: [
                [
                    {
                        model: Module,
                        as: "module",
                    },
                    "nama_module",
                    "ASC",
                ],
            ],
        });
    }

    async findByModule(id_module) {
        return await AccessModule.findAll({
            where: {
                id_module,
            },
            include: accessInclude,
            order: [
                [
                    {
                        model: Role,
                        as: "role",
                    },
                    "nama_role",
                    "ASC",
                ],
            ],
        });
    }

    async findByRoleAndModule(
        id_role,
        id_module
    ) {
        return await AccessModule.findOne({
            where: {
                id_role,
                id_module,
            },
        });
    }

    async create(data, created_by) {
        const access =
            await AccessModule.create({
                ...data,
                created_by,
            });

        return await this.findById(
            access.id_access
        );
    }

    async update(
        id_access,
        data,
        updated_by
    ) {
        await AccessModule.update(
            {
                ...data,
                updated_by,
            },
            {
                where: {
                    id_access,
                },
            }
        );

        return await this.findById(id_access);
    }

    async delete(id_access) {
        return await AccessModule.destroy({
            where: {
                id_access,
            },
        });
    }

    async deleteByRole(id_role) {
        return await AccessModule.destroy({
            where: {
                id_role,
            },
        });
    }
}

module.exports =
    new AccessModuleRepository();
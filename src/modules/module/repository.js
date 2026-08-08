const { Module } = require("../../models");

class ModuleRepository {
    async findAll() {
        return await Module.findAll({
            where: {
                is_active: "Y",
            },
            order: [["nama_module", "ASC"]],
        });
    }

    async findAllWithInactive() {
        return await Module.findAll({
            order: [["nama_module", "ASC"]],
        });
    }

    async findById(id_module) {
        return await Module.findByPk(id_module);
    }

    async findByCode(kode_module) {
        return await Module.findOne({
            where: {
                kode_module,
            },
        });
    }

    async findByName(nama_module) {
        return await Module.findOne({
            where: {
                nama_module,
            },
        });
    }

    async create(data, created_by) {
        const module = await Module.create({
            ...data,
            created_by,
        });

        return await this.findById(
            module.id_module
        );
    }

    async update(
        id_module,
        data,
        updated_by
    ) {
        await Module.update(
            {
                ...data,
                updated_by,
            },
            {
                where: {
                    id_module,
                },
            }
        );

        return await this.findById(id_module);
    }

    async activate(
        id_module,
        updated_by
    ) {
        return await Module.update(
            {
                is_active: "Y",
                updated_by,
            },
            {
                where: {
                    id_module,
                },
            }
        );
    }

    async deactivate(
        id_module,
        updated_by
    ) {
        return await Module.update(
            {
                is_active: "N",
                updated_by,
            },
            {
                where: {
                    id_module,
                },
            }
        );
    }

    async delete(id_module) {
        return await Module.destroy({
            where: {
                id_module,
            },
        });
    }
}

module.exports = new ModuleRepository();
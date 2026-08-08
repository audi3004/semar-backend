const { Unit } = require("../../models");

class UnitRepository {
    async findAll() {
        return await Unit.findAll({
            where: {
                is_active: "Y",
            },
            include: [
                {
                    model: Unit,
                    as: "indukUnit",
                    attributes: [
                        "id_unit",
                        "nama_unit",
                    ],
                    required: false,
                },
            ],
            order: [
                ["nama_unit", "ASC"],
            ],
        });
    }

    async findAllWithInactive() {
        return await Unit.findAll({
            include: [
                {
                    model: Unit,
                    as: "indukUnit",
                    attributes: [
                        "id_unit",
                        "nama_unit",
                    ],
                    required: false,
                },
            ],
            order: [
                ["nama_unit", "ASC"],
            ],
        });
    }

    async findById(id_unit) {
        return await Unit.findByPk(id_unit, {
            include: [
                {
                    model: Unit,
                    as: "indukUnit",
                    attributes: [
                        "id_unit",
                        "nama_unit",
                    ],
                    required: false,
                },
                {
                    model: Unit,
                    as: "subUnits",
                    attributes: [
                        "id_unit",
                        "nama_unit",
                        "is_active",
                    ],
                    required: false,
                },
            ],
        });
    }

    async findByName(
        nama_unit,
        id_induk_unit = null
    ) {
        return await Unit.findOne({
            where: {
                nama_unit,
                id_induk_unit,
            },
        });
    }

    async findByParent(id_induk_unit) {
        return await Unit.findAll({
            where: {
                id_induk_unit,
                is_active: "Y",
            },
            order: [
                ["nama_unit", "ASC"],
            ],
        });
    }

    async create(data, created_by) {
        const unit = await Unit.create({
            ...data,
            created_by,
        });

        return await this.findById(
            unit.id_unit
        );
    }

    async update(id_unit, data, updated_by) {
        await Unit.update(
            {
                ...data,
                updated_by,
            },
            {
                where: {
                    id_unit,
                },
            }
        );

        return await this.findById(id_unit);
    }

    async activate(id_unit, updated_by) {
        return await Unit.update(
            {
                is_active: "Y",
                updated_by,
            },
            {
                where: {
                    id_unit,
                },
            }
        );
    }

    async deactivate(id_unit, updated_by) {
        return await Unit.update(
            {
                is_active: "N",
                updated_by,
            },
            {
                where: {
                    id_unit,
                },
            }
        );
    }

    async delete(id_unit) {
        return await Unit.destroy({
            where: {
                id_unit,
            },
        });
    }
}

module.exports = new UnitRepository();

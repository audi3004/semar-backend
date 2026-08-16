const { Jabatan } = require("../../models");

class JabatanRepository {
    async findAll() {
        return await Jabatan.findAll({
            where: {
                is_active: "Y",
            },
            order: [
                ["id_jabatan", "ASC"],
            ],
        });
    }

    async findAllWithInactive() {
        return await Jabatan.findAll({
            order: [
                ["id_jabatan", "ASC"],
            ],
        });
    }

    async findById(id_jabatan) {
        return await Jabatan.findByPk(id_jabatan);
    }

    async findByName(nama_jabatan) {
        return await Jabatan.findOne({
            where: {
                nama_jabatan,
            },
        });
    }

    async create(data, created_by) {
        const jabatan = await Jabatan.create({
            ...data,
            created_by,
        });

        return await this.findById(
            jabatan.id_jabatan
        );
    }

    async update(id_jabatan, data, updated_by) {
        await Jabatan.update(
            {
                ...data,
                updated_by,
            },
            {
                where: {
                    id_jabatan,
                },
            }
        );

        return await this.findById(id_jabatan);
    }

    async activate(id_jabatan, updated_by) {
        return await Jabatan.update(
            {
                is_active: "Y",
                updated_by,
            },
            {
                where: {
                    id_jabatan,
                },
            }
        );
    }

    async deactivate(id_jabatan, updated_by) {
        return await Jabatan.update(
            {
                is_active: "N",
                updated_by,
            },
            {
                where: {
                    id_jabatan,
                },
            }
        );
    }

    async delete(id_jabatan) {
        return await Jabatan.destroy({
            where: {
                id_jabatan,
            },
        });
    }
}

module.exports = new JabatanRepository();

const {
    Pegawai,
    Jabatan,
    Project,
    Unit,
    PegawaiProject,
    sequelize,
} = require("../../models");

const projectInclude = {
    model: Project,
    as: "projects",
    attributes: ["id_project", "nama_project", "is_active"],
    through: { attributes: ["is_active"] },
};

class PegawaiRepository {
    async findAll() {
        return await Pegawai.findAll({
            where: {
                is_active: "Y",
            },
            include: [
                projectInclude,
                {
                    model: Jabatan,
                    as: "jabatan",
                    attributes: [
                        "id_jabatan",
                        "nama_jabatan",
                        "id_project",
                    ],
                    include: [
                        {
                            model: Project,
                            as: "project",
                            attributes: [
                                "id_project",
                                "nama_project",
                            ],
                        },
                    ],
                },
                {
                    model: Unit,
                    as: "unit",
                    attributes: [
                        "id_unit",
                        "nama_unit",
                        "id_induk_unit",
                    ],
                },
            ],
            order: [
                ["nama", "ASC"],
            ],
        });
    }

    async findAllWithInactive() {
        return await Pegawai.findAll({
            include: [
                projectInclude,
                {
                    model: Jabatan,
                    as: "jabatan",
                    attributes: [
                        "id_jabatan",
                        "nama_jabatan",
                        "id_project",
                    ],
                    include: [
                        {
                            model: Project,
                            as: "project",
                            attributes: [
                                "id_project",
                                "nama_project",
                            ],
                        },
                    ],
                },
                {
                    model: Unit,
                    as: "unit",
                    attributes: [
                        "id_unit",
                        "nama_unit",
                        "id_induk_unit",
                    ],
                },
            ],
            order: [
                ["nama", "ASC"],
            ],
        });
    }

    async findById(id_pegawai) {
        return await Pegawai.findByPk(id_pegawai, {
            include: [
                projectInclude,
                {
                    model: Jabatan,
                    as: "jabatan",
                    attributes: [
                        "id_jabatan",
                        "nama_jabatan",
                        "id_project",
                    ],
                    include: [
                        {
                            model: Project,
                            as: "project",
                            attributes: [
                                "id_project",
                                "nama_project",
                            ],
                        },
                    ],
                },
                {
                    model: Unit,
                    as: "unit",
                    attributes: [
                        "id_unit",
                        "nama_unit",
                        "id_induk_unit",
                    ],
                },
            ],
        });
    }

    async findByNip(nip) {
        return await Pegawai.findOne({
            where: {
                nip,
            },
        });
    }

    async findByUnit(id_unit) {
        return await Pegawai.findAll({
            where: {
                id_unit,
                is_active: "Y",
            },
            include: [
                {
                    model: Jabatan,
                    as: "jabatan",
                    attributes: [
                        "id_jabatan",
                        "nama_jabatan",
                    ],
                },
                {
                    model: Unit,
                    as: "unit",
                    attributes: [
                        "id_unit",
                        "nama_unit",
                    ],
                },
            ],
            order: [
                ["nama", "ASC"],
            ],
        });
    }

    async findByJabatan(id_jabatan) {
        return await Pegawai.findAll({
            where: {
                id_jabatan,
                is_active: "Y",
            },
            include: [
                {
                    model: Jabatan,
                    as: "jabatan",
                    attributes: [
                        "id_jabatan",
                        "nama_jabatan",
                    ],
                },
                {
                    model: Unit,
                    as: "unit",
                    attributes: [
                        "id_unit",
                        "nama_unit",
                    ],
                },
            ],
            order: [
                ["nama", "ASC"],
            ],
        });
    }

    async create(data, created_by) {
        const pegawai = await Pegawai.create({
            ...data,
            created_by,
        });

        return await this.findById(
            pegawai.id_pegawai
        );
    }

    async update(
        id_pegawai,
        data,
        updated_by
    ) {
        await Pegawai.update(
            {
                ...data,
                updated_by,
            },
            {
                where: {
                    id_pegawai,
                },
            }
        );

        return await this.findById(id_pegawai);
    }

    async updateUnit(
        id_pegawai,
        id_unit,
        updated_by,
        transaction = null
    ) {
        return await Pegawai.update(
            {
                id_unit,
                updated_by,
            },
            {
                where: {
                    id_pegawai,
                },
                transaction,
            }
        );
    }

    async activate(
        id_pegawai,
        updated_by
    ) {
        return await Pegawai.update(
            {
                is_active: "Y",
                updated_by,
            },
            {
                where: {
                    id_pegawai,
                },
            }
        );
    }

    async deactivate(
        id_pegawai,
        updated_by
    ) {
        return await Pegawai.update(
            {
                is_active: "N",
                updated_by,
            },
            {
                where: {
                    id_pegawai,
                },
            }
        );
    }

    async delete(id_pegawai) {
        return await Pegawai.destroy({
            where: {
                id_pegawai,
            },
        });
    }

    async syncProjects(id_pegawai, projectIds, updated_by) {
        await sequelize.transaction(async (transaction) => {
            await PegawaiProject.destroy({ where: { id_pegawai }, transaction });
            if (projectIds.length) {
                await PegawaiProject.bulkCreate(projectIds.map((id_project) => ({
                    id_pegawai,
                    id_project,
                    is_active: "Y",
                    created_by: updated_by,
                    updated_by,
                })), { transaction });
            }
        });
        return this.findById(id_pegawai);
    }


}

module.exports = new PegawaiRepository();

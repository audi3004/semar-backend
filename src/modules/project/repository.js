const { Project } = require("../../models");

class ProjectRepository {

    async findAll() {
        return await Project.findAll({
            where: {
                is_active: "Y"
            },
            order: [["id_project", "ASC"]]
        });
    }

    async findAllWithInactive() {
        return await Project.findAll({
            order: [["id_project", "ASC"]]
        });
    }

    async findById(id_project) {
        return await Project.findByPk(id_project);
    }

    async findByName(nama_project) {
        return await Project.findOne({
            where: {
                nama_project
            }
        });
    }

    async create(data, created_by) {
        return await Project.create({
            ...data,
            created_by
        });
    }

    async update(id_project, data, updated_by) {

        await Project.update(
            {
                ...data,
                updated_by
            },
            {
                where: {
                    id_project
                }
            }
        );

        return await this.findById(id_project);

    }

    async activate(id_project, updated_by) {

        return await Project.update(
            {
                is_active: "Y",
                updated_by
            },
            {
                where: {
                    id_project
                }
            }
        );

    }

    async deactivate(id_project, updated_by) {

        return await Project.update(
            {
                is_active: "N",
                updated_by
            },
            {
                where: {
                    id_project
                }
            }
        );

    }

    async delete(id_project) {

        return await Project.destroy({
            where: {
                id_project
            }
        });

    }

}

module.exports = new ProjectRepository();
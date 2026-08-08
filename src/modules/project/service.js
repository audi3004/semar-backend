const projectRepository = require("./repository");
const AppError = require("../../utils/appError");

class ProjectService {
    async checkProject(id_project) {
        const project = await projectRepository.findById(id_project);

        if (!project) {
            throw new AppError("Project tidak ditemukan", 404);
        }

        return project;
    }

    async findAll() {
        return await projectRepository.findAll();
    }

    async findAllWithInactive() {
        return await projectRepository.findAllWithInactive();
    }

    async findById(id_project) {
        return await this.checkProject(id_project);
    }

    async create(data, created_by) {
        const exist = await projectRepository.findByName(
            data.nama_project
        );

        if (exist) {
            throw new AppError(
                "Nama project sudah digunakan",
                409
            );
        }

        return await projectRepository.create(
            data,
            created_by
        );
    }

    async update(id_project, data, updated_by) {
        await this.checkProject(id_project);

        if (data.nama_project) {
            const exist = await projectRepository.findByName(
                data.nama_project
            );

            if (
                exist &&
                exist.id_project !== Number(id_project)
            ) {
                throw new AppError(
                    "Nama project sudah digunakan",
                    409
                );
            }
        }

        return await projectRepository.update(
            id_project,
            data,
            updated_by
        );
    }

    async activate(id_project, updated_by) {
        await this.checkProject(id_project);

        return await projectRepository.activate(
            id_project,
            updated_by
        );
    }

    async deactivate(id_project, updated_by) {
        await this.checkProject(id_project);

        return await projectRepository.deactivate(
            id_project,
            updated_by
        );
    }

    async delete(id_project) {
        await this.checkProject(id_project);

        return await projectRepository.delete(id_project);
    }
}

module.exports = new ProjectService();
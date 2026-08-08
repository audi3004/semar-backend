const projectService = require("./service");
const response = require("../../utils/response");

class ProjectController {
    async findAll(req, res) {
        try {
            const projects = await projectService.findAll();

            return response.success(
                res,
                projects,
                "Data project berhasil diambil"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async findAllWithInactive(req, res) {
        try {
            const projects =
                await projectService.findAllWithInactive();

            return response.success(
                res,
                projects,
                "Data project berhasil diambil"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async findById(req, res) {
        try {
            const project = await projectService.findById(
                req.params.id
            );

            return response.success(
                res,
                project,
                "Detail project berhasil diambil"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async create(req, res) {
        try {
            const project = await projectService.create(
                req.body,
                req.user?.id_user || null
            );

            return response.created(
                res,
                project,
                "Project berhasil ditambahkan"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async update(req, res) {
        try {
            const project = await projectService.update(
                req.params.id,
                req.body,
                req.user?.id_user || null
            );

            return response.updated(
                res,
                project,
                "Project berhasil diperbarui"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async activate(req, res) {
        try {
            await projectService.activate(
                req.params.id,
                req.user?.id_user || null
            );

            return response.success(
                res,
                null,
                "Project berhasil diaktifkan"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async deactivate(req, res) {
        try {
            await projectService.deactivate(
                req.params.id,
                req.user?.id_user || null
            );

            return response.success(
                res,
                null,
                "Project berhasil dinonaktifkan"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }

    async delete(req, res) {
        try {
            await projectService.delete(req.params.id);

            return response.deleted(
                res,
                "Project berhasil dihapus"
            );
        } catch (err) {
            return response.error(
                res,
                err.message,
                err.statusCode || 500
            );
        }
    }
}

module.exports = new ProjectController();
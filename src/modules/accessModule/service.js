const accessModuleRepository = require(
    "./repository"
);
const roleRepository = require(
    "../role/repository"
);
const moduleRepository = require(
    "../module/repository"
);
const AppError = require(
    "../../utils/appError"
);

class AccessModuleService {
    async checkAccess(id_access) {
        const access =
            await accessModuleRepository
                .findById(id_access);

        if (!access) {
            throw new AppError(
                "Hak akses tidak ditemukan",
                404
            );
        }

        return access;
    }

    async checkRole(id_role) {
        const role =
            await roleRepository.findById(
                id_role
            );

        if (!role) {
            throw new AppError(
                "Role tidak ditemukan",
                404
            );
        }

        return role;
    }

    async checkModule(id_module) {
        const module =
            await moduleRepository.findById(
                id_module
            );

        if (!module) {
            throw new AppError(
                "Module tidak ditemukan",
                404
            );
        }

        return module;
    }

    async ensureAccessAvailable(
        id_role,
        id_module,
        excludeId = null
    ) {
        const existing =
            await accessModuleRepository
                .findByRoleAndModule(
                    id_role,
                    id_module
                );

        if (
            existing &&
            existing.id_access !==
            Number(excludeId)
        ) {
            throw new AppError(
                "Hak akses untuk role dan module tersebut sudah tersedia",
                409
            );
        }
    }

    normalizeAccess(data) {
        return {
            can_create:
                data.can_create || "N",
            can_read:
                data.can_read || "N",
            can_update:
                data.can_update || "N",
            can_delete:
                data.can_delete || "N",
            can_approve:
                data.can_approve || "N",
        };
    }

    async findAll() {
        return await accessModuleRepository
            .findAll();
    }

    async findById(id_access) {
        return await this.checkAccess(
            id_access
        );
    }

    async findByRole(id_role) {
        await this.checkRole(id_role);

        return await accessModuleRepository
            .findByRole(id_role);
    }

    async findByModule(id_module) {
        await this.checkModule(id_module);

        return await accessModuleRepository
            .findByModule(id_module);
    }

    async create(data, created_by) {
        await this.checkRole(data.id_role);

        await this.checkModule(
            data.id_module
        );

        await this.ensureAccessAvailable(
            data.id_role,
            data.id_module
        );

        return await accessModuleRepository
            .create(
                {
                    id_role: data.id_role,
                    id_module: data.id_module,
                    ...this.normalizeAccess(data),
                },
                created_by
            );
    }

    async update(
        id_access,
        data,
        updated_by
    ) {
        const currentAccess =
            await this.checkAccess(id_access);

        const idRole =
            data.id_role ??
            currentAccess.id_role;

        const idModule =
            data.id_module ??
            currentAccess.id_module;

        if (data.id_role) {
            await this.checkRole(
                data.id_role
            );
        }

        if (data.id_module) {
            await this.checkModule(
                data.id_module
            );
        }

        await this.ensureAccessAvailable(
            idRole,
            idModule,
            id_access
        );

        return await accessModuleRepository
            .update(
                id_access,
                data,
                updated_by
            );
    }

    async delete(id_access) {
        await this.checkAccess(id_access);

        return await accessModuleRepository
            .delete(id_access);
    }
}

module.exports =
    new AccessModuleService();
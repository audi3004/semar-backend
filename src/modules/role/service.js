const roleRepository = require(
    "./repository"
);

const AppError = require(
    "../../utils/AppError"
);

class RoleService {
    normalizeText(value) {
        if (
            value === undefined ||
            value === null
        ) {
            return value;
        }

        return String(value)
            .trim()
            .replace(
                /\s+/g,
                " "
            );
    }

    normalizeCode(value) {
        if (
            value === undefined ||
            value === null
        ) {
            return value;
        }

        return String(value)
            .trim()
            .toUpperCase()
            .replace(
                /[^A-Z0-9]+/g,
                "_"
            )
            .replace(
                /^_+|_+$/g,
                ""
            );
    }

    normalizeFlag(value) {
        if (
            value === undefined ||
            value === null
        ) {
            return value;
        }

        return String(value)
            .trim()
            .toUpperCase();
    }

    async checkRole(
        id_role
    ) {
        const role =
            await roleRepository
                .findById(
                    id_role
                );

        if (!role) {
            throw new AppError(
                "Data role tidak ditemukan",
                404
            );
        }

        return role;
    }

    async ensureCodeAvailable(
        kode_role,
        excludeId = null
    ) {
        const duplicate =
            await roleRepository
                .findByCode(
                    kode_role,
                    excludeId
                );

        if (duplicate) {
            throw new AppError(
                `Kode role "${kode_role}" sudah digunakan`,
                409
            );
        }
    }

    async ensureNameAvailable(
        nama_role,
        excludeId = null
    ) {
        const duplicate =
            await roleRepository
                .findByName(
                    nama_role,
                    excludeId
                );

        if (duplicate) {
            throw new AppError(
                `Nama role "${nama_role}" sudah digunakan`,
                409
            );
        }
    }

    async ensureLevelAvailable(
        level_role,
        excludeId = null
    ) {
        const duplicate =
            await roleRepository
                .findByLevel(
                    level_role,
                    excludeId
                );

        if (duplicate) {
            throw new AppError(
                `Level role "${level_role}" sudah digunakan oleh role lain`,
                409
            );
        }
    }

    async ensureSingleSuperAdmin(
        is_super_admin,
        excludeId = null
    ) {
        if (
            is_super_admin !==
            "Y"
        ) {
            return;
        }

        const existingSuperAdmin =
            await roleRepository
                .findSuperAdmin(
                    excludeId
                );

        if (
            existingSuperAdmin
        ) {
            throw new AppError(
                `Role super admin sudah ditetapkan pada "${existingSuperAdmin.nama_role}"`,
                409
            );
        }
    }

    async findAll(
        filters = {}
    ) {
        return await roleRepository
            .findAll({
                kode_role:
                    this.normalizeCode(
                        filters.kode_role
                    ),

                nama_role:
                    this.normalizeText(
                        filters.nama_role
                    ),

                level_role:
                    filters.level_role,

                is_super_admin:
                    this.normalizeFlag(
                        filters
                            .is_super_admin
                    ),

                is_active:
                    this.normalizeFlag(
                        filters.is_active
                    ),
            });
    }

    async findById(
        id_role
    ) {
        return await this.checkRole(
            id_role
        );
    }

    async create(
        data,
        created_by = null
    ) {
        const kodeRole =
            this.normalizeCode(
                data.kode_role
            );

        const namaRole =
            this.normalizeText(
                data.nama_role
            );

        const levelRole =
            Number(
                data.level_role
            );

        const isSuperAdmin =
            this.normalizeFlag(
                data.is_super_admin ??
                "N"
            );

        const isActive =
            this.normalizeFlag(
                data.is_active ??
                "Y"
            );

        await this
            .ensureCodeAvailable(
                kodeRole
            );

        await this
            .ensureNameAvailable(
                namaRole
            );

        await this
            .ensureLevelAvailable(
                levelRole
            );

        await this
            .ensureSingleSuperAdmin(
                isSuperAdmin
            );

        return await roleRepository
            .create(
                {
                    kode_role:
                        kodeRole,

                    nama_role:
                        namaRole,

                    level_role:
                        levelRole,

                    is_super_admin:
                        isSuperAdmin,

                    is_active:
                        isActive,
                },
                created_by
            );
    }

    async update(
        id_role,
        data,
        updated_by = null
    ) {
        const currentRole =
            await this.checkRole(
                id_role
            );

        const kodeRole =
            data.kode_role !==
                undefined
                ? this.normalizeCode(
                    data.kode_role
                )
                : currentRole
                    .kode_role;

        const namaRole =
            data.nama_role !==
                undefined
                ? this.normalizeText(
                    data.nama_role
                )
                : currentRole
                    .nama_role;

        const levelRole =
            data.level_role !==
                undefined
                ? Number(
                    data.level_role
                )
                : currentRole
                    .level_role;

        const isSuperAdmin =
            data.is_super_admin !==
                undefined
                ? this.normalizeFlag(
                    data.is_super_admin
                )
                : currentRole
                    .is_super_admin;

        const isActive =
            data.is_active !==
                undefined
                ? this.normalizeFlag(
                    data.is_active
                )
                : currentRole
                    .is_active;

        await this
            .ensureCodeAvailable(
                kodeRole,
                id_role
            );

        await this
            .ensureNameAvailable(
                namaRole,
                id_role
            );

        await this
            .ensureLevelAvailable(
                levelRole,
                id_role
            );

        await this
            .ensureSingleSuperAdmin(
                isSuperAdmin,
                id_role
            );

        if (
            currentRole
                .is_super_admin ===
            "Y" &&
            isSuperAdmin === "N"
        ) {
            throw new AppError(
                "Role Super Admin tidak dapat diubah menjadi role biasa",
                400
            );
        }

        if (
            currentRole
                .is_super_admin ===
            "Y" &&
            isActive === "N"
        ) {
            throw new AppError(
                "Role Super Admin tidak dapat dinonaktifkan",
                400
            );
        }

        return await roleRepository
            .update(
                id_role,
                {
                    kode_role:
                        kodeRole,

                    nama_role:
                        namaRole,

                    level_role:
                        levelRole,

                    is_super_admin:
                        isSuperAdmin,

                    is_active:
                        isActive,
                },
                updated_by
            );
    }

    async delete(
        id_role
    ) {
        const role =
            await this.checkRole(
                id_role
            );

        if (
            role.is_super_admin ===
            "Y"
        ) {
            throw new AppError(
                "Role Super Admin tidak dapat dihapus",
                400
            );
        }

        try {
            await roleRepository
                .delete(
                    id_role
                );

            return true;
        } catch (error) {
            if (
                error.name ===
                "SequelizeForeignKeyConstraintError" ||
                error.parent?.code ===
                "ER_ROW_IS_REFERENCED_2"
            ) {
                throw new AppError(
                    "Role tidak dapat dihapus karena masih digunakan oleh data lain",
                    409
                );
            }

            throw error;
        }
    }
}

module.exports =
    new RoleService();
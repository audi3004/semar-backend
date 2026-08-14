const unitRoleRepository = require(
    "./repository"
);

const userRepository = require(
    "../user/repository"
);

const unitRepository = require(
    "../unit/repository"
);

const roleRepository = require(
    "../role/repository"
);

const AppError = require(
    "../../utils/appError"
);

const ALLOWED_APPROVAL_ROLES = [
    "CHECKER",
    "VERIFICATION",
    "APPROVAL_1",
    "APPROVAL_2",
    "APPROVAL_3",
];

class UnitRoleService {
    resolveScopeType(role, unit) {
        const roleCode = this.normalizeCode(role?.kode_role);
        const unitName = this.normalizeCode(unit?.nama_unit);
        if (roleCode === "APPROVAL_2" && unitName === "UP 2 JAWA TENGAH") {
            return "SELF";
        }
        return "SELF_AND_DESCENDANTS";
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
            .toUpperCase();
    }

    async checkUnitRole(
        id_unit_role
    ) {
        const unitRole =
            await unitRoleRepository
                .findById(
                    id_unit_role
                );

        if (!unitRole) {
            throw new AppError(
                "Data unit role tidak ditemukan",
                404
            );
        }

        return unitRole;
    }

    async checkUser(
        id_user
    ) {
        const user =
            await userRepository
                .findById(
                    id_user
                );

        if (!user) {
            throw new AppError(
                "Data user tidak ditemukan",
                404
            );
        }

        if (
            user.is_active !==
            undefined &&
            user.is_active !== "Y"
        ) {
            throw new AppError(
                "User sedang tidak aktif",
                400
            );
        }

        return user;
    }

    async checkUnit(
        id_unit
    ) {
        const unit =
            await unitRepository
                .findById(
                    id_unit
                );

        if (!unit) {
            throw new AppError(
                "Data unit tidak ditemukan",
                404
            );
        }

        if (
            unit.is_active !==
            undefined &&
            unit.is_active !== "Y"
        ) {
            throw new AppError(
                "Unit sedang tidak aktif",
                400
            );
        }

        return unit;
    }

    async checkApprovalRole(
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

        if (
            role.is_active !==
            undefined &&
            role.is_active !== "Y"
        ) {
            throw new AppError(
                "Role sedang tidak aktif",
                400
            );
        }

        const kodeRole =
            this.normalizeCode(
                role.kode_role
            );

        if (
            !ALLOWED_APPROVAL_ROLES.includes(
                kodeRole
            )
        ) {
            throw new AppError(
                `Role ${role.nama_role || kodeRole} tidak dapat digunakan pada Master Unit Role`,
                400
            );
        }

        return role;
    }

    async ensureNotDuplicate(
        id_user,
        id_unit,
        id_role,
        excludeId = null
    ) {
        const duplicate =
            await unitRoleRepository
                .findDuplicate(
                    id_user,
                    id_unit,
                    id_role,
                    excludeId
                );

        if (duplicate) {
            throw new AppError(
                "User sudah memiliki role tersebut pada unit yang dipilih",
                409
            );
        }
    }

    async findAll(
        filters = {}
    ) {
        return await unitRoleRepository
            .findAll({
                ...filters,

                nama_user:
                    filters.nama_user
                        ?.trim(),

                username:
                    filters.username
                        ?.trim(),

                nama_unit:
                    filters.nama_unit
                        ?.trim(),

                kode_role:
                    this.normalizeCode(
                        filters.kode_role
                    ),

                is_active:
                    this.normalizeCode(
                        filters.is_active
                    ),
            });
    }

    async findById(
        id_unit_role
    ) {
        return await this.checkUnitRole(
            id_unit_role
        );
    }

    async findByUser(
        id_user,
        filters = {}
    ) {
        await this.checkUser(
            id_user
        );

        return await unitRoleRepository
            .findByUser(
                id_user,
                this.normalizeCode(
                    filters.is_active
                )
            );
    }

    async findByUnit(
        id_unit,
        filters = {}
    ) {
        await this.checkUnit(
            id_unit
        );

        return await unitRoleRepository
            .findByUnit(
                id_unit,
                this.normalizeCode(
                    filters.is_active
                )
            );
    }

    async findApprovers(
        id_unit,
        id_role
    ) {
        await this.checkUnit(
            id_unit
        );

        await this.checkApprovalRole(
            id_role
        );

        return await unitRoleRepository
            .findApprovers(
                id_unit,
                id_role
            );
    }

    async hasAuthority(
        id_user,
        id_unit,
        id_role
    ) {
        const unitRole =
            await unitRoleRepository
                .hasAuthority(
                    id_user,
                    id_unit,
                    id_role
                );

        return {
            has_authority:
                Boolean(unitRole),

            unit_role:
                unitRole || null,
        };
    }

    async create(
        data,
        user = null
    ) {
        const [checkedUser, checkedUnit, checkedRole] = await Promise.all([
            this.checkUser(
                data.id_user
            ),

            this.checkUnit(
                data.id_unit
            ),

            this.checkApprovalRole(
                data.id_role
            ),
        ]);

        await this.ensureNotDuplicate(
            data.id_user,
            data.id_unit,
            data.id_role
        );

        return await unitRoleRepository
            .create(
                {
                    id_user:
                        data.id_user,

                    id_unit:
                        data.id_unit,

                    id_role:
                        data.id_role,

                    scope_type: this.resolveScopeType(checkedRole, checkedUnit),

                    is_active:
                        this.normalizeCode(
                            data.is_active ||
                            "Y"
                        ),
                },

                user?.id_user ??
                null
            );
    }

    async createBulk(
        data,
        user = null
    ) {
        const assignments =
            data.assignments;

        /*
        |--------------------------------------------------------------------------
        | CEK DUPLIKASI DI DALAM PAYLOAD
        |--------------------------------------------------------------------------
        */

        const payloadKeys =
            new Set();

        for (
            const assignment of
            assignments
        ) {
            const key =
                `${assignment.id_user}-` +
                `${assignment.id_unit}-` +
                `${assignment.id_role}`;

            if (
                payloadKeys.has(key)
            ) {
                throw new AppError(
                    "Terdapat kombinasi user, unit, dan role yang duplikat pada payload",
                    400
                );
            }

            payloadKeys.add(key);
        }

        /*
        |--------------------------------------------------------------------------
        | VALIDASI SEMUA DATA
        |--------------------------------------------------------------------------
        */

        for (
            const assignment of
            assignments
        ) {
            const [, checkedUnit, checkedRole] = await Promise.all([
                this.checkUser(
                    assignment.id_user
                ),

                this.checkUnit(
                    assignment.id_unit
                ),

                this.checkApprovalRole(
                    assignment.id_role
                ),
            ]);

            await this.ensureNotDuplicate(
                assignment.id_user,
                assignment.id_unit,
                assignment.id_role
            );
            assignment.resolved_scope_type = this.resolveScopeType(checkedRole, checkedUnit);
        }

        /*
        |--------------------------------------------------------------------------
        | INSERT
        |--------------------------------------------------------------------------
        */

        await unitRoleRepository
            .bulkCreate(
                assignments.map(
                    (assignment) => ({
                        id_user:
                            assignment
                                .id_user,

                        id_unit:
                            assignment
                                .id_unit,

                        id_role:
                            assignment
                                .id_role,

                        scope_type: assignment.resolved_scope_type,

                        is_active:
                            this.normalizeCode(
                                assignment
                                    .is_active ||
                                "Y"
                            ),
                    })
                ),

                user?.id_user ??
                null
            );

        /*
        |--------------------------------------------------------------------------
        | RETURN DATA USER YANG BARU DISET
        |--------------------------------------------------------------------------
        */

        const affectedUsers = [
            ...new Set(
                assignments.map(
                    (item) =>
                        item.id_user
                )
            ),
        ];

        const result = [];

        for (
            const idUser of
            affectedUsers
        ) {
            const userAssignments =
                await unitRoleRepository
                    .findByUser(
                        idUser
                    );

            result.push(
                ...userAssignments
            );
        }

        return result;
    }

    async update(
        id_unit_role,
        data,
        user = null
    ) {
        const current =
            await this.checkUnitRole(
                id_unit_role
            );

        const idUser =
            data.id_user ??
            current.id_user;

        const idUnit =
            data.id_unit ??
            current.id_unit;

        const idRole =
            data.id_role ??
            current.id_role;

        const [, checkedUnit, checkedRole] = await Promise.all([
            this.checkUser(
                idUser
            ),

            this.checkUnit(
                idUnit
            ),

            this.checkApprovalRole(
                idRole
            ),
        ]);

        await this.ensureNotDuplicate(
            idUser,
            idUnit,
            idRole,
            id_unit_role
        );

        return await unitRoleRepository
            .update(
                id_unit_role,

                {
                    id_user:
                        idUser,

                    id_unit:
                        idUnit,

                    id_role:
                        idRole,

                    scope_type: this.resolveScopeType(checkedRole, checkedUnit),

                    is_active:
                        data.is_active !==
                            undefined
                            ? this.normalizeCode(
                                data.is_active
                            )
                            : current
                                .is_active,
                },

                user?.id_user ??
                null
            );
    }

    async updateStatus(
        id_unit_role,
        is_active,
        user = null
    ) {
        await this.checkUnitRole(
            id_unit_role
        );

        return await unitRoleRepository
            .updateStatus(
                id_unit_role,
                this.normalizeCode(
                    is_active
                ),
                user?.id_user ??
                null
            );
    }

    async delete(
        id_unit_role
    ) {
        await this.checkUnitRole(
            id_unit_role
        );

        await unitRoleRepository.delete(
            id_unit_role
        );

        return true;
    }
}

module.exports =
    new UnitRoleService();

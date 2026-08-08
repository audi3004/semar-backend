const {
    User,
    Role,
    Pegawai,
    Petugas,
    Jabatan,
    Unit,
} = require("../../models");

const userInclude = [
    {
        model: Role,
        as: "role",
        attributes: [
            "id_role",
            "nama_role",
        ],
    },
    {
        model: Pegawai,
        as: "pegawai",
        attributes: [
            "id_pegawai",
            "nip",
            "nama",
            "id_jabatan",
            "id_unit",
        ],
        required: false,
        include: [
            {
                model: Jabatan,
                as: "jabatan",
                attributes: [
                    "id_jabatan",
                    "nama_jabatan",
                ],
                required: false,
            },
            {
                model: Unit,
                as: "unit",
                attributes: [
                    "id_unit",
                    "nama_unit",
                ],
                required: false,
            },
        ],
    },
    {
        model: Petugas,
        as: "petugas",
        attributes: [
            "id_petugas",
            "nip",
            "nama",
            "id_jabatan",
            "id_unit",
        ],
        required: false,
        include: [
            {
                model: Jabatan,
                as: "jabatan",
                attributes: [
                    "id_jabatan",
                    "nama_jabatan",
                ],
                required: false,
            },
            {
                model: Unit,
                as: "unit",
                attributes: [
                    "id_unit",
                    "nama_unit",
                ],
                required: false,
            },
        ],
    },
];

const sensitiveAttributes = [
    "password",
    "refresh_token_hash",
    "refresh_token_expires_at",
];

class UserRepository {
    async findAll() {
        return await User.findAll({
            where: {
                is_active: "Y",
            },
            attributes: {
                exclude:
                    sensitiveAttributes,
            },
            include: userInclude,
            order: [
                ["username", "ASC"],
            ],
        });
    }

    async findAllWithInactive() {
        return await User.findAll({
            attributes: {
                exclude:
                    sensitiveAttributes,
            },
            include: userInclude,
            order: [
                ["username", "ASC"],
            ],
        });
    }

    async findById(id_user) {
        return await User.findByPk(id_user, {
            attributes: {
                exclude:
                    sensitiveAttributes,
            },
            include: userInclude,
        });
    }

    async findByIdWithPassword(id_user) {
        return await User.findByPk(id_user);
    }

    async findByUsername(username) {
        return await User.findOne({
            where: {
                username,
            },
        });
    }

    async findByEmail(email) {
        return await User.findOne({
            where: {
                email,
            },
        });
    }

    async findByPegawai(id_pegawai) {
        return await User.findOne({
            where: {
                id_pegawai,
            },
        });
    }

    async findByPetugas(id_petugas) {
        return await User.findOne({
            where: {
                id_petugas,
            },
        });
    }

    async findByRole(id_role) {
        return await User.findAll({
            where: {
                id_role,
                is_active: "Y",
            },
            attributes: {
                exclude:
                    sensitiveAttributes,
            },
            include: userInclude,
            order: [
                ["username", "ASC"],
            ],
        });
    }

    async create(data, created_by) {
        const user = await User.create({
            ...data,
            created_by,
        });

        return await this.findById(
            user.id_user
        );
    }

    async update(
        id_user,
        data,
        updated_by
    ) {
        await User.update(
            {
                ...data,
                updated_by,
            },
            {
                where: {
                    id_user,
                },
            }
        );

        return await this.findById(id_user);
    }

    async updatePassword(
        id_user,
        password,
        updated_by
    ) {
        return await User.update(
            {
                password,
                refresh_token_hash:
                    null,
                refresh_token_expires_at:
                    null,
                updated_by,
            },
            {
                where: {
                    id_user,
                },
            }
        );
    }

    async activate(
        id_user,
        updated_by
    ) {
        return await User.update(
            {
                is_active: "Y",
                updated_by,
            },
            {
                where: {
                    id_user,
                },
            }
        );
    }

    async deactivate(
        id_user,
        updated_by
    ) {
        return await User.update(
            {
                is_active: "N",
                refresh_token_hash:
                    null,
                refresh_token_expires_at:
                    null,
                updated_by,
            },
            {
                where: {
                    id_user,
                },
            }
        );
    }

    async delete(id_user) {
        return await User.destroy({
            where: {
                id_user,
            },
        });
    }
}

module.exports = new UserRepository();

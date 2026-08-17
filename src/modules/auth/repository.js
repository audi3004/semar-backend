const {
    User,
    Role,
    Pegawai,
    Petugas,
    Unit,
    Jabatan,
    Project,
} = require("../../models");

class AuthRepository {
    getInclude() {
        return [
            {
                model: Role,
                as: "role",
                required: true,
                attributes: [
                    "id_role",
                    "kode_role",
                    "nama_role",
                    "level_role",
                    "is_super_admin",
                    "is_active",
                ],
            },
            {
                model: Pegawai,
                as: "pegawai",
                required: false,
                include: [
                    { model: Unit, as: "unit", required: false },
                    { model: Jabatan, as: "jabatan", required: false },
                    {
                        model: Project,
                        as: "projects",
                        required: false,
                        attributes: ["id_project", "nama_project", "is_active"],
                        through: { attributes: ["is_active"], where: { is_active: "Y" } },
                    },
                ],
            },
            {
                model: Petugas,
                as: "petugas",
                required: false,
                include: [
                    { model: Unit, as: "unit", required: false },
                    { model: Jabatan, as: "jabatan", required: false },
                    { model: Project, as: "project", required: false },
                ],
            },
        ];
    }

    async findByUsername(
        username
    ) {
        return await User.findOne({
            where: {
                username,
            },
            include:
                this.getInclude(),
        });
    }

    async findById(
        id_user
    ) {
        return await User.findByPk(
            id_user,
            {
                include:
                    this.getInclude(),
            }
        );
    }

    async saveRefreshToken(
        id_user,
        refresh_token_hash,
        refresh_token_expires_at
    ) {
        return await User.update(
            {
                refresh_token_hash,
                refresh_token_expires_at,
            },
            {
                where: {
                    id_user,
                },
            }
        );
    }

    async clearRefreshToken(
        id_user
    ) {
        return await User.update(
            {
                refresh_token_hash:
                    null,
                refresh_token_expires_at:
                    null,
            },
            {
                where: {
                    id_user,
                },
            }
        );
    }
}

module.exports =
    new AuthRepository();

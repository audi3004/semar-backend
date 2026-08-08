require("dotenv").config();

const bcrypt = require("bcrypt");

const {
    sequelize,
    Role,
    User,
} = require("../models");

const SUPER_ADMIN_USERNAME =
    process.env
        .SUPER_ADMIN_USERNAME ||
    "superadmin";

const SUPER_ADMIN_PASSWORD =
    process.env
        .SUPER_ADMIN_PASSWORD ||
    "SuperAdmin123!!";

async function seedSuperAdmin() {
    const transaction =
        await sequelize.transaction();

    try {
        const [role] =
            await Role.findOrCreate({
                where: {
                    kode_role:
                        "SUPER_ADMIN",
                },
                defaults: {
                    nama_role:
                        "Super Administrator",
                    level_role: 100,
                    is_super_admin:
                        "Y",
                    is_active: "Y",
                },
                transaction,
            });

        if (
            role.is_active !== "Y" ||
            role.is_super_admin !==
            "Y"
        ) {
            await role.update(
                {
                    is_active: "Y",
                    is_super_admin:
                        "Y",
                },
                {
                    transaction,
                }
            );
        }

        const password =
            await bcrypt.hash(
                SUPER_ADMIN_PASSWORD,
                12
            );
        const existingUser =
            await User.findOne({
                where: {
                    username:
                        SUPER_ADMIN_USERNAME,
                },
                transaction,
            });

        let user;

        if (existingUser) {
            user =
                await existingUser
                    .update(
                        {
                            id_role:
                                role.id_role,
                            password,
                            is_active:
                                "Y",
                            refresh_token_hash:
                                null,
                            refresh_token_expires_at:
                                null,
                            updated_at:
                                new Date(),
                            updated_by:
                                null,
                        },
                        {
                            transaction,
                        }
                    );
        } else {
            user = await User.create(
                {
                    id_pegawai: null,
                    id_petugas: null,
                    id_role:
                        role.id_role,
                    username:
                        SUPER_ADMIN_USERNAME,
                    password,
                    email: null,
                    is_active: "Y",
                    created_by: null,
                    updated_by: null,
                },
                {
                    transaction,
                }
            );
        }

        await transaction.commit();

        return {
            id_user: user.id_user,
            username: user.username,
            id_role: role.id_role,
            kode_role:
                role.kode_role,
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function run() {
    try {
        await sequelize.authenticate();
        const user =
            await seedSuperAdmin();

        console.log(
            `Super Admin siap digunakan: ${user.username}`
        );
    } catch (error) {
        console.error(
            "Seeder Super Admin gagal:",
            error.message
        );
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

if (require.main === module) {
    run();
}

module.exports =
    seedSuperAdmin;

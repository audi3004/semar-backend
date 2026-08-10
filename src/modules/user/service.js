const bcrypt = require("bcrypt");

const userRepository = require("./repository");
const roleRepository = require(
    "../role/repository"
);
const pegawaiRepository = require(
    "../pegawai/repository"
);
const petugasRepository = require(
    "../petugas/repository"
);
const AppError = require(
    "../../utils/appError"
);

class UserService {
    async checkUser(id_user) {
        const user =
            await userRepository.findById(
                id_user
            );

        if (!user) {
            throw new AppError(
                "User tidak ditemukan",
                404
            );
        }

        return user;
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

    async checkPegawai(id_pegawai) {
        if (!id_pegawai) {
            return null;
        }

        const pegawai =
            await pegawaiRepository.findById(
                id_pegawai
            );

        if (!pegawai) {
            throw new AppError(
                "Pegawai tidak ditemukan",
                404
            );
        }

        return pegawai;
    }

    async checkPetugas(id_petugas) {
        if (!id_petugas) {
            return null;
        }

        const petugas =
            await petugasRepository.findById(
                id_petugas
            );

        if (!petugas) {
            throw new AppError(
                "Petugas tidak ditemukan",
                404
            );
        }

        return petugas;
    }

    validateUserOwner(
        id_pegawai,
        id_petugas
    ) {
        if (id_pegawai && id_petugas) {
            throw new AppError(
                "User tidak boleh terhubung ke Pegawai dan Petugas sekaligus",
                400
            );
        }
    }

    async ensureUsernameAvailable(
        username,
        excludeId = null
    ) {
        const exist =
            await userRepository.findByUsername(
                username
            );

        if (
            exist &&
            exist.id_user !== Number(excludeId)
        ) {
            throw new AppError(
                "Username sudah digunakan",
                409
            );
        }
    }

    async ensureEmailAvailable(
        email,
        excludeId = null
    ) {
        if (!email) {
            return;
        }

        const exist =
            await userRepository.findByEmail(
                email
            );

        if (
            exist &&
            exist.id_user !== Number(excludeId)
        ) {
            throw new AppError(
                "Email sudah digunakan",
                409
            );
        }
    }

    async ensurePegawaiAvailable(
        id_pegawai,
        excludeId = null
    ) {
        if (!id_pegawai) {
            return;
        }

        const exist =
            await userRepository.findByPegawai(
                id_pegawai
            );

        if (
            exist &&
            exist.id_user !== Number(excludeId)
        ) {
            throw new AppError(
                "Pegawai sudah memiliki akun user",
                409
            );
        }
    }

    async ensurePetugasAvailable(
        id_petugas,
        excludeId = null
    ) {
        if (!id_petugas) {
            return;
        }

        const exist =
            await userRepository.findByPetugas(
                id_petugas
            );

        if (
            exist &&
            exist.id_user !== Number(excludeId)
        ) {
            throw new AppError(
                "Petugas sudah memiliki akun user",
                409
            );
        }
    }

    async hashPassword(password) {
        const saltRounds = 12;

        return await bcrypt.hash(
            password,
            saltRounds
        );
    }

    async findAll() {
        return await userRepository.findAll();
    }

    async findAllWithInactive() {
        return await userRepository
            .findAllWithInactive();
    }

    async findById(id_user) {
        return await this.checkUser(id_user);
    }

    async findByRole(id_role) {
        await this.checkRole(id_role);

        return await userRepository.findByRole(
            id_role
        );
    }

    async create(data, created_by) {
        this.validateUserOwner(
            data.id_pegawai,
            data.id_petugas
        );

        await this.checkRole(data.id_role);

        await this.checkPegawai(
            data.id_pegawai
        );

        await this.checkPetugas(
            data.id_petugas
        );

        await this.ensureUsernameAvailable(
            data.username
        );

        await this.ensureEmailAvailable(
            data.email
        );

        await this.ensurePegawaiAvailable(
            data.id_pegawai
        );

        await this.ensurePetugasAvailable(
            data.id_petugas
        );

        const hashedPassword =
            await this.hashPassword(
                data.password
            );

        return await userRepository.create(
            {
                ...data,
                username:
                    data.username.toLowerCase(),
                email:
                    data.email?.toLowerCase() ||
                    null,
                password: hashedPassword,
            },
            created_by
        );
    }

    async update(
        id_user,
        data,
        updated_by
    ) {
        const currentUser =
            await this.checkUser(id_user);

        const idPegawai =
            data.id_pegawai !== undefined
                ? data.id_pegawai
                : currentUser.id_pegawai;

        const idPetugas =
            data.id_petugas !== undefined
                ? data.id_petugas
                : currentUser.id_petugas;

        this.validateUserOwner(
            idPegawai,
            idPetugas
        );

        if (data.id_role) {
            await this.checkRole(
                data.id_role
            );
        }

        if (data.id_pegawai) {
            await this.checkPegawai(
                data.id_pegawai
            );

            await this.ensurePegawaiAvailable(
                data.id_pegawai,
                id_user
            );
        }

        if (data.id_petugas) {
            await this.checkPetugas(
                data.id_petugas
            );

            await this.ensurePetugasAvailable(
                data.id_petugas,
                id_user
            );
        }

        if (data.username) {
            await this.ensureUsernameAvailable(
                data.username,
                id_user
            );

            data.username =
                data.username.toLowerCase();
        }

        if (data.email) {
            await this.ensureEmailAvailable(
                data.email,
                id_user
            );

            data.email =
                data.email.toLowerCase();
        }

        delete data.password;

        return await userRepository.update(
            id_user,
            data,
            updated_by
        );
    }

    async changePassword(
        id_user,
        data,
        requester
    ) {
        if (Number(id_user) !== Number(requester?.id_user)) {
            throw new AppError("User hanya dapat mengubah password akunnya sendiri", 403);
        }
        const currentUser =
            await userRepository
                .findByIdWithPassword(id_user);

        if (!currentUser) {
            throw new AppError(
                "User tidak ditemukan",
                404
            );
        }

        const passwordValid = await bcrypt.compare(data.old_password, currentUser.password);
        if (!passwordValid) {
            throw new AppError("Password lama tidak sesuai", 400);
        }

        const samePassword =
            await bcrypt.compare(
                data.new_password,
                currentUser.password
            );

        if (samePassword) {
            throw new AppError(
                "Password baru tidak boleh sama dengan password lama",
                400
            );
        }

        const hashedPassword =
            await this.hashPassword(
                data.new_password
            );

        await userRepository.updatePassword(
            id_user,
            hashedPassword,
            requester.id_user
        );

        return true;
    }

    async resetPassword(id_user, data, requester) {
        const roleCode = String(requester?.kode_role || "").toUpperCase();
        const isAdministrator = requester?.is_super_admin === "Y" || ["ADMIN", "SUPER_ADMIN"].includes(roleCode);
        if (!isAdministrator) {
            throw new AppError("Hanya Administrator atau Super Admin yang dapat mereset password user", 403);
        }
        await this.checkUser(id_user);
        const hashedPassword = await this.hashPassword(data.new_password);
        await userRepository.updatePassword(id_user, hashedPassword, requester.id_user);
        return true;
    }

    async activate(id_user, updated_by) {
        await this.checkUser(id_user);

        return await userRepository.activate(
            id_user,
            updated_by
        );
    }

    async deactivate(
        id_user,
        updated_by
    ) {
        await this.checkUser(id_user);

        return await userRepository.deactivate(
            id_user,
            updated_by
        );
    }

    async delete(id_user) {
        await this.checkUser(id_user);

        return await userRepository.delete(
            id_user
        );
    }
}

module.exports = new UserService();

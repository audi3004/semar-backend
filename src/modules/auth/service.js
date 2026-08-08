const bcrypt = require("bcrypt");

const authRepository = require(
    "./repository"
);
const token = require(
    "../../utils/token"
);
const AppError = require(
    "../../utils/appError"
);

class AuthService {
    validateActiveUser(user) {
        if (!user) {
            throw new AppError(
                "Username atau password tidak sesuai",
                401
            );
        }

        if (user.is_active !== "Y") {
            throw new AppError(
                "Akun user sedang tidak aktif",
                403
            );
        }

        if (
            !user.role ||
            user.role.is_active !==
            "Y"
        ) {
            throw new AppError(
                "Role user sedang tidak aktif",
                403
            );
        }
    }

    buildPayload(user) {
        return {
            id_user: user.id_user,
            username: user.username,
            email: user.email,
            id_pegawai:
                user.id_pegawai,
            id_petugas:
                user.id_petugas,
            id_role: user.id_role,
            kode_role:
                user.role.kode_role,
            nama_role:
                user.role.nama_role,
            level_role:
                user.role.level_role,
            is_super_admin:
                user.role
                    .is_super_admin,
        };
    }

    sanitizeUser(user) {
        const result = user.toJSON();

        delete result.password;
        delete result
            .refresh_token_hash;
        delete result
            .refresh_token_expires_at;

        return result;
    }

    async issueTokenPair(user) {
        const payload =
            this.buildPayload(user);
        const accessToken =
            token.signAccessToken(
                payload
            );
        const refreshToken =
            token.signRefreshToken(
                user.id_user
            );
        const refreshPayload =
            token.verifyRefreshToken(
                refreshToken
            );
        const refreshExpiresAt =
            new Date(
                refreshPayload.exp *
                1000
            );

        await authRepository
            .saveRefreshToken(
                user.id_user,
                token.hashToken(
                    refreshToken
                ),
                refreshExpiresAt
            );

        return {
            token_type: "Bearer",
            access_token:
                accessToken,
            access_token_expires_in:
                process.env
                    .JWT_ACCESS_EXPIRES_IN ||
                "15m",
            refresh_token:
                refreshToken,
            refresh_token_expires_at:
                refreshExpiresAt,
            payload,
        };
    }

    async login(data) {
        const username = String(
            data.username
        )
            .trim()
            .toLowerCase();
        const user =
            await authRepository
                .findByUsername(
                    username
                );

        this.validateActiveUser(
            user
        );

        const passwordValid =
            await bcrypt.compare(
                data.password,
                user.password
            );

        if (!passwordValid) {
            throw new AppError(
                "Username atau password tidak sesuai",
                401
            );
        }

        return {
            user: this.sanitizeUser(
                user
            ),
            ...(await this
                .issueTokenPair(user)),
        };
    }

    async refresh(refreshToken) {
        let decoded;

        try {
            decoded =
                token.verifyRefreshToken(
                    refreshToken
                );
        } catch (error) {
            throw new AppError(
                "Refresh token tidak valid atau sudah kedaluwarsa",
                401
            );
        }

        if (
            decoded.token_type !==
            "refresh"
        ) {
            throw new AppError(
                "Tipe token tidak valid",
                401
            );
        }

        const user =
            await authRepository
                .findById(
                    decoded.id_user
                );

        this.validateActiveUser(
            user
        );

        if (
            !user.refresh_token_hash ||
            !user
                .refresh_token_expires_at ||
            new Date(
                user
                    .refresh_token_expires_at
            ) <= new Date() ||
            !token.tokenMatches(
                refreshToken,
                user.refresh_token_hash
            )
        ) {
            throw new AppError(
                "Refresh token sudah tidak berlaku",
                401
            );
        }

        return {
            user: this.sanitizeUser(
                user
            ),
            ...(await this
                .issueTokenPair(user)),
        };
    }

    async logout(id_user) {
        await authRepository
            .clearRefreshToken(
                id_user
            );

        return true;
    }

    async me(id_user) {
        const user =
            await authRepository
                .findById(id_user);

        this.validateActiveUser(
            user
        );

        return this.sanitizeUser(
            user
        );
    }
}

module.exports =
    new AuthService();

const {
    User,
    Role,
} = require("../models");
const token = require(
    "../utils/token"
);
const response = require(
    "../utils/response"
);

async function authenticate(
    req,
    res,
    next
) {
    const authorization =
        req.headers.authorization;

    if (!authorization) {
        return response.unauthorized(
            res,
            "Access token wajib disertakan"
        );
    }

    const [scheme, accessToken] =
        authorization.split(" ");

    if (
        scheme?.toLowerCase() !==
        "bearer" ||
        !accessToken
    ) {
        return response.unauthorized(
            res,
            "Format Authorization harus Bearer token"
        );
    }

    try {
        const payload =
            token.verifyAccessToken(
                accessToken
            );

        if (
            payload.token_type !==
            "access"
        ) {
            return response.unauthorized(
                res,
                "Tipe token tidak valid"
            );
        }

        const user =
            await User.findByPk(
                payload.id_user,
                {
                    attributes: {
                        exclude: [
                            "password",
                            "refresh_token_hash",
                            "refresh_token_expires_at",
                        ],
                    },
                    include: [
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
                    ],
                }
            );

        if (
            !user ||
            user.is_active !== "Y"
        ) {
            return response.unauthorized(
                res,
                "Akun user tidak ditemukan atau tidak aktif"
            );
        }

        if (
            user.role.is_active !==
            "Y"
        ) {
            return response.forbidden(
                res,
                "Role user sedang tidak aktif"
            );
        }

        req.auth = payload;
        req.user = {
            ...user.toJSON(),
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

        return next();
    } catch (error) {
        if (
            error.name ===
            "TokenExpiredError"
        ) {
            return response.unauthorized(
                res,
                "Access token sudah kedaluwarsa"
            );
        }

        return response.unauthorized(
            res,
            "Access token tidak valid"
        );
    }
}

module.exports = authenticate;

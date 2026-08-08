const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const authConfig = require(
    "../config/auth"
);

function signAccessToken(payload) {
    return jwt.sign(
        {
            ...payload,
            token_type: "access",
        },
        authConfig.accessTokenSecret,
        {
            expiresIn:
                authConfig
                    .accessTokenExpiresIn,
            issuer: authConfig.issuer,
            audience:
                authConfig.audience,
            subject: String(
                payload.id_user
            ),
        }
    );
}

function signRefreshToken(
    id_user
) {
    return jwt.sign(
        {
            id_user,
            token_type: "refresh",
            jti: crypto.randomUUID(),
        },
        authConfig.refreshTokenSecret,
        {
            expiresIn:
                authConfig
                    .refreshTokenExpiresIn,
            issuer: authConfig.issuer,
            audience:
                authConfig.audience,
            subject: String(id_user),
        }
    );
}

function verifyAccessToken(token) {
    return jwt.verify(
        token,
        authConfig.accessTokenSecret,
        {
            issuer: authConfig.issuer,
            audience:
                authConfig.audience,
        }
    );
}

function verifyRefreshToken(token) {
    return jwt.verify(
        token,
        authConfig.refreshTokenSecret,
        {
            issuer: authConfig.issuer,
            audience:
                authConfig.audience,
        }
    );
}

function hashToken(token) {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}

function tokenMatches(
    plainToken,
    storedHash
) {
    if (
        !plainToken ||
        !storedHash
    ) {
        return false;
    }

    const tokenHash = Buffer.from(
        hashToken(plainToken),
        "utf8"
    );
    const expectedHash = Buffer.from(
        storedHash,
        "utf8"
    );

    return (
        tokenHash.length ===
        expectedHash.length &&
        crypto.timingSafeEqual(
            tokenHash,
            expectedHash
        )
    );
}

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    hashToken,
    tokenMatches,
};

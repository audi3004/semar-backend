const accessTokenSecret =
    process.env.JWT_ACCESS_SECRET ||
    process.env.JWT_SECRET;

const refreshTokenSecret =
    process.env.JWT_REFRESH_SECRET ||
    (
        process.env.JWT_SECRET
            ? `${process.env.JWT_SECRET}:refresh`
            : null
    );

if (
    !accessTokenSecret ||
    !refreshTokenSecret
) {
    throw new Error(
        "JWT_ACCESS_SECRET/JWT_REFRESH_SECRET atau JWT_SECRET wajib dikonfigurasi"
    );
}

module.exports = {
    accessTokenSecret,
    refreshTokenSecret,
    accessTokenExpiresIn:
        process.env
            .JWT_ACCESS_EXPIRES_IN ||
        "15m",
    refreshTokenExpiresIn:
        process.env
            .JWT_REFRESH_EXPIRES_IN ||
        "7d",
    issuer:
        process.env.JWT_ISSUER ||
        process.env.APP_NAME ||
        "workforce-management-backend",
    audience:
        process.env.JWT_AUDIENCE ||
        "workforce-management-client",
};

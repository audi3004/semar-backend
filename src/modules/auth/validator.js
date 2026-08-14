const Joi = require("joi");

const login = Joi.object({
    username: Joi.string()
        .trim()
        .lowercase()
        .min(4)
        .max(50)
        .required()
        .messages({
            "string.empty":
                "Username wajib diisi",
            "string.min":
                "Username minimal 4 karakter",
            "string.max":
                "Username maksimal 50 karakter",
            "any.required":
                "Username wajib diisi",
        }),
    password: Joi.string()
        .min(8)
        .max(100)
        .required()
        .messages({
            "string.empty":
                "Password wajib diisi",
            "string.min":
                "Password minimal 8 karakter",
            "string.max":
                "Password maksimal 100 karakter",
            "any.required":
                "Password wajib diisi",
        }),
});

const refresh = Joi.object({
    refresh_token: Joi.string()
        .trim()
        .optional()
        .messages({
            "string.empty":
                "Refresh token wajib diisi",
            "any.required":
                "Refresh token wajib diisi",
        }),
});

module.exports = {
    login,
    refresh,
};

const Joi = require("joi");

const create = Joi.object({
    id_pegawai: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .optional()
        .messages({
            "number.base":
                "Pegawai harus berupa angka",
            "number.integer":
                "Pegawai harus berupa bilangan bulat",
            "number.positive":
                "Pegawai tidak valid",
        }),

    id_petugas: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .optional()
        .messages({
            "number.base":
                "Petugas harus berupa angka",
            "number.integer":
                "Petugas harus berupa bilangan bulat",
            "number.positive":
                "Petugas tidak valid",
        }),

    id_role: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base":
                "Role harus berupa angka",
            "number.integer":
                "Role harus berupa bilangan bulat",
            "number.positive":
                "Role tidak valid",
            "any.required":
                "Role wajib dipilih",
        }),

    username: Joi.string()
        .trim()
        .lowercase()
        .alphanum()
        .min(4)
        .max(50)
        .required()
        .messages({
            "string.empty":
                "Username wajib diisi",
            "string.alphanum":
                "Username hanya boleh berisi huruf dan angka",
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
        .pattern(/[A-Z]/)
        .pattern(/[a-z]/)
        .pattern(/[0-9]/)
        .required()
        .messages({
            "string.empty":
                "Password wajib diisi",
            "string.min":
                "Password minimal 8 karakter",
            "string.max":
                "Password maksimal 100 karakter",
            "string.pattern.base":
                "Password harus mengandung huruf besar, huruf kecil, dan angka",
            "any.required":
                "Password wajib diisi",
        }),

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .max(100)
        .allow(null, "")
        .optional()
        .messages({
            "string.email":
                "Format email tidak valid",
            "string.max":
                "Email maksimal 100 karakter",
        }),
});

const update = Joi.object({
    id_pegawai: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            "number.base":
                "Pegawai harus berupa angka",
            "number.integer":
                "Pegawai harus berupa bilangan bulat",
            "number.positive":
                "Pegawai tidak valid",
        }),

    id_petugas: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            "number.base":
                "Petugas harus berupa angka",
            "number.integer":
                "Petugas harus berupa bilangan bulat",
            "number.positive":
                "Petugas tidak valid",
        }),

    id_role: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base":
                "Role harus berupa angka",
            "number.integer":
                "Role harus berupa bilangan bulat",
            "number.positive":
                "Role tidak valid",
        }),

    username: Joi.string()
        .trim()
        .lowercase()
        .alphanum()
        .min(4)
        .max(50)
        .messages({
            "string.empty":
                "Username tidak boleh kosong",
            "string.alphanum":
                "Username hanya boleh berisi huruf dan angka",
            "string.min":
                "Username minimal 4 karakter",
            "string.max":
                "Username maksimal 50 karakter",
        }),

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .max(100)
        .allow(null, "")
        .messages({
            "string.email":
                "Format email tidak valid",
            "string.max":
                "Email maksimal 100 karakter",
        }),

    is_active: Joi.string()
        .valid("Y", "N")
        .messages({
            "any.only":
                "Status aktif harus bernilai Y atau N",
        }),
})
    .min(1)
    .messages({
        "object.min":
            "Minimal satu field harus diisi",
    });

const changePassword = Joi.object({
    old_password: Joi.string()
        .min(8)
        .required()
        .messages({
            "string.min":
                "Password lama minimal 8 karakter",
        }),

    new_password: Joi.string()
        .min(8)
        .max(100)
        .pattern(/[A-Z]/)
        .pattern(/[a-z]/)
        .pattern(/[0-9]/)
        .required()
        .messages({
            "string.empty":
                "Password baru wajib diisi",
            "string.min":
                "Password baru minimal 8 karakter",
            "string.max":
                "Password baru maksimal 100 karakter",
            "string.pattern.base":
                "Password baru harus mengandung huruf besar, huruf kecil, dan angka",
            "any.required":
                "Password baru wajib diisi",
        }),

    confirm_password: Joi.string()
        .valid(Joi.ref("new_password"))
        .required()
        .messages({
            "any.only":
                "Konfirmasi password tidak sama",
            "any.required":
                "Konfirmasi password wajib diisi",
        }),
});

const resetPassword = Joi.object({
    new_password: Joi.string()
        .min(8)
        .max(100)
        .required()
        .messages({
            "string.min": "Password reset minimal 8 karakter",
            "string.max": "Password reset maksimal 100 karakter",
            "any.required": "Password reset wajib diisi",
        }),
    confirm_password: Joi.string()
        .valid(Joi.ref("new_password"))
        .required()
        .messages({
            "any.only": "Konfirmasi password tidak sama",
            "any.required": "Konfirmasi password wajib diisi",
        }),
});

module.exports = {
    create,
    update,
    changePassword,
    resetPassword,
};

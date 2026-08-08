const Joi = require(
    "joi"
);

const params = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base":
                "ID role harus berupa angka",

            "number.integer":
                "ID role harus berupa bilangan bulat",

            "number.positive":
                "ID role harus lebih besar dari 0",

            "any.required":
                "ID role wajib diisi",
        }),
});

const create = Joi.object({
    kode_role: Joi.string()
        .trim()
        .uppercase()
        .max(50)
        .pattern(
            /^[A-Z0-9_]+$/
        )
        .required()
        .messages({
            "string.base":
                "Kode role harus berupa teks",

            "string.empty":
                "Kode role wajib diisi",

            "string.max":
                "Kode role maksimal 50 karakter",

            "string.pattern.base":
                "Kode role hanya boleh mengandung huruf kapital, angka, dan underscore",

            "any.required":
                "Kode role wajib diisi",
        }),

    nama_role: Joi.string()
        .trim()
        .max(100)
        .required()
        .messages({
            "string.base":
                "Nama role harus berupa teks",

            "string.empty":
                "Nama role wajib diisi",

            "string.max":
                "Nama role maksimal 100 karakter",

            "any.required":
                "Nama role wajib diisi",
        }),

    level_role: Joi.number()
        .integer()
        .min(0)
        .max(9999)
        .required()
        .messages({
            "number.base":
                "Level role harus berupa angka",

            "number.integer":
                "Level role harus berupa bilangan bulat",

            "number.min":
                "Level role minimal 0",

            "number.max":
                "Level role maksimal 9999",

            "any.required":
                "Level role wajib diisi",
        }),

    is_super_admin:
        Joi.string()
            .trim()
            .uppercase()
            .valid(
                "Y",
                "N"
            )
            .default("N")
            .messages({
                "any.only":
                    "Status Super Admin harus Y atau N",
            }),

    is_active: Joi.string()
        .trim()
        .uppercase()
        .valid(
            "Y",
            "N"
        )
        .default("Y")
        .messages({
            "any.only":
                "Status aktif harus Y atau N",
        }),
});

const update = Joi.object({
    kode_role: Joi.string()
        .trim()
        .uppercase()
        .max(50)
        .pattern(
            /^[A-Z0-9_]+$/
        )
        .optional()
        .messages({
            "string.base":
                "Kode role harus berupa teks",

            "string.empty":
                "Kode role tidak boleh kosong",

            "string.max":
                "Kode role maksimal 50 karakter",

            "string.pattern.base":
                "Kode role hanya boleh mengandung huruf kapital, angka, dan underscore",
        }),

    nama_role: Joi.string()
        .trim()
        .max(100)
        .optional()
        .messages({
            "string.base":
                "Nama role harus berupa teks",

            "string.empty":
                "Nama role tidak boleh kosong",

            "string.max":
                "Nama role maksimal 100 karakter",
        }),

    level_role: Joi.number()
        .integer()
        .min(0)
        .max(9999)
        .optional()
        .messages({
            "number.base":
                "Level role harus berupa angka",

            "number.integer":
                "Level role harus berupa bilangan bulat",

            "number.min":
                "Level role minimal 0",

            "number.max":
                "Level role maksimal 9999",
        }),

    is_super_admin:
        Joi.string()
            .trim()
            .uppercase()
            .valid(
                "Y",
                "N"
            )
            .optional()
            .messages({
                "any.only":
                    "Status Super Admin harus Y atau N",
            }),

    is_active: Joi.string()
        .trim()
        .uppercase()
        .valid(
            "Y",
            "N"
        )
        .optional()
        .messages({
            "any.only":
                "Status aktif harus Y atau N",
        }),
})
    .min(1)
    .messages({
        "object.min":
            "Minimal satu data harus diisi untuk diperbarui",
    });

const query = Joi.object({
    kode_role: Joi.string()
        .trim()
        .max(50)
        .optional()
        .messages({
            "string.base":
                "Kode role harus berupa teks",

            "string.max":
                "Kode role maksimal 50 karakter",
        }),

    nama_role: Joi.string()
        .trim()
        .max(100)
        .optional()
        .messages({
            "string.base":
                "Nama role harus berupa teks",

            "string.max":
                "Nama role maksimal 100 karakter",
        }),

    level_role: Joi.number()
        .integer()
        .min(0)
        .max(9999)
        .optional()
        .messages({
            "number.base":
                "Level role harus berupa angka",

            "number.integer":
                "Level role harus berupa bilangan bulat",

            "number.min":
                "Level role minimal 0",

            "number.max":
                "Level role maksimal 9999",
        }),

    is_super_admin:
        Joi.string()
            .trim()
            .uppercase()
            .valid(
                "Y",
                "N"
            )
            .optional()
            .messages({
                "any.only":
                    "Status Super Admin harus Y atau N",
            }),

    is_active: Joi.string()
        .trim()
        .uppercase()
        .valid(
            "Y",
            "N"
        )
        .optional()
        .messages({
            "any.only":
                "Status aktif harus Y atau N",
        }),
});

module.exports = {
    params,
    create,
    update,
    query,
};
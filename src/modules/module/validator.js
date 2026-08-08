const Joi = require("joi");

const create = Joi.object({
    kode_module: Joi.string()
        .trim()
        .uppercase()
        .max(50)
        .pattern(/^[A-Z0-9_]+$/)
        .required()
        .messages({
            "string.base":
                "Kode module harus berupa teks",
            "string.empty":
                "Kode module wajib diisi",
            "string.max":
                "Kode module maksimal 50 karakter",
            "string.pattern.base":
                "Kode module hanya boleh berisi huruf, angka, dan underscore",
            "any.required":
                "Kode module wajib diisi",
        }),

    nama_module: Joi.string()
        .trim()
        .max(100)
        .required()
        .messages({
            "string.base":
                "Nama module harus berupa teks",
            "string.empty":
                "Nama module wajib diisi",
            "string.max":
                "Nama module maksimal 100 karakter",
            "any.required":
                "Nama module wajib diisi",
        }),

    deskripsi: Joi.string()
        .trim()
        .max(255)
        .allow(null, "")
        .optional()
        .messages({
            "string.base":
                "Deskripsi harus berupa teks",
            "string.max":
                "Deskripsi maksimal 255 karakter",
        }),
});

const update = Joi.object({
    kode_module: Joi.string()
        .trim()
        .uppercase()
        .max(50)
        .pattern(/^[A-Z0-9_]+$/)
        .messages({
            "string.empty":
                "Kode module tidak boleh kosong",
            "string.max":
                "Kode module maksimal 50 karakter",
            "string.pattern.base":
                "Kode module hanya boleh berisi huruf, angka, dan underscore",
        }),

    nama_module: Joi.string()
        .trim()
        .max(100)
        .messages({
            "string.empty":
                "Nama module tidak boleh kosong",
            "string.max":
                "Nama module maksimal 100 karakter",
        }),

    deskripsi: Joi.string()
        .trim()
        .max(255)
        .allow(null, "")
        .messages({
            "string.base":
                "Deskripsi harus berupa teks",
            "string.max":
                "Deskripsi maksimal 255 karakter",
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

module.exports = {
    create,
    update,
};
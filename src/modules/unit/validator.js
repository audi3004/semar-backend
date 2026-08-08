const Joi = require("joi");

const create = Joi.object({
    id_induk_unit: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .optional()
        .messages({
            "number.base":
                "Induk unit harus berupa angka",
            "number.integer":
                "Induk unit harus berupa bilangan bulat",
            "number.positive":
                "Induk unit tidak valid",
        }),

    nama_unit: Joi.string()
        .trim()
        .max(100)
        .required()
        .messages({
            "string.base":
                "Nama unit harus berupa teks",
            "string.empty":
                "Nama unit wajib diisi",
            "string.max":
                "Nama unit maksimal 100 karakter",
            "any.required":
                "Nama unit wajib diisi",
        }),
});

const update = Joi.object({
    id_induk_unit: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            "number.base":
                "Induk unit harus berupa angka",
            "number.integer":
                "Induk unit harus berupa bilangan bulat",
            "number.positive":
                "Induk unit tidak valid",
        }),

    nama_unit: Joi.string()
        .trim()
        .max(100)
        .messages({
            "string.base":
                "Nama unit harus berupa teks",
            "string.empty":
                "Nama unit tidak boleh kosong",
            "string.max":
                "Nama unit maksimal 100 karakter",
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

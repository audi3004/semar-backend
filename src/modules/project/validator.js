const Joi = require("joi");

const create = Joi.object({
    nama_project: Joi.string()
        .trim()
        .max(100)
        .required()
        .messages({
            "string.base":
                "Nama project harus berupa teks",
            "string.empty":
                "Nama project wajib diisi",
            "string.max":
                "Nama project maksimal 100 karakter",
            "any.required":
                "Nama project wajib diisi",
        }),
});

const update = Joi.object({
    nama_project: Joi.string()
        .trim()
        .max(100)
        .messages({
            "string.base":
                "Nama project harus berupa teks",
            "string.empty":
                "Nama project tidak boleh kosong",
            "string.max":
                "Nama project maksimal 100 karakter",
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
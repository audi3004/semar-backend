const Joi = require("joi");

const create = Joi.object({
    id_project: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base":
                "Project harus berupa angka",
            "number.integer":
                "Project harus berupa bilangan bulat",
            "number.positive":
                "Project tidak valid",
            "any.required":
                "Project wajib dipilih",
        }),

    nama_jabatan: Joi.string()
        .trim()
        .max(100)
        .required()
        .messages({
            "string.base":
                "Nama jabatan harus berupa teks",
            "string.empty":
                "Nama jabatan wajib diisi",
            "string.max":
                "Nama jabatan maksimal 100 karakter",
            "any.required":
                "Nama jabatan wajib diisi",
        }),

    keterangan: Joi.string()
        .trim()
        .max(255)
        .allow("", null)
        .optional()
        .messages({
            "string.base":
                "Keterangan harus berupa teks",
            "string.max":
                "Keterangan maksimal 255 karakter",
        }),
});

const update = Joi.object({
    id_project: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base":
                "Project harus berupa angka",
            "number.integer":
                "Project harus berupa bilangan bulat",
            "number.positive":
                "Project tidak valid",
        }),

    nama_jabatan: Joi.string()
        .trim()
        .max(100)
        .messages({
            "string.base":
                "Nama jabatan harus berupa teks",
            "string.empty":
                "Nama jabatan tidak boleh kosong",
            "string.max":
                "Nama jabatan maksimal 100 karakter",
        }),

    keterangan: Joi.string()
        .trim()
        .max(255)
        .allow("", null)
        .messages({
            "string.base":
                "Keterangan harus berupa teks",
            "string.max":
                "Keterangan maksimal 255 karakter",
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
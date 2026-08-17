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

    lat: Joi.number().min(-90).max(90).precision(7).allow(null).optional().messages({
        "number.base": "Latitude harus berupa angka",
        "number.min": "Latitude minimal -90",
        "number.max": "Latitude maksimal 90",
    }),

    lon: Joi.number().min(-180).max(180).precision(7).allow(null).optional().messages({
        "number.base": "Longitude harus berupa angka",
        "number.min": "Longitude minimal -180",
        "number.max": "Longitude maksimal 180",
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

    lat: Joi.number().min(-90).max(90).precision(7).allow(null).messages({
        "number.base": "Latitude harus berupa angka",
        "number.min": "Latitude minimal -90",
        "number.max": "Latitude maksimal 90",
    }),

    lon: Joi.number().min(-180).max(180).precision(7).allow(null).messages({
        "number.base": "Longitude harus berupa angka",
        "number.min": "Longitude minimal -180",
        "number.max": "Longitude maksimal 180",
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

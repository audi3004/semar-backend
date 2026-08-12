const Joi = require("joi");

const create = Joi.object({
    id_jabatan: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base":
                "Jabatan harus berupa angka",
            "number.integer":
                "Jabatan harus berupa bilangan bulat",
            "number.positive":
                "Jabatan tidak valid",
            "any.required":
                "Jabatan wajib dipilih",
        }),

    id_unit: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base":
                "Unit harus berupa angka",
            "number.integer":
                "Unit harus berupa bilangan bulat",
            "number.positive":
                "Unit tidak valid",
            "any.required":
                "Unit wajib dipilih",
        }),

    nip: Joi.string()
        .trim()
        .max(12)
        .required()
        .messages({
            "string.base":
                "NIP harus berupa teks",
            "string.empty":
                "NIP wajib diisi",
            "string.max":
                "NIP maksimal 12 karakter",
            "any.required":
                "NIP wajib diisi",
        }),

    nama: Joi.string()
        .trim()
        .max(100)
        .required()
        .messages({
            "string.base":
                "Nama pegawai harus berupa teks",
            "string.empty":
                "Nama pegawai wajib diisi",
            "string.max":
                "Nama pegawai maksimal 100 karakter",
            "any.required":
                "Nama pegawai wajib diisi",
        }),

    tgl_masuk: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base":
                "Tanggal masuk tidak valid",
            "date.format":
                "Format tanggal masuk harus YYYY-MM-DD",
            "any.required":
                "Tanggal masuk wajib diisi",
        }),

    tgl_lahir: Joi.date()
        .iso()
        .allow(null)
        .optional()
        .messages({
            "date.base":
                "Tanggal lahir tidak valid",
            "date.format":
                "Format tanggal lahir harus YYYY-MM-DD",
        }),
});

const update = Joi.object({
    id_jabatan: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base":
                "Jabatan harus berupa angka",
            "number.integer":
                "Jabatan harus berupa bilangan bulat",
            "number.positive":
                "Jabatan tidak valid",
        }),

    id_unit: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base":
                "Unit harus berupa angka",
            "number.integer":
                "Unit harus berupa bilangan bulat",
            "number.positive":
                "Unit tidak valid",
        }),

    nip: Joi.string()
        .trim()
        .max(12)
        .messages({
            "string.base":
                "NIP harus berupa teks",
            "string.empty":
                "NIP tidak boleh kosong",
            "string.max":
                "NIP maksimal 12 karakter",
        }),

    nama: Joi.string()
        .trim()
        .max(100)
        .messages({
            "string.base":
                "Nama pegawai harus berupa teks",
            "string.empty":
                "Nama pegawai tidak boleh kosong",
            "string.max":
                "Nama pegawai maksimal 100 karakter",
        }),

    tgl_masuk: Joi.date()
        .iso()
        .messages({
            "date.base":
                "Tanggal masuk tidak valid",
            "date.format":
                "Format tanggal masuk harus YYYY-MM-DD",
        }),

    tgl_lahir: Joi.date()
        .iso()
        .allow(null)
        .optional()
        .messages({
            "date.base":
                "Tanggal lahir tidak valid",
            "date.format":
                "Format tanggal lahir harus YYYY-MM-DD",
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
    syncProjects: Joi.object({
        project_ids: Joi.array().items(Joi.number().integer().positive()).unique().required(),
    }),
};

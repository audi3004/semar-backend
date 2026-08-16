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
                "ID petugas harus berupa angka",

            "number.integer":
                "ID petugas harus berupa bilangan bulat",

            "number.positive":
                "ID petugas harus lebih besar dari 0",

            "any.required":
                "ID petugas wajib diisi",
        }),
});

const create = Joi.object({
    id_project: Joi.number().integer().positive().required().messages({ "any.required": "Project petugas wajib dipilih" }),
    id_unit: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base":
                "ID unit harus berupa angka",

            "number.integer":
                "ID unit harus berupa bilangan bulat",

            "number.positive":
                "ID unit harus lebih besar dari 0",

            "any.required":
                "ID unit wajib diisi",
        }),

    id_jabatan: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .optional()
        .messages({
            "number.base":
                "ID jabatan harus berupa angka",

            "number.integer":
                "ID jabatan harus berupa bilangan bulat",

            "number.positive":
                "ID jabatan harus lebih besar dari 0",
        }),

    id_umk: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .optional()
        .messages({
            "number.base":
                "ID UMK harus berupa angka",

            "number.integer":
                "ID UMK harus berupa bilangan bulat",

            "number.positive":
                "ID UMK harus lebih besar dari 0",

        }),

    nip: Joi.string()
        .trim()
        .max(50)
        .required()
        .messages({
            "string.base":
                "NIP harus berupa teks",

            "string.empty":
                "NIP wajib diisi",

            "string.max":
                "NIP maksimal 50 karakter",

            "any.required":
                "NIP wajib diisi",
        }),

    nama: Joi.string()
        .trim()
        .max(150)
        .required()
        .messages({
            "string.base":
                "Nama petugas harus berupa teks",

            "string.empty":
                "Nama petugas wajib diisi",

            "string.max":
                "Nama petugas maksimal 150 karakter",

            "any.required":
                "Nama petugas wajib diisi",
        }),

    tgl_masuk: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base":
                "Tanggal masuk tidak valid",

            "date.format":
                "Tanggal masuk harus menggunakan format YYYY-MM-DD",

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
                "Tanggal lahir harus menggunakan format YYYY-MM-DD",
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
    id_project: Joi.number().integer().positive().optional(),
    id_unit: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            "number.base":
                "ID unit harus berupa angka",

            "number.integer":
                "ID unit harus berupa bilangan bulat",

            "number.positive":
                "ID unit harus lebih besar dari 0",
        }),

    id_jabatan: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .optional()
        .messages({
            "number.base":
                "ID jabatan harus berupa angka",

            "number.integer":
                "ID jabatan harus berupa bilangan bulat",

            "number.positive":
                "ID jabatan harus lebih besar dari 0",
        }),

    id_umk: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .optional()
        .messages({
            "number.base":
                "ID UMK harus berupa angka",

            "number.integer":
                "ID UMK harus berupa bilangan bulat",

            "number.positive":
                "ID UMK harus lebih besar dari 0",
        }),

    nip: Joi.string()
        .trim()
        .max(50)
        .optional()
        .messages({
            "string.base":
                "NIP harus berupa teks",

            "string.empty":
                "NIP tidak boleh kosong",

            "string.max":
                "NIP maksimal 50 karakter",
        }),

    nama: Joi.string()
        .trim()
        .max(150)
        .optional()
        .messages({
            "string.base":
                "Nama petugas harus berupa teks",

            "string.empty":
                "Nama petugas tidak boleh kosong",

            "string.max":
                "Nama petugas maksimal 150 karakter",
        }),

    tgl_masuk: Joi.date()
        .iso()
        .optional()
        .messages({
            "date.base":
                "Tanggal masuk tidak valid",

            "date.format":
                "Tanggal masuk harus menggunakan format YYYY-MM-DD",
        }),

    tgl_lahir: Joi.date()
        .iso()
        .allow(null)
        .optional()
        .messages({
            "date.base":
                "Tanggal lahir tidak valid",
            "date.format":
                "Tanggal lahir harus menggunakan format YYYY-MM-DD",
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
    id_project: Joi.number().integer().positive().optional(),
    id_unit: Joi.number()
        .integer()
        .positive()
        .optional(),

    id_jabatan: Joi.number()
        .integer()
        .positive()
        .optional(),

    id_umk: Joi.number()
        .integer()
        .positive()
        .optional(),

    nip: Joi.string()
        .trim()
        .max(50)
        .optional(),

    nama: Joi.string()
        .trim()
        .max(150)
        .optional(),

    tgl_masuk: Joi.date()
        .iso()
        .optional(),

    tgl_lahir: Joi.date()
        .iso()
        .optional(),

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

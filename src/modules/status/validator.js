const Joi = require("joi");

const idSchema = (
    fieldName
) =>
    Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base":
                `${fieldName} harus berupa angka`,

            "number.integer":
                `${fieldName} harus berupa bilangan bulat`,

            "number.positive":
                `${fieldName} harus lebih besar dari 0`,
        });

const nullableIdSchema = (
    fieldName
) =>
    Joi.number()
        .integer()
        .positive()
        .allow(
            null,
            ""
        )
        .messages({
            "number.base":
                `${fieldName} harus berupa angka`,

            "number.integer":
                `${fieldName} harus berupa bilangan bulat`,

            "number.positive":
                `${fieldName} harus lebih besar dari 0`,
        });

const flagSchema = (
    fieldName
) =>
    Joi.string()
        .trim()
        .uppercase()
        .valid(
            "Y",
            "N"
        )
        .messages({
            "any.only":
                `${fieldName} harus Y atau N`,
        });

const params = Joi.object({
    id: idSchema(
        "ID status"
    )
        .required()
        .messages({
            "any.required":
                "ID status wajib diisi",
        }),
});

const roleParams = Joi.object({
    id: idSchema(
        "ID role"
    )
        .required()
        .messages({
            "any.required":
                "ID role wajib diisi",
        }),
});

const create = Joi.object({
    id_role: nullableIdSchema(
        "ID role"
    ).optional(),

    kode_status: Joi.string()
        .trim()
        .uppercase()
        .max(100)
        .pattern(
            /^[A-Z0-9_]+$/
        )
        .required()
        .messages({
            "string.base":
                "Kode status harus berupa teks",

            "string.empty":
                "Kode status wajib diisi",

            "string.max":
                "Kode status maksimal 100 karakter",

            "string.pattern.base":
                "Kode status hanya boleh mengandung huruf kapital, angka, dan underscore",

            "any.required":
                "Kode status wajib diisi",
        }),

    nama_status: Joi.string()
        .trim()
        .max(150)
        .required()
        .messages({
            "string.base":
                "Nama status harus berupa teks",

            "string.empty":
                "Nama status wajib diisi",

            "string.max":
                "Nama status maksimal 150 karakter",

            "any.required":
                "Nama status wajib diisi",
        }),

    urutan_status: Joi.number()
        .integer()
        .min(0)
        .max(9999)
        .required()
        .messages({
            "number.base":
                "Urutan status harus berupa angka",

            "number.integer":
                "Urutan status harus berupa bilangan bulat",

            "number.min":
                "Urutan status minimal 0",

            "number.max":
                "Urutan status maksimal 9999",

            "any.required":
                "Urutan status wajib diisi",
        }),

    id_status_next:
        nullableIdSchema(
            "ID status berikutnya"
        ).optional(),

    id_status_revision:
        nullableIdSchema(
            "ID status revisi"
        ).optional(),

    id_status_rejected:
        nullableIdSchema(
            "ID status penolakan"
        ).optional(),

    is_initial:
        flagSchema(
            "Status initial"
        ).default("N"),

    is_final:
        flagSchema(
            "Status final"
        ).default("N"),

    is_active:
        flagSchema(
            "Status aktif"
        ).default("Y"),
});

const update = Joi.object({
    id_role: nullableIdSchema(
        "ID role"
    ).optional(),

    kode_status: Joi.string()
        .trim()
        .uppercase()
        .max(100)
        .pattern(
            /^[A-Z0-9_]+$/
        )
        .optional()
        .messages({
            "string.base":
                "Kode status harus berupa teks",

            "string.empty":
                "Kode status tidak boleh kosong",

            "string.max":
                "Kode status maksimal 100 karakter",

            "string.pattern.base":
                "Kode status hanya boleh mengandung huruf kapital, angka, dan underscore",
        }),

    nama_status: Joi.string()
        .trim()
        .max(150)
        .optional()
        .messages({
            "string.base":
                "Nama status harus berupa teks",

            "string.empty":
                "Nama status tidak boleh kosong",

            "string.max":
                "Nama status maksimal 150 karakter",
        }),

    urutan_status: Joi.number()
        .integer()
        .min(0)
        .max(9999)
        .optional()
        .messages({
            "number.base":
                "Urutan status harus berupa angka",

            "number.integer":
                "Urutan status harus berupa bilangan bulat",

            "number.min":
                "Urutan status minimal 0",

            "number.max":
                "Urutan status maksimal 9999",
        }),

    id_status_next:
        nullableIdSchema(
            "ID status berikutnya"
        ).optional(),

    id_status_revision:
        nullableIdSchema(
            "ID status revisi"
        ).optional(),

    id_status_rejected:
        nullableIdSchema(
            "ID status penolakan"
        ).optional(),

    is_initial:
        flagSchema(
            "Status initial"
        ).optional(),

    is_final:
        flagSchema(
            "Status final"
        ).optional(),

    is_active:
        flagSchema(
            "Status aktif"
        ).optional(),
})
    .min(1)
    .messages({
        "object.min":
            "Minimal satu data harus diisi untuk diperbarui",
    });

const query = Joi.object({
    id_role: idSchema(
        "ID role"
    ).optional(),

    kode_status: Joi.string()
        .trim()
        .max(100)
        .optional()
        .messages({
            "string.base":
                "Kode status harus berupa teks",

            "string.max":
                "Kode status maksimal 100 karakter",
        }),

    nama_status: Joi.string()
        .trim()
        .max(150)
        .optional()
        .messages({
            "string.base":
                "Nama status harus berupa teks",

            "string.max":
                "Nama status maksimal 150 karakter",
        }),

    urutan_status: Joi.number()
        .integer()
        .min(0)
        .max(9999)
        .optional()
        .messages({
            "number.base":
                "Urutan status harus berupa angka",

            "number.integer":
                "Urutan status harus berupa bilangan bulat",
        }),

    is_initial:
        flagSchema(
            "Status initial"
        ).optional(),

    is_final:
        flagSchema(
            "Status final"
        ).optional(),

    is_active:
        flagSchema(
            "Status aktif"
        ).optional(),
});

module.exports = {
    params,
    roleParams,
    create,
    update,
    query,
};
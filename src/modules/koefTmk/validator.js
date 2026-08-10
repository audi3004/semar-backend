const Joi = require("joi");

const params = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base":
                "ID koefisien TMK harus berupa angka",

            "number.integer":
                "ID koefisien TMK harus berupa bilangan bulat",

            "number.positive":
                "ID koefisien TMK harus lebih besar dari 0",

            "any.required":
                "ID koefisien TMK wajib diisi",
        }),
});

const percentage = (
    fieldName
) =>
    Joi.number()
        .precision(4)
        .min(0)
        .max(100)
        .messages({
            "number.base":
                `${fieldName} harus berupa angka`,

            "number.min":
                `${fieldName} minimal 0 persen`,

            "number.max":
                `${fieldName} maksimal 100 persen`,
        });

const create = Joi.object({
    masa_kerja: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            "number.base":
                "Masa kerja harus berupa angka",
            "number.integer":
                "Masa kerja harus berupa tahun penuh",
            "number.min":
                "Masa kerja minimal 0 tahun",

            "any.required":
                "Masa kerja wajib diisi",
        }),

    koef: percentage(
        "Koef"
    ).required(),

    tmk: percentage(
        "TMK"
    ).required(),

    keterangan: Joi.string()
        .trim()
        .max(2000)
        .allow("", null)
        .optional()
        .messages({
            "string.base":
                "Keterangan harus berupa teks",
            "string.max":
                "Keterangan maksimal 2000 karakter",
        }),

    is_active: Joi.string()
        .trim()
        .uppercase()
        .valid("Y", "N")
        .default("Y")
        .messages({
            "any.only":
                "Status aktif harus Y atau N",
        }),
});

const update = Joi.object({
    masa_kerja: Joi.number()
        .integer()
        .min(0)
        .optional()
        .messages({
            "number.base":
                "Masa kerja harus berupa angka",
            "number.integer":
                "Masa kerja harus berupa tahun penuh",
            "number.min":
                "Masa kerja minimal 0 tahun",
        }),

    koef: percentage(
        "Koef"
    ).optional(),

    tmk: percentage(
        "TMK"
    ).optional(),

    keterangan: Joi.string()
        .trim()
        .max(2000)
        .allow("", null)
        .optional()
        .messages({
            "string.base":
                "Keterangan harus berupa teks",
            "string.max":
                "Keterangan maksimal 2000 karakter",
        }),

    is_active: Joi.string()
        .trim()
        .uppercase()
        .valid("Y", "N")
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
    masa_kerja: Joi.number()
        .integer()
        .min(0)
        .optional(),

    koef: percentage(
        "Koef"
    ).optional(),

    tmk: percentage(
        "TMK"
    ).optional(),

    keterangan: Joi.string()
        .trim()
        .max(2000)
        .optional(),

    is_active: Joi.string()
        .trim()
        .uppercase()
        .valid("Y", "N")
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

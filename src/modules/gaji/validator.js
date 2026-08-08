const Joi = require("joi");

const params = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base":
                "ID gaji harus berupa angka",

            "number.integer":
                "ID gaji harus berupa bilangan bulat",

            "number.positive":
                "ID gaji harus lebih besar dari 0",

            "any.required":
                "ID gaji wajib diisi",
        }),
});

const create = Joi.object({
    id_umk: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base":
                "ID UMK harus berupa angka",

            "number.integer":
                "ID UMK harus berupa bilangan bulat",

            "number.positive":
                "ID UMK harus lebih besar dari 0",

            "any.required":
                "ID UMK wajib diisi",
        }),

    id_koef_tmk: Joi.number()
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

    gaji_pokok: Joi.number()
        .precision(2)
        .min(0)
        .required()
        .messages({
            "number.base":
                "Gaji pokok harus berupa angka",

            "number.min":
                "Gaji pokok tidak boleh kurang dari 0",

            "any.required":
                "Gaji pokok wajib diisi",
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
    id_umk: Joi.number()
        .integer()
        .positive()
        .optional(),

    id_koef_tmk: Joi.number()
        .integer()
        .positive()
        .optional(),

    gaji_pokok: Joi.number()
        .precision(2)
        .min(0)
        .optional(),

    is_active: Joi.string()
        .trim()
        .uppercase()
        .valid("Y", "N")
        .optional(),
})
    .min(1)
    .messages({
        "object.min":
            "Minimal satu data harus diisi untuk diperbarui",
    });

const query = Joi.object({
    id_umk: Joi.number()
        .integer()
        .positive()
        .optional(),

    id_koef_tmk: Joi.number()
        .integer()
        .positive()
        .optional(),

    is_active: Joi.string()
        .trim()
        .uppercase()
        .valid("Y", "N")
        .optional(),
});

module.exports = {
    params,
    create,
    update,
    query,
};
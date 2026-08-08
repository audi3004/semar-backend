const Joi = require("joi");

const jenisWilayah =
    Joi.string()
        .trim()
        .uppercase()
        .valid(
            "PROVINSI",
            "KOTA",
            "KABUPATEN"
        );

const params = Joi.object({
    id: Joi.number()
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
});

const query = Joi.object({
    jenis_wilayah:
        jenisWilayah.optional(),

    nama_wilayah: Joi.string()
        .trim()
        .max(100)
        .optional(),

    tahun_umk: Joi.number()
        .integer()
        .min(2000)
        .max(2100)
        .optional(),

    is_active: Joi.string()
        .uppercase()
        .valid("Y", "N")
        .optional(),
});

const create = Joi.object({
    jenis_wilayah:
        jenisWilayah.required(),

    nama_wilayah: Joi.string()
        .trim()
        .max(100)
        .required(),

    tahun_umk: Joi.number()
        .integer()
        .min(2000)
        .max(2100)
        .required(),

    nominal_umk: Joi.number()
        .positive()
        .required(),

    is_active: Joi.string()
        .uppercase()
        .valid("Y", "N")
        .default("Y"),
});

const update = Joi.object({
    jenis_wilayah:
        jenisWilayah.optional(),

    nama_wilayah: Joi.string()
        .trim()
        .max(100)
        .optional(),

    tahun_umk: Joi.number()
        .integer()
        .min(2000)
        .max(2100)
        .optional(),

    nominal_umk: Joi.number()
        .positive()
        .optional(),

    is_active: Joi.string()
        .uppercase()
        .valid("Y", "N")
        .optional(),
}).min(1);

module.exports = {
    params,
    query,
    create,
    update,
};
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

    id_umk_sebelumnya: Joi.number().integer().positive().allow(null).optional(),

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

    id_umk_sebelumnya: Joi.number().integer().positive().allow(null).optional(),

    is_active: Joi.string()
        .uppercase()
        .valid("Y", "N")
        .optional(),
}).min(1);

const rollover = Joi.object({
    tahun_sumber: Joi.number().integer().min(2000).max(2100).required(),
    tahun_tujuan: Joi.number().integer().min(2000).max(2100).required(),
}).custom((value, helpers) => value.tahun_sumber === value.tahun_tujuan
    ? helpers.message({ custom: "Tahun sumber dan tujuan harus berbeda" })
    : value);

module.exports = {
    params,
    query,
    create,
    update,
    rollover,
};

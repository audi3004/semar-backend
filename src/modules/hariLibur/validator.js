const Joi = require("joi");

const id = Joi.number()
    .integer()
    .positive();
const tanggal = Joi.date().iso();
const isActive = Joi.string()
    .trim()
    .uppercase()
    .valid("Y", "N");

const params = Joi.object({
    id: id.required(),
});

const query = Joi.object({
    tahun: Joi.number()
        .integer()
        .min(2000)
        .max(2100)
        .optional(),
    nama_hari_libur: Joi.string()
        .trim()
        .max(150)
        .optional(),
    is_active: isActive.optional(),
});

const create = Joi.object({
    tanggal: tanggal.required(),
    nama_hari_libur: Joi.string()
        .trim()
        .max(150)
        .required(),
    keterangan: Joi.string()
        .trim()
        .max(2000)
        .allow("", null)
        .optional(),
    is_active:
        isActive.default("Y"),
});

const update = Joi.object({
    tanggal: tanggal.optional(),
    nama_hari_libur: Joi.string()
        .trim()
        .max(150)
        .optional(),
    keterangan: Joi.string()
        .trim()
        .max(2000)
        .allow("", null)
        .optional(),
    is_active: isActive.optional(),
}).min(1);

module.exports = {
    params,
    query,
    create,
    update,
};

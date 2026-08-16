const Joi = require("joi");
const id = Joi.number().integer().positive();
const payload = Joi.object({
    id_unit: id.required(), tgl_lembur: Joi.date().iso().raw().required(),
    kategori_lembur: Joi.string().trim().max(1000).required(),
    jenis_pekerjaan: Joi.string().trim().max(1000).required(),
    kode_jenis_pekerjaan: Joi.string().uppercase().valid("REGULAR", "SIAGA_HARI_LIBUR").default("REGULAR"),
    area_group: Joi.string().trim().max(255).allow("", null), detail_pekerjaan: Joi.string().trim().max(5000).allow("", null),
    status_spkl: Joi.string().uppercase().valid("DRAFT", "ACTIVE").default("ACTIVE"),
    id_petugas: Joi.array().items(id).min(1).required(),
});
module.exports = { payload, params: Joi.object({ id: id.required() }), query: Joi.object({ id_unit: id.optional(), tgl_awal: Joi.date().iso().raw(), tgl_akhir: Joi.date().iso().raw(), status_spkl: Joi.string().uppercase().valid("DRAFT", "ACTIVE", "CANCELLED", "COMPLETED") }) };

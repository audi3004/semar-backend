const Joi = require("joi");
const id = Joi.number().integer().positive();
const yn = Joi.string().uppercase().valid("Y", "N");
const category = Joi.object({ kode_kategori: Joi.string().trim().uppercase().max(50).required(), nama_kategori: Joi.string().trim().max(150).required(), jenis_mode: Joi.string().uppercase().valid("NONE", "OPTIONAL", "REQUIRED").required(), urutan: Joi.number().integer().min(0).default(0), is_active: yn.default("Y") });
const type = Joi.object({ id_kategori_lembur: id.required(), kode_jenis: Joi.string().trim().uppercase().max(50).required(), nama_jenis: Joi.string().trim().max(150).required(), kode_perilaku: Joi.string().uppercase().valid("REGULAR", "SIAGA_HARI_LIBUR", "PENGGANTI_KETIDAKHADIRAN").default("REGULAR"), requires_replacement_officer: yn.default("N"), evidence_optional: yn.default("N"), max_daily_hours: Joi.number().integer().min(1).max(24).default(4), urutan: Joi.number().integer().min(0).default(0), is_active: yn.default("Y") });
module.exports = { category, type, params: Joi.object({ id: id.required() }), query: Joi.object({ is_active: yn.optional(), id_kategori_lembur: id.optional() }) };

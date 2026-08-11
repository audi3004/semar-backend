const Joi = require("joi");

const params = Joi.object({ id: Joi.number().integer().positive().required() });
const query = Joi.object({
    tahun: Joi.number().integer().min(2000).max(2100).optional(),
    status: Joi.string().uppercase().valid("DRAFT", "PUBLISHED").optional(),
});
const create = Joi.object({
    tahun: Joi.number().integer().min(2000).max(2100).required(),
    nilai_rata_rata: Joi.number().positive().required(),
    status: Joi.string().uppercase().valid("DRAFT", "PUBLISHED").default("DRAFT"),
});
const update = Joi.object({
    tahun: Joi.number().integer().min(2000).max(2100).optional(),
    nilai_rata_rata: Joi.number().positive().optional(),
    status: Joi.string().uppercase().valid("DRAFT", "PUBLISHED").optional(),
}).min(1);

module.exports = { params, query, create, update };

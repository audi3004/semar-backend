const Joi = require("joi");

const period = {
    year: Joi.number().integer().min(2000).max(2100).required(),
    month: Joi.number().integer().min(1).max(12).required(),
};

module.exports = {
    query: Joi.object({
        ...period,
        type: Joi.string().valid("all", "lembur", "cuti", "ijin", "sakit", "sppd").default("all"),
        id_unit: Joi.number().integer().positive().optional(),
        search: Joi.string().trim().max(150).allow("").optional(),
    }),
    create: Joi.object({ ...period, id_unit: Joi.number().integer().positive().required() }),
    params: Joi.object({ id: Joi.number().integer().positive().required() }),
    sign: Joi.object({ signature: Joi.string().dataUri().max(500000).required() }),
};

const Joi = require("joi");

module.exports = {
    query: Joi.object({
        start_date: Joi.date().iso().optional(),
        end_date: Joi.date().iso().min(Joi.ref("start_date")).optional(),
        type: Joi.string().valid("all", "lembur", "cuti", "ijin", "sakit", "sppd").optional(),
        id_unit: Joi.number().integer().positive().optional(),
        search: Joi.string().trim().max(150).allow("").optional(),
    }),
};

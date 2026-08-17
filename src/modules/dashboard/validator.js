const Joi = require("joi");

module.exports = {
    query: Joi.object({
        start_date: Joi.date().iso().optional(),
        end_date: Joi.date().iso().min(Joi.ref("start_date")).optional(),
        id_project: Joi.number().integer().positive().optional(),
    }),
};

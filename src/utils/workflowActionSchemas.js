const Joi = require("joi");

// All workflow log tables persist keterangan as VARCHAR(500).
const notes = Joi.string().trim().max(500).required().messages({
    "string.empty": "Catatan wajib diisi",
    "string.max": "Catatan maksimal 500 karakter",
    "any.required": "Catatan wajib diisi",
});

module.exports = {
    revision: Joi.object({
        notes,
        target_role: Joi.string().trim().required(),
    }).unknown(false),
    reject: Joi.object({ notes }).unknown(false),
};

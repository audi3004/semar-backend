const Joi = require("joi");

const permissionSchema = Joi.string()
    .valid("Y", "N")
    .messages({
        "any.only":
            "Hak akses harus bernilai Y atau N",
        "string.base":
            "Hak akses harus berupa teks",
    });

const create = Joi.object({
    id_role: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base":
                "Role harus berupa angka",
            "number.integer":
                "Role harus berupa bilangan bulat",
            "number.positive":
                "Role tidak valid",
            "any.required":
                "Role wajib dipilih",
        }),

    id_module: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base":
                "Module harus berupa angka",
            "number.integer":
                "Module harus berupa bilangan bulat",
            "number.positive":
                "Module tidak valid",
            "any.required":
                "Module wajib dipilih",
        }),

    can_create: permissionSchema
        .default("N"),

    can_read: permissionSchema
        .default("N"),

    can_update: permissionSchema
        .default("N"),

    can_delete: permissionSchema
        .default("N"),

    can_approve: permissionSchema
        .default("N"),
});

const update = Joi.object({
    id_role: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base":
                "Role harus berupa angka",
            "number.integer":
                "Role harus berupa bilangan bulat",
            "number.positive":
                "Role tidak valid",
        }),

    id_module: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base":
                "Module harus berupa angka",
            "number.integer":
                "Module harus berupa bilangan bulat",
            "number.positive":
                "Module tidak valid",
        }),

    can_create: permissionSchema,

    can_read: permissionSchema,

    can_update: permissionSchema,

    can_delete: permissionSchema,

    can_approve: permissionSchema,
})
    .min(1)
    .messages({
        "object.min":
            "Minimal satu field harus diisi",
    });

module.exports = {
    create,
    update,
};
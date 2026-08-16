const Joi = require("joi");

const idSchema = (
    fieldName
) =>
    Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base":
                `${fieldName} harus berupa angka`,

            "number.integer":
                `${fieldName} harus berupa bilangan bulat`,

            "number.positive":
                `${fieldName} harus lebih besar dari 0`,
        });

const activeSchema =
    Joi.string()
        .trim()
        .uppercase()
        .valid(
            "Y",
            "N"
        )
        .messages({
            "any.only":
                "Status aktif hanya boleh Y atau N",
        });

const scopeSchema = Joi.string()
    .trim()
    .uppercase()
    .valid("SELF", "SELF_AND_DESCENDANTS")
    .messages({ "any.only": "Cakupan unit tidak valid" });

const params = Joi.object({
    id: idSchema(
        "ID unit role"
    )
        .required()
        .messages({
            "any.required":
                "ID unit role wajib diisi",
        }),
});

const create = Joi.object({
    id_user: idSchema(
        "ID user"
    )
        .required()
        .messages({
            "any.required":
                "ID user wajib diisi",
        }),

    id_unit: idSchema(
        "ID unit"
    )
        .required()
        .messages({
            "any.required":
                "ID unit wajib diisi",
        }),

    id_role: idSchema(
        "ID role"
    )
        .required()
        .messages({
            "any.required":
                "ID role wajib diisi",
        }),

    scope_type: scopeSchema.default("SELF"),

    is_active:
        activeSchema
            .default("Y"),
});

const bulkCreate = Joi.object({
    assignments: Joi.array()
        .items(
            Joi.object({
                id_user: idSchema(
                    "ID user"
                )
                    .required()
                    .messages({
                        "any.required":
                            "ID user wajib diisi",
                    }),

                id_unit: idSchema(
                    "ID unit"
                )
                    .required()
                    .messages({
                        "any.required":
                            "ID unit wajib diisi",
                    }),

                id_role: idSchema(
                    "ID role"
                )
                    .required()
                    .messages({
                        "any.required":
                            "ID role wajib diisi",
                    }),

                scope_type: scopeSchema.default("SELF"),

                is_active:
                    activeSchema
                        .default("Y"),
            })
        )
        .min(1)
        .max(100)
        .required()
        .messages({
            "array.base":
                "Assignments harus berupa array",

            "array.min":
                "Minimal satu unit role harus dikirim",

            "array.max":
                "Maksimal 100 unit role dalam satu request",

            "any.required":
                "Assignments wajib diisi",
        }),
});

const update = Joi.object({
    id_user: idSchema(
        "ID user"
    ).optional(),

    id_unit: idSchema(
        "ID unit"
    ).optional(),

    id_role: idSchema(
        "ID role"
    ).optional(),

    scope_type: scopeSchema.optional(),

    is_active:
        activeSchema.optional(),
})
    .min(1)
    .messages({
        "object.min":
            "Minimal satu data harus diisi untuk diperbarui",
    });

const updateStatus = Joi.object({
    is_active:
        activeSchema
            .required()
            .messages({
                "any.required":
                    "Status aktif wajib diisi",
            }),
});

const query = Joi.object({
    id_user: idSchema(
        "ID user"
    ).optional(),

    id_unit: idSchema(
        "ID unit"
    ).optional(),

    id_role: idSchema(
        "ID role"
    ).optional(),

    nama_user: Joi.string()
        .trim()
        .max(150)
        .optional(),

    username: Joi.string()
        .trim()
        .max(150)
        .optional(),

    nama_unit: Joi.string()
        .trim()
        .max(200)
        .optional(),

    kode_unit: Joi.string()
        .trim()
        .max(100)
        .optional(),

    kode_role: Joi.string()
        .trim()
        .uppercase()
        .valid(
            "CHECKER",
            "VERIFICATION",
            "APPROVAL_1",
            "APPROVAL_2",
            "APPROVAL_3",
            "MONITORING"
        )
        .optional(),

    is_active:
        activeSchema.optional(),
});

const activeQuery = Joi.object({
    is_active:
        activeSchema.optional(),
});

const approverQuery =
    Joi.object({
        id_unit: idSchema(
            "ID unit"
        )
            .required()
            .messages({
                "any.required":
                    "ID unit wajib diisi",
            }),

        id_role: idSchema(
            "ID role"
        )
            .required()
            .messages({
                "any.required":
                    "ID role wajib diisi",
            }),
    });

const authorityQuery =
    Joi.object({
        id_user: idSchema(
            "ID user"
        )
            .required()
            .messages({
                "any.required":
                    "ID user wajib diisi",
            }),

        id_unit: idSchema(
            "ID unit"
        )
            .required()
            .messages({
                "any.required":
                    "ID unit wajib diisi",
            }),

        id_role: idSchema(
            "ID role"
        )
            .required()
            .messages({
                "any.required":
                    "ID role wajib diisi",
            }),
    });

const userParams = Joi.object({
    id: idSchema(
        "ID user"
    )
        .required()
        .messages({
            "any.required":
                "ID user wajib diisi",
        }),
});

const unitParams = Joi.object({
    id: idSchema(
        "ID unit"
    )
        .required()
        .messages({
            "any.required":
                "ID unit wajib diisi",
        }),
});

module.exports = {
    params,
    userParams,
    unitParams,
    create,
    bulkCreate,
    update,
    updateStatus,
    query,
    activeQuery,
    approverQuery,
    authorityQuery,
};

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

const dateSchema = (
    fieldName
) =>
    Joi.date()
        .iso()
        .messages({
            "date.base":
                `${fieldName} tidak valid`,

            "date.format":
                `${fieldName} harus menggunakan format YYYY-MM-DD`,
        });

const signatureSchemas = {
    maker_signature: Joi.string().trim().max(500).allow("", null).optional(),
    checker_signature: Joi.string().trim().max(500).allow("", null).optional(),
    verification_signature: Joi.string().trim().max(500).allow("", null).optional(),
    approval_1_signature: Joi.string().trim().max(500).allow("", null).optional(),
    approval_2_signature: Joi.string().trim().max(500).allow("", null).optional(),
    approval_3_signature: Joi.string().trim().max(500).allow("", null).optional(),
};

const params = Joi.object({
    id: idSchema(
        "ID sakit"
    )
        .required()
        .messages({
            "any.required":
                "ID sakit wajib diisi",
        }),
});

const petugasParams =
    Joi.object({
        id: idSchema(
            "ID petugas"
        )
            .required()
            .messages({
                "any.required":
                    "ID petugas wajib diisi",
            }),
    });

const create = Joi.object({
    id_petugas: idSchema(
        "ID petugas"
    )
        .required()
        .messages({
            "any.required":
                "ID petugas wajib diisi",
        }),

    nomor_dokumen: Joi.string().trim().max(150).allow("", null).optional(),

    agenda: Joi.string()
        .trim()
        .max(500)
        .required()
        .messages({
            "string.base":
                "Agenda harus berupa teks",

            "string.empty":
                "Agenda wajib diisi",

            "string.max":
                "Agenda maksimal 500 karakter",

            "any.required":
                "Agenda wajib diisi",
        }),

    tanggal: dateSchema(
        "Tanggal mulai"
    )
        .required()
        .messages({
            "any.required":
                "Tanggal mulai wajib diisi",
        }),

    tgl_selesai:
        dateSchema(
            "Tanggal selesai"
        )
            .required()
            .messages({
                "any.required":
                    "Tanggal selesai wajib diisi",
            }),

    foto: Joi.string()
        .trim()
        .max(500)
        .allow(
            "",
            null
        )
        .optional()
        .messages({
            "string.base":
                "Foto harus berupa teks atau URL",

            "string.max":
                "Foto maksimal 500 karakter",
        }),

    nama_dokter: Joi.string().trim().max(150).allow("", null).optional(),

    keterangan: Joi.string()
        .trim()
        .max(2000)
        .allow(
            "",
            null
        )
        .optional()
        .messages({
            "string.base":
                "Keterangan harus berupa teks",

            "string.max":
                "Keterangan maksimal 2000 karakter",
        }),

    ...signatureSchemas,
})
    .custom(
        (
            value,
            helpers
        ) => {
            if (
                new Date(
                    value.tanggal
                ) >
                new Date(
                    value.tgl_selesai
                )
            ) {
                return helpers.error(
                    "date.range"
                );
            }

            return value;
        }
    )
    .messages({
        "date.range":
            "Tanggal mulai tidak boleh melebihi tanggal selesai",
    });

const update = Joi.object({
    id_petugas: idSchema(
        "ID petugas"
    ).optional(),

    nomor_dokumen: Joi.string().trim().max(150).optional(),

    agenda: Joi.string()
        .trim()
        .max(500)
        .optional()
        .messages({
            "string.base":
                "Agenda harus berupa teks",

            "string.empty":
                "Agenda tidak boleh kosong",

            "string.max":
                "Agenda maksimal 500 karakter",
        }),

    tanggal: dateSchema(
        "Tanggal mulai"
    ).optional(),

    tgl_selesai:
        dateSchema(
            "Tanggal selesai"
        ).optional(),

    foto: Joi.string()
        .trim()
        .max(500)
        .allow(
            "",
            null
        )
        .optional()
        .messages({
            "string.base":
                "Foto harus berupa teks atau URL",

            "string.max":
                "Foto maksimal 500 karakter",
        }),

    nama_dokter: Joi.string().trim().max(150).allow("", null).optional(),

    keterangan: Joi.string()
        .trim()
        .max(2000)
        .allow(
            "",
            null
        )
        .optional()
        .messages({
            "string.base":
                "Keterangan harus berupa teks",

            "string.max":
                "Keterangan maksimal 2000 karakter",
        }),

    ...signatureSchemas,
})
    .min(1)
    .custom(
        (
            value,
            helpers
        ) => {
            if (
                value.tanggal &&
                value.tgl_selesai &&
                new Date(
                    value.tanggal
                ) >
                new Date(
                    value.tgl_selesai
                )
            ) {
                return helpers.error(
                    "date.range"
                );
            }

            return value;
        }
    )
    .messages({
        "object.min":
            "Minimal satu data harus diisi untuk diperbarui",

        "date.range":
            "Tanggal mulai tidak boleh melebihi tanggal selesai",
    });

const query = Joi.object({
    id_petugas: idSchema(
        "ID petugas"
    ).optional(),

    id_status: idSchema(
        "ID status"
    ).optional(),

    id_role: idSchema(
        "ID role"
    ).optional(),

    agenda: Joi.string()
        .trim()
        .max(500)
        .optional(),

    kode_status: Joi.string()
        .trim()
        .uppercase()
        .max(100)
        .optional(),

    is_final: Joi.string()
        .trim()
        .uppercase()
        .valid(
            "Y",
            "N"
        )
        .optional(),

    tanggal: dateSchema(
        "Tanggal mulai"
    ).optional(),

    tgl_selesai:
        dateSchema(
            "Tanggal selesai"
        ).optional(),

    tgl_mulai_filter:
        dateSchema(
            "Tanggal awal filter"
        ).optional(),

    tgl_akhir_filter:
        dateSchema(
            "Tanggal akhir filter"
        ).optional(),
})
    .custom(
        (
            value,
            helpers
        ) => {
            const hasStart =
                Boolean(
                    value
                        .tgl_mulai_filter
                );

            const hasEnd =
                Boolean(
                    value
                        .tgl_akhir_filter
                );

            if (
                hasStart !== hasEnd
            ) {
                return helpers.error(
                    "date.requiredTogether"
                );
            }

            if (
                hasStart &&
                hasEnd &&
                new Date(
                    value
                        .tgl_mulai_filter
                ) >
                new Date(
                    value
                        .tgl_akhir_filter
                )
            ) {
                return helpers.error(
                    "date.range"
                );
            }

            return value;
        }
    )
    .messages({
        "date.requiredTogether":
            "Tanggal awal dan tanggal akhir filter harus diisi bersamaan",

        "date.range":
            "Tanggal awal filter tidak boleh melebihi tanggal akhir filter",
    });

module.exports = {
    params,
    petugasParams,
    create,
    update,
    query,
    workflow: Joi.object(signatureSchemas),
};

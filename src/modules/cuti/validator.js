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

const nullableTextSchema = (
    fieldName,
    maxLength
) =>
    Joi.string()
        .trim()
        .max(maxLength)
        .allow(
            "",
            null
        )
        .messages({
            "string.base":
                `${fieldName} harus berupa teks`,

            "string.max":
                `${fieldName} maksimal ${maxLength} karakter`,
        });

const signatureSchemas = {
    maker_signature: nullableTextSchema("Signature maker", 500).optional(),
    checker_signature: nullableTextSchema("Signature checker", 500).optional(),
    verification_signature: nullableTextSchema("Signature verification", 500).optional(),
    approval_1_signature: nullableTextSchema("Signature approval 1", 500).optional(),
    approval_2_signature: nullableTextSchema("Signature approval 2", 500).optional(),
    approval_3_signature: nullableTextSchema("Signature approval 3", 500).optional(),
};

const params = Joi.object({
    id: idSchema(
        "ID cuti"
    )
        .required()
        .messages({
            "any.required":
                "ID cuti wajib diisi",
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

    no_cuti: Joi.string()
        .trim()
        .max(100)
        .allow(
            "",
            null
        )
        .optional()
        .messages({
            "string.base":
                "Nomor cuti harus berupa teks",

            "string.max":
                "Nomor cuti maksimal 100 karakter",
        }),

    tgl_pengajuan:
        dateSchema(
            "Tanggal pengajuan"
        )
            .required()
            .messages({
                "any.required":
                    "Tanggal pengajuan wajib diisi",
            }),

    jenis_cuti: Joi.string()
        .trim()
        .max(100)
        .required()
        .messages({
            "string.base":
                "Jenis cuti harus berupa teks",

            "string.empty":
                "Jenis cuti wajib diisi",

            "string.max":
                "Jenis cuti maksimal 100 karakter",

            "any.required":
                "Jenis cuti wajib diisi",
        }),

    perihal: Joi.string()
        .trim()
        .max(500)
        .required()
        .messages({
            "string.base":
                "Perihal harus berupa teks",

            "string.empty":
                "Perihal wajib diisi",

            "string.max":
                "Perihal maksimal 500 karakter",

            "any.required":
                "Perihal wajib diisi",
        }),

    tgl_mulai:
        dateSchema(
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

    contact_alamat:
        nullableTextSchema(
            "Alamat kontak",
            500
        ).optional(),

    nomor_telepon_darurat:
        nullableTextSchema(
            "Nomor telepon darurat",
            30
        ).optional(),

    ...signatureSchemas,
})
    .custom(
        (
            value,
            helpers
        ) => {
            const tglPengajuan =
                new Date(
                    value
                        .tgl_pengajuan
                );

            const tglMulai =
                new Date(
                    value.tgl_mulai
                );

            const tglSelesai =
                new Date(
                    value
                        .tgl_selesai
                );

            if (
                tglMulai >
                tglSelesai
            ) {
                return helpers.error(
                    "date.invalidRange"
                );
            }

            if (
                tglPengajuan >
                tglMulai
            ) {
                return helpers.error(
                    "date.invalidSubmission"
                );
            }

            return value;
        }
    )
    .messages({
        "date.invalidRange":
            "Tanggal mulai tidak boleh melebihi tanggal selesai",

        "date.invalidSubmission":
            "Tanggal pengajuan tidak boleh melebihi tanggal mulai cuti",
    });

const update = Joi.object({
    id_petugas: idSchema(
        "ID petugas"
    ).optional(),

    no_cuti: Joi.string()
        .trim()
        .max(100)
        .optional()
        .messages({
            "string.base":
                "Nomor cuti harus berupa teks",

            "string.empty":
                "Nomor cuti tidak boleh kosong",

            "string.max":
                "Nomor cuti maksimal 100 karakter",
        }),

    tgl_pengajuan:
        dateSchema(
            "Tanggal pengajuan"
        ).optional(),

    jenis_cuti: Joi.string()
        .trim()
        .max(100)
        .optional()
        .messages({
            "string.base":
                "Jenis cuti harus berupa teks",

            "string.empty":
                "Jenis cuti tidak boleh kosong",

            "string.max":
                "Jenis cuti maksimal 100 karakter",
        }),

    perihal: Joi.string()
        .trim()
        .max(500)
        .optional()
        .messages({
            "string.base":
                "Perihal harus berupa teks",

            "string.empty":
                "Perihal tidak boleh kosong",

            "string.max":
                "Perihal maksimal 500 karakter",
        }),

    tgl_mulai:
        dateSchema(
            "Tanggal mulai"
        ).optional(),

    tgl_selesai:
        dateSchema(
            "Tanggal selesai"
        ).optional(),

    contact_alamat:
        nullableTextSchema(
            "Alamat kontak",
            500
        ).optional(),

    nomor_telepon_darurat:
        nullableTextSchema(
            "Nomor telepon darurat",
            30
        ).optional(),

    ...signatureSchemas,
})
    .min(1)
    .custom(
        (
            value,
            helpers
        ) => {
            if (
                value.tgl_mulai &&
                value.tgl_selesai &&
                new Date(
                    value.tgl_mulai
                ) >
                new Date(
                    value
                        .tgl_selesai
                )
            ) {
                return helpers.error(
                    "date.invalidRange"
                );
            }

            if (
                value
                    .tgl_pengajuan &&
                value.tgl_mulai &&
                new Date(
                    value
                        .tgl_pengajuan
                ) >
                new Date(
                    value.tgl_mulai
                )
            ) {
                return helpers.error(
                    "date.invalidSubmission"
                );
            }

            return value;
        }
    )
    .messages({
        "object.min":
            "Minimal satu data harus diisi untuk diperbarui",

        "date.invalidRange":
            "Tanggal mulai tidak boleh melebihi tanggal selesai",

        "date.invalidSubmission":
            "Tanggal pengajuan tidak boleh melebihi tanggal mulai cuti",
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

    no_cuti: Joi.string()
        .trim()
        .max(100)
        .optional(),

    jenis_cuti: Joi.string()
        .trim()
        .max(100)
        .optional(),

    perihal: Joi.string()
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

    tgl_pengajuan:
        dateSchema(
            "Tanggal pengajuan"
        ).optional(),

    tgl_mulai:
        dateSchema(
            "Tanggal mulai"
        ).optional(),

    tgl_selesai:
        dateSchema(
            "Tanggal selesai"
        ).optional(),

    tgl_awal_filter:
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
                        .tgl_awal_filter
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
                        .tgl_awal_filter
                ) >
                new Date(
                    value
                        .tgl_akhir_filter
                )
            ) {
                return helpers.error(
                    "date.invalidRange"
                );
            }

            return value;
        }
    )
    .messages({
        "date.requiredTogether":
            "Tanggal awal dan tanggal akhir filter harus diisi bersamaan",

        "date.invalidRange":
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

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

const moneySchema = (
    fieldName
) =>
    Joi.number()
        .precision(2)
        .min(0)
        .messages({
            "number.base":
                `${fieldName} harus berupa angka`,

            "number.min":
                `${fieldName} tidak boleh kurang dari 0`,
        });

const descriptionSchema = (
    fieldName
) =>
    Joi.string()
        .trim()
        .max(1000)
        .allow(
            "",
            null
        )
        .messages({
            "string.base":
                `${fieldName} harus berupa teks`,

            "string.max":
                `${fieldName} maksimal 1000 karakter`,
        });

const signatureSchemas = {
    maker_signature: Joi.string().trim().max(500).allow("", null).optional(),
    checker_signature: Joi.string().trim().max(500).allow("", null).optional(),
    verification_signature: Joi.string().trim().max(500).allow("", null).optional(),
    approval_1_signature: Joi.string().trim().max(500).allow("", null).optional(),
    approval_2_signature: Joi.string().trim().max(500).allow("", null).optional(),
    approval_3_signature: Joi.string().trim().max(500).allow("", null).optional(),
};

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

const params = Joi.object({
    id: idSchema(
        "ID SPPD"
    )
        .required()
        .messages({
            "any.required":
                "ID SPPD wajib diisi",
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

    no_sppd: Joi.string()
        .trim()
        .max(100)
        .allow(
            "",
            null
        )
        .optional(),

    nomor_dokumen: Joi.string().trim().max(150).allow("", null).optional(),

    kota_asal: Joi.string()
        .trim()
        .max(150)
        .required()
        .messages({
            "string.empty": "Kota asal wajib diisi",
            "any.required": "Kota asal wajib diisi",
        }),

    kota_tujuan: Joi.string()
        .trim()
        .max(150)
        .required()
        .messages({
            "string.empty":
                "Kota tujuan wajib diisi",

            "any.required":
                "Kota tujuan wajib diisi",
        }),

    maksud_dinas: Joi.string()
        .trim()
        .max(2000)
        .required()
        .messages({
            "string.empty":
                "Maksud dinas wajib diisi",

            "any.required":
                "Maksud dinas wajib diisi",
        }),

    tgl_berangkat:
        dateSchema(
            "Tanggal berangkat"
        )
            .required()
            .messages({
                "any.required":
                    "Tanggal berangkat wajib diisi",
            }),

    tgl_kembali:
        dateSchema(
            "Tanggal kembali"
        )
            .required()
            .messages({
                "any.required":
                    "Tanggal kembali wajib diisi",
            }),

    beban_anggaran: Joi.string().trim().max(255).allow("", null).optional(),

    ...signatureSchemas,

    rp_akomodasi:
        moneySchema(
            "Biaya akomodasi"
        ).default(0),

    desc_akomodasi:
        descriptionSchema(
            "Deskripsi akomodasi"
        ).optional(),

    rp_transportasi:
        moneySchema(
            "Biaya transportasi"
        ).default(0),

    desc_transportasi:
        descriptionSchema(
            "Deskripsi transportasi"
        ).optional(),

    rp_lain_lain:
        moneySchema(
            "Biaya lain-lain"
        ).default(0),

    desc_lain_lain:
        descriptionSchema(
            "Deskripsi lain-lain"
        ).optional(),
});

const update = Joi.object({
    id_petugas: idSchema(
        "ID petugas"
    ).optional(),

    no_sppd: Joi.string()
        .trim()
        .max(100)
        .optional(),

    nomor_dokumen: Joi.string().trim().max(150).allow("", null).optional(),

    kota_asal: Joi.string().trim().max(150).optional(),

    kota_tujuan: Joi.string()
        .trim()
        .max(150)
        .optional(),

    maksud_dinas: Joi.string()
        .trim()
        .max(2000)
        .optional(),

    tgl_berangkat:
        dateSchema(
            "Tanggal berangkat"
        ).optional(),

    tgl_kembali:
        dateSchema(
            "Tanggal kembali"
        ).optional(),

    beban_anggaran: Joi.string().trim().max(255).allow("", null).optional(),

    ...signatureSchemas,

    rp_akomodasi:
        moneySchema(
            "Biaya akomodasi"
        ).optional(),

    desc_akomodasi:
        descriptionSchema(
            "Deskripsi akomodasi"
        ).optional(),

    rp_transportasi:
        moneySchema(
            "Biaya transportasi"
        ).optional(),

    desc_transportasi:
        descriptionSchema(
            "Deskripsi transportasi"
        ).optional(),

    rp_lain_lain:
        moneySchema(
            "Biaya lain-lain"
        ).optional(),

    desc_lain_lain:
        descriptionSchema(
            "Deskripsi lain-lain"
        ).optional(),
})
    .min(1)
    .messages({
        "object.min":
            "Minimal satu data harus diisi untuk diperbarui",
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

    kode_status: Joi.string()
        .trim()
        .uppercase()
        .max(100)
        .optional(),

    no_sppd: Joi.string()
        .trim()
        .max(100)
        .optional(),

    nomor_dokumen: Joi.string().trim().max(150).optional(),

    kota_asal: Joi.string().trim().max(150).optional(),

    kota_tujuan: Joi.string()
        .trim()
        .max(150)
        .optional(),

    beban_anggaran: Joi.string().trim().max(255).optional(),

    is_final: Joi.string()
        .trim()
        .uppercase()
        .valid(
            "Y",
            "N"
        )
        .optional(),

    tgl_berangkat:
        dateSchema(
            "Tanggal berangkat"
        ).optional(),

    tgl_kembali:
        dateSchema(
            "Tanggal kembali"
        ).optional(),

    tgl_mulai:
        dateSchema(
            "Tanggal mulai filter"
        ).optional(),

    tgl_selesai:
        dateSchema(
            "Tanggal selesai filter"
        ).optional(),
})
    .custom(
        (
            value,
            helpers
        ) => {
            const hasStart =
                Boolean(
                    value.tgl_mulai
                );

            const hasEnd =
                Boolean(
                    value.tgl_selesai
                );

            if (
                hasStart !== hasEnd
            ) {
                return helpers.error(
                    "date.requiredTogether"
                );
            }

            if (
                value.tgl_mulai &&
                value.tgl_selesai &&
                new Date(
                    value.tgl_mulai
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
        "date.requiredTogether":
            "Tanggal mulai dan tanggal selesai harus diisi bersamaan",

        "date.range":
            "Tanggal mulai tidak boleh melebihi tanggal selesai",
    });

const workflow = Joi.object({
    maker_signature: Joi.string().trim().max(500).optional(),
    checker_signature: Joi.string().trim().max(500).optional(),
    verification_signature: Joi.string().trim().max(500).optional(),
    approval_1_signature: Joi.string().trim().max(500).optional(),
    approval_2_signature: Joi.string().trim().max(500).optional(),
    approval_3_signature: Joi.string().trim().max(500).optional(),
}).unknown(false);

module.exports = {
    params,
    petugasParams,
    create,
    update,
    query,
    workflow,
};

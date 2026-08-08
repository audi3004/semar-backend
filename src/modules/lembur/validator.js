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

const timeSchema = (
    fieldName
) =>
    Joi.string()
        .trim()
        .pattern(
            /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/
        )
        .messages({
            "string.base":
                `${fieldName} harus berupa teks`,

            "string.pattern.base":
                `${fieldName} harus menggunakan format HH:mm atau HH:mm:ss`,
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

const filePathSchema = Joi.string().trim().max(500);
const correctionHoursSchema = Joi.number().positive().precision(2).max(9999.99);

const params = Joi.object({
    id: idSchema(
        "ID lembur"
    )
        .required()
        .messages({
            "any.required":
                "ID lembur wajib diisi",
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

    id_petugas_cuti: idSchema(
        "ID petugas cuti"
    )
        .allow(null)
        .optional(),

    tgl_lembur:
        dateSchema(
            "Tanggal lembur"
        )
            .required()
            .messages({
                "any.required":
                    "Tanggal lembur wajib diisi",
            }),

    jam_mulai:
        timeSchema(
            "Jam mulai"
        )
            .required()
            .messages({
                "any.required":
                    "Jam mulai wajib diisi",
            }),

    jam_selesai:
        timeSchema(
            "Jam selesai"
        )
            .required()
            .messages({
                "any.required":
                    "Jam selesai wajib diisi",
            }),

    kategori_lembur: Joi.string()
        .trim()
        .max(1000)
        .required()
        .messages({
            "string.base":
                "Kategori lembur harus berupa teks",

            "string.empty":
                "Kategori lembur wajib diisi",

            "string.max":
                "Kategori lembur maksimal 1000 karakter",

            "any.required":
                "Kategori lembur wajib diisi",
        }),

    jenis_pekerjaan: nullableTextSchema("Jenis pekerjaan", 1000).optional(),
    area_group: nullableTextSchema("Area group", 255).optional(),
    is_hari_libur: Joi.string().trim().uppercase().valid("Y", "N").default("N"),

    detail_pekerjaan_lembur:
        nullableTextSchema(
            "Detail pekerjaan lembur",
            5000
        ).optional(),

    foto_kegiatan_1: filePathSchema.required(),

    foto_kegiatan_2: filePathSchema.required(),

    surat_perintah_lembur: filePathSchema.required(),

    maker_signature: filePathSchema.optional(),
    checker_signature: filePathSchema.optional(),
    verification_signature: filePathSchema.optional(),
    approval_1_signature: filePathSchema.optional(),
    approval_2_signature: filePathSchema.optional(),
    approval_3_signature: filePathSchema.optional(),
    jumlah_jam_koreksi: correctionHoursSchema.allow(null).optional(),
    catatan_koreksi: nullableTextSchema("Catatan koreksi", 5000).optional(),
    nomor_dokumen: nullableTextSchema("Nomor dokumen", 150).optional(),

    keterangan:
        nullableTextSchema(
            "Keterangan",
            2000
        ).optional(),
})
    .custom(
        (
            value,
            helpers
        ) => {
            const start =
                value.jam_mulai
                    .split(":")
                    .map(Number);

            const end =
                value.jam_selesai
                    .split(":")
                    .map(Number);

            const startSeconds =
                start[0] * 3600 +
                start[1] * 60 +
                (start[2] || 0);

            const endSeconds =
                end[0] * 3600 +
                end[1] * 60 +
                (end[2] || 0);

            if (
                startSeconds >=
                endSeconds
            ) {
                return helpers.error(
                    "time.invalidRange"
                );
            }

            return value;
        }
    )
    .messages({
        "time.invalidRange":
            "Jam mulai harus lebih kecil dari jam selesai",
    });

const update = Joi.object({
    id_petugas: idSchema(
        "ID petugas"
    ).optional(),

    id_petugas_cuti: idSchema(
        "ID petugas cuti"
    )
        .allow(null)
        .optional(),

    tgl_lembur:
        dateSchema(
            "Tanggal lembur"
        ).optional(),

    jam_mulai:
        timeSchema(
            "Jam mulai"
        ).optional(),

    jam_selesai:
        timeSchema(
            "Jam selesai"
        ).optional(),

    kategori_lembur: Joi.string()
        .trim()
        .max(1000)
        .optional()
        .messages({
            "string.base":
                "Kategori lembur harus berupa teks",

            "string.empty":
                "Kategori lembur tidak boleh kosong",

            "string.max":
                "Kategori lembur maksimal 1000 karakter",
        }),

    jenis_pekerjaan: nullableTextSchema("Jenis pekerjaan", 1000).optional(),
    area_group: nullableTextSchema("Area group", 255).optional(),
    is_hari_libur: Joi.string().trim().uppercase().valid("Y", "N").optional(),

    detail_pekerjaan_lembur:
        nullableTextSchema(
            "Detail pekerjaan lembur",
            5000
        ).optional(),

    foto_kegiatan_1: Joi.string()
        .max(500)
        .optional(),

    foto_kegiatan_2: Joi.string()
        .max(500)
        .optional(),

    surat_perintah_lembur: Joi.string()
        .max(500)
        .optional(),

    maker_signature: filePathSchema.optional(),
    checker_signature: filePathSchema.optional(),
    verification_signature: filePathSchema.optional(),
    approval_1_signature: filePathSchema.optional(),
    approval_2_signature: filePathSchema.optional(),
    approval_3_signature: filePathSchema.optional(),
    jumlah_jam_koreksi: correctionHoursSchema.allow(null).optional(),
    catatan_koreksi: nullableTextSchema("Catatan koreksi", 5000).optional(),
    nomor_dokumen: nullableTextSchema("Nomor dokumen", 150).optional(),

    keterangan:
        nullableTextSchema(
            "Keterangan",
            2000
        ).optional(),
})
    .min(1)
    .custom(
        (
            value,
            helpers
        ) => {
            if (
                value.jam_mulai &&
                value.jam_selesai
            ) {
                const start =
                    value.jam_mulai
                        .split(":")
                        .map(Number);

                const end =
                    value.jam_selesai
                        .split(":")
                        .map(Number);

                const startSeconds =
                    start[0] * 3600 +
                    start[1] * 60 +
                    (start[2] || 0);

                const endSeconds =
                    end[0] * 3600 +
                    end[1] * 60 +
                    (end[2] || 0);

                if (
                    startSeconds >=
                    endSeconds
                ) {
                    return helpers.error(
                        "time.invalidRange"
                    );
                }
            }

            return value;
        }
    )
    .messages({
        "object.min":
            "Minimal satu data harus diisi untuk diperbarui",

        "time.invalidRange":
            "Jam mulai harus lebih kecil dari jam selesai",
    });

const query = Joi.object({
    id_petugas: idSchema(
        "ID petugas"
    ).optional(),

    id_petugas_cuti: idSchema(
        "ID petugas cuti"
    ).optional(),

    id_status: idSchema(
        "ID status"
    ).optional(),

    id_role: idSchema(
        "ID role"
    ).optional(),

    tgl_lembur:
        dateSchema(
            "Tanggal lembur"
        ).optional(),

    kategori_lembur: Joi.string()
        .trim()
        .max(1000)
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

    tgl_awal:
        dateSchema(
            "Tanggal awal"
        ).optional(),

    tgl_akhir:
        dateSchema(
            "Tanggal akhir"
        ).optional(),
})
    .custom(
        (
            value,
            helpers
        ) => {
            const hasStart =
                Boolean(
                    value.tgl_awal
                );

            const hasEnd =
                Boolean(
                    value.tgl_akhir
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
                    value.tgl_awal
                ) >
                new Date(
                    value.tgl_akhir
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
            "Tanggal awal dan tanggal akhir harus diisi bersamaan",

        "date.invalidRange":
            "Tanggal awal tidak boleh melebihi tanggal akhir",
});

const workflow = Joi.object({
    maker_signature: filePathSchema.optional(),
    checker_signature: filePathSchema.optional(),
    verification_signature: filePathSchema.optional(),
    approval_1_signature: filePathSchema.optional(),
    approval_2_signature: filePathSchema.optional(),
    approval_3_signature: filePathSchema.optional(),
    jumlah_jam_koreksi: correctionHoursSchema.optional(),
    catatan_koreksi: nullableTextSchema("Catatan koreksi", 5000).optional(),
}).unknown(false);

module.exports = {
    params,
    petugasParams,
    create,
    update,
    query,
    workflow,
};

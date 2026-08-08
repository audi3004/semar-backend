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

const params = Joi.object({
    id: idSchema("ID")
        .required()
        .messages({
            "any.required":
                "ID wajib diisi",
        }),
});

const query = Joi.object({
    id_lembur: idSchema(
        "ID lembur"
    ).optional(),
    id_status_sebelum:
        idSchema(
            "ID status sebelum"
        ).optional(),
    id_status_sesudah:
        idSchema(
            "ID status sesudah"
        ).optional(),
    created_by: idSchema(
        "ID pembuat"
    ).optional(),
    aksi: Joi.string()
        .trim()
        .uppercase()
        .valid(
            "CREATE",
            "UPDATE",
            "NEXT",
            "REVISION",
            "REJECT",
            "DELETE"
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

module.exports = {
    params,
    query,
};

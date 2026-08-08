const Joi = require("joi");

const personId = (label) =>
    Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base": `${label} harus berupa angka`,
            "number.integer": `${label} harus berupa bilangan bulat`,
            "number.positive": `${label} tidak valid`,
        });

const create = Joi.object({
    id_pegawai: personId("Pegawai"),
    id_petugas: personId("Petugas"),

    id_unit_sesudah: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "Unit tujuan harus berupa angka",
            "number.integer": "Unit tujuan harus berupa bilangan bulat",
            "number.positive": "Unit tujuan tidak valid",
            "any.required": "Unit tujuan wajib dipilih",
        }),

    tanggal_mutasi: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "Tanggal mutasi tidak valid",
            "date.format": "Format tanggal mutasi harus YYYY-MM-DD",
            "any.required": "Tanggal mutasi wajib diisi",
        }),

    keterangan: Joi.string()
        .trim()
        .max(500)
        .allow(null, "")
        .optional(),
})
    .xor("id_pegawai", "id_petugas")
    .messages({
        "object.missing":
            "Salah satu Pegawai atau Petugas wajib dipilih",
        "object.xor":
            "Pilih salah satu saja: Pegawai atau Petugas",
    });

module.exports = { create };

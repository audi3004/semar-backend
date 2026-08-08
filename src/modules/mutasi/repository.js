const { Op } = require("sequelize");
const {
    Mutasi,
    Pegawai,
    Petugas,
    Jabatan,
    Unit,
} = require("../../models");

const personInclude = (model, as) => ({
    model,
    as,
    attributes: [
        as === "pegawai" ? "id_pegawai" : "id_petugas",
        "nip",
        "nama",
        "id_jabatan",
        "id_unit",
    ],
    include: [
        {
            model: Jabatan,
            as: "jabatan",
            attributes: ["id_jabatan", "nama_jabatan"],
            required: false,
        },
    ],
    required: false,
});

const unitInclude = (as) => ({
    model: Unit,
    as,
    attributes: ["id_unit", "nama_unit", "id_induk_unit"],
});

const mutasiInclude = [
    personInclude(Pegawai, "pegawai"),
    personInclude(Petugas, "petugas"),
    unitInclude("unitSebelum"),
    unitInclude("unitSesudah"),
];

const order = [
    ["tanggal_mutasi", "DESC"],
    ["id_mutasi", "DESC"],
];

class MutasiRepository {
    async findAll() {
        return await Mutasi.findAll({
            include: mutasiInclude,
            order,
        });
    }

    async findById(id_mutasi) {
        return await Mutasi.findByPk(id_mutasi, {
            include: mutasiInclude,
        });
    }

    async findByPegawai(id_pegawai) {
        return await Mutasi.findAll({
            where: { id_pegawai },
            include: mutasiInclude,
            order,
        });
    }

    async findByPetugas(id_petugas) {
        return await Mutasi.findAll({
            where: { id_petugas },
            include: mutasiInclude,
            order,
        });
    }

    async findByUnit(id_unit) {
        return await Mutasi.findAll({
            where: {
                [Op.or]: [
                    { id_unit_sebelum: id_unit },
                    { id_unit_sesudah: id_unit },
                ],
            },
            include: mutasiInclude,
            order,
        });
    }

    async create(data, created_by, transaction) {
        return await Mutasi.create(
            {
                ...data,
                created_by,
            },
            { transaction }
        );
    }
}

module.exports = new MutasiRepository();

const { Petugas, Jabatan } = require("../models");
const AppError = require("./appError");

async function resolveTransactionProject(data, transaction = null) {
    if (data.id_project) return Number(data.id_project);
    const petugas = await Petugas.findByPk(data.id_petugas, {
        attributes: ["id_petugas", "id_jabatan"],
        include: [{ model: Jabatan, as: "jabatan", attributes: ["id_project"], required: false }],
        transaction,
    });
    const idProject = petugas?.jabatan?.id_project;
    if (!idProject) throw new AppError("Project transaksi tidak dapat ditentukan dari data petugas", 400);
    return Number(idProject);
}

module.exports = resolveTransactionProject;

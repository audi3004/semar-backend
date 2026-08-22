const service = require("./service"); const response = require("../../utils/response");
const action = (fn, success, status = "success") => async (req, res) => { try { const data = await fn(req); return response[status](res, data, success); } catch (error) { return response.error(res, error.message, error.statusCode || 500); } };
module.exports = {
 list: action((req) => service.list(req.query), "Master lembur berhasil diambil"),
 createCategory: action((req) => service.createCategory(req.body, req.user), "Kategori lembur berhasil ditambahkan", "created"),
 updateCategory: action((req) => service.updateCategory(req.params.id, req.body, req.user), "Kategori lembur berhasil diperbarui", "updated"),
 deleteCategory: action(async (req) => { await service.deleteCategory(req.params.id, req.user); return null; }, "Kategori lembur berhasil dihapus"),
 createType: action((req) => service.createType(req.body, req.user), "Jenis pekerjaan berhasil ditambahkan", "created"),
 updateType: action((req) => service.updateType(req.params.id, req.body, req.user), "Jenis pekerjaan berhasil diperbarui", "updated"),
 deleteType: action(async (req) => { await service.deleteType(req.params.id, req.user); return null; }, "Jenis pekerjaan berhasil dihapus"),
};

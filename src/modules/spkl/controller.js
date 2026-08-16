const service = require("./service"); const response = require("../../utils/response");
const call = (fn, message, responseType = "success") => async (req, res) => {
 try {
  const data = await fn(req);
  const responders = {
   success: () => response.success(res, data, message),
   created: () => response.created(res, data, message),
   updated: () => response.updated(res, data, message),
  };
  return responders[responseType]();
 } catch (e) {
  return response.error(res, e.message, e.statusCode || 500);
 }
};
module.exports = {
 findAll: call((r) => service.findAll(r.query, r.user), "Data SPKL berhasil diambil"), findById: call((r) => service.findOne(r.params.id, r.user), "Detail SPKL berhasil diambil"),
 create: call((r) => service.create(r.body, r.user), "SPKL berhasil dibuat", "created"), update: call((r) => service.update(r.params.id, r.body, r.user), "SPKL berhasil diperbarui", "updated"),
 remove: async (req, res) => { try { await service.remove(req.params.id, req.user); return response.deleted(res, "SPKL berhasil dihapus"); } catch (e) { return response.error(res, e.message, e.statusCode || 500); } },
};

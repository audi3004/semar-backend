const router = require("express").Router();
const controller = require("./controller");
const validate = require("../../middlewares/validator");
const schema = require("./validator");

router.get("/permohonan", validate(schema.query, "query"), controller.permohonan);
router.post("/permohonan", validate(schema.create), controller.create);
router.post("/permohonan/:id/sign", validate(schema.params, "params"), validate(schema.sign), controller.sign);
router.get("/permohonan/:id/export", validate(schema.params, "params"), controller.exportData);

module.exports = router;

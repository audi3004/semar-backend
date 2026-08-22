const router = require("express").Router(); const controller = require("./controller"); const schema = require("./validator"); const validate = require("../../middlewares/validator");
router.get("/", validate(schema.query, "query"), controller.findAll); router.get("/officer-availability", controller.availability); router.get("/:id", validate(schema.params, "params"), controller.findById);
router.post("/", validate(schema.payload), controller.create); router.put("/:id", validate(schema.params, "params"), validate(schema.payload), controller.update); router.delete("/:id", validate(schema.params, "params"), controller.remove);
module.exports = router;

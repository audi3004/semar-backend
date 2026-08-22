const router = require("express").Router(); const controller = require("./controller"); const schema = require("./validator"); const validate = require("../../middlewares/validator");
router.get("/", validate(schema.query, "query"), controller.list);
router.post("/categories", validate(schema.category), controller.createCategory);
router.put("/categories/:id", validate(schema.params, "params"), validate(schema.category), controller.updateCategory);
router.delete("/categories/:id", validate(schema.params, "params"), controller.deleteCategory);
router.post("/types", validate(schema.type), controller.createType);
router.put("/types/:id", validate(schema.params, "params"), validate(schema.type), controller.updateType);
router.delete("/types/:id", validate(schema.params, "params"), controller.deleteType);
module.exports = router;

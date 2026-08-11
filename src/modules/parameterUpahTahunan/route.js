const router = require("express").Router();
const controller = require("./controller");
const schema = require("./validator");
const validate = require("../../middlewares/validator");

router.get("/", validate(schema.query, "query"), controller.findAll);
router.post("/", validate(schema.create), controller.create);
router.put("/:id", validate(schema.params, "params"), validate(schema.update), controller.update);

module.exports = router;

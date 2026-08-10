const router = require("express").Router();
const controller = require("./controller");
const validate = require("../../middlewares/validator");
const schema = require("./validator");

router.get("/permohonan", validate(schema.query, "query"), controller.permohonan);

module.exports = router;

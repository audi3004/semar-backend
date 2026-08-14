const router = require("express").Router();
const controller = require("./controller");
const validate = require("../../middlewares/validator");
const schema = require("./validator");

router.get("/transactions", validate(schema.query, "query"), controller.transactions);
router.get("/documents", validate(schema.query, "query"), controller.documents);

module.exports = router;

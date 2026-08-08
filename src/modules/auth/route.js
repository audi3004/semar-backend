const express = require(
    "express"
);

const controller = require(
    "./controller"
);
const schema = require(
    "./validator"
);
const validate = require(
    "../../middlewares/validator"
);
const authenticate = require(
    "../../middlewares/auth"
);

const router = express.Router();

router.post(
    "/login",
    validate(schema.login),
    controller.login
);

router.post(
    "/refresh",
    validate(schema.refresh),
    controller.refresh
);

router.post(
    "/logout",
    authenticate,
    controller.logout
);

router.get(
    "/me",
    authenticate,
    controller.me
);

module.exports = router;

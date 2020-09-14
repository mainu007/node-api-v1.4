const express = require("express");
const { signup, signin } = require("../controller/auth");
const { userValidator, validatorErrorHandler } = require("../validator");

//router
const router = express.Router();

router.post("/signup", userValidator, validatorErrorHandler, signup);
router.post("/signin", signin);

module.exports = router;

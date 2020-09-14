const express = require("express");
const { signup } = require("../controller/auth");
const { userValidator, validatorErrorHandler } = require("../validator");

//router
const router = express.Router();

router.post("/signup", userValidator, validatorErrorHandler, signup);

module.exports = router;

const express = require("express");
const { signup, signin, signout } = require("../controller/auth");
const { userValidator, validatorErrorHandler } = require("../validator");

//router
const router = express.Router();

router.post("/signup", userValidator, validatorErrorHandler, signup);
router.post("/signin", signin);
router.get("/signout", signout);

module.exports = router;

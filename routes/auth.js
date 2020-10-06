const express = require("express");
const {
   signup,
   signin,
   signout,
   forgotPassword,
   resetPassword,
   socialLogin,
} = require("../controller/auth");
const {
   userValidator,
   validatorErrorHandler,
   passwordResetValidator,
} = require("../validator");

//router
const router = express.Router();

router.post("/signup", userValidator, validatorErrorHandler, signup);
router.post("/signin", signin);
router.get("/signout", signout);

//password forgot and reset
router.put("/forgot-password", forgotPassword);
router.put(
   "/reset-password",
   passwordResetValidator,
   validatorErrorHandler,
   resetPassword
);

//social login
router.post("/social-login", socialLogin);

module.exports = router;

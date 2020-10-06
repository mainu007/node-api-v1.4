const { check, validationResult } = require("express-validator");

exports.userValidator = [
   check("name", "Name is required").notEmpty(),
   check("email", "Please insert a valid email address.").isEmail(),
   check("password", "Password must be at least 6 characters long.")
      .isLength({
         min: 6,
      })
      .matches(/\d/)
      .withMessage("Password must be a number"),
];

//post validation
exports.postValidator = [
   check("title", "Write a title")
      .notEmpty()
      .isLength({ min: 4 })
      .withMessage("Title must be at least 4 characters long."),
   check("body", "Write a body")
      .notEmpty()
      .isLength({ min: 4, max: 2000 })
      .withMessage("Body must be between 4 to 2000 characters."),
];

//password reset validator
exports.passwordResetValidator = [
   check("newPassword", "Password must be at least 6 characters long.")
      .isLength({
         min: 6,
      })
      .matches(/\d/)
      .withMessage("Password must be a number"),
];

exports.validatorErrorHandler = (req, res, next) => {
   const errors = validationResult(req);
   const firstError = errors.array().map((error) => error.msg)[0];
   if (!errors.isEmpty()) {
      return res.status(400).json({ error: firstError });
   }
   next();
};

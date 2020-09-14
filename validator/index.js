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

exports.validatorErrorHandler = (req, res, next) => {
   const errors = validationResult(req);
   const firstError = errors.array().map((error) => error.msg)[0];
   if (!errors.isEmpty()) {
      return res.status(400).json({ error: firstError });
   }
   next();
};

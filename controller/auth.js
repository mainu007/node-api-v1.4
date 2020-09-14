const User = require("../models/user");

exports.signup = async (req, res) => {
   const emailExist = await User.findOne({ email: req.body.email });
   if (emailExist) {
      return res.status(403).json({
         error: "Email is taken!",
      });
   }
   //create user
   const user = await User(req.body);
   //save database
   await user.save((err) => {
      if (err) {
         return res.status(403).json({ error: err });
      }
      res.json({ message: "Signup success! please login." });
   });
};

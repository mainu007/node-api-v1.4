const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const User = require("../models/user");
//dotenv config
require("dotenv").config();

//signup method
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

//signin method
exports.signin = (req, res) => {
   //user find based on email
   const { email, password } = req.body;
   User.findOne({ email }, (err, user) => {
      //error or no user
      if (err || !user) {
         return res.status(401).json({
            error: "User with that email does not exist! Please signup.",
         });
      }
      //authenticate
      //creating a authenticate method in user modal and use here
      if (!user.authenticate(password)) {
         return res.status(401).json({
            error: "Email and password do not match!",
         });
      }
      //create token with user id and secret
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      //persis the token as 't' in cookie and expired
      res.cookie("t", token, { expire: Date.now() + 9999 });
      //user response with token and user for frontend client
      const { _id, name, email } = user;
      return res.json({ token, user: { _id, name, email } });
   });
};

//sign out
exports.signout = (req, res) => {
   res.clearCookie("t");
   res.json({
      message: "Signout!",
   });
};

//signin require method
exports.requireSignin = expressJwt({
   secret: process.env.JWT_SECRET,
   algorithms: ["HS256"],
});

const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const _ = require("lodash");
const User = require("../models/user");
const { sendEmail } = require("../helper");
//dotenv config
require("dotenv").config();

//signup method
exports.signup = async (req, res) => {
   const emailExist = await User.findOne({ email: req.body.email });

   if (emailExist) {
      return res.status(403).json({
         error: "This user already signed up!!",
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
      const token = jwt.sign(
         { _id: user._id, role: user.role, iss: process.env.APP_NAME },
         process.env.JWT_SECRET
      );
      //persis the token as 't' in cookie and expired
      res.cookie("t", token, { expire: Date.now() + 9999 });
      //user response with token and user for frontend client
      const { _id, name, email, role } = user;
      return res.json({ token, user: { _id, name, email, role } });
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
   userProperty: "auth",
});

//password forgot and reset
exports.forgotPassword = (req, res) => {
   if (!req.body) return res.status(400).json({ error: "No request body" });
   if (!req.body.email) {
      return res.status(400).json({ error: "No email in request body" });
   }

   const { email } = req.body;
   //find user base on email
   User.findOne({ email }, (err, user) => {
      //error or no user
      if (err || !user) {
         return res
            .status(401)
            .json({ error: "User with that email does not exist!" });
      }
      //generate a token base on user id and jwt secret key
      const token = jwt.sign(
         { _id: user._id, iss: "NODEAPI" },
         process.env.JWT_SECRET
      );
      //email data
      const emailData = {
         from: "mainux.co.cc@gmail.com",
         to: email,
         subject: "Password Reset Instruction",
         text: `Please use the following link to reset your password: ${process.env.CLIENT_URL}/reset-password/${token}`,
         html: `<p>Please use the following link to reset your password:</p><p>${process.env.CLIENT_URL}/reset-password/${token}</p>`,
      };
      //save token in resetPasswordLink
      return user.updateOne({ resetPasswordLink: token }, (err, success) => {
         if (err) {
            return res.status(400).json({ error: err });
         } else {
            sendEmail(emailData);
            return res.json({
               message: `Email has been sent to ${email}. Follow the instructions to reset your password.`,
            });
         }
      });
   });
};

exports.resetPassword = (req, res) => {
   const { resetPasswordLink, newPassword } = req.body;

   //find user base on resetPasswordLink
   User.findOne({ resetPasswordLink }, (err, user) => {
      if (err || !user) {
         return res.status(401).json({ error: "Invalid Link" });
      }

      const updatedFields = {
         password: newPassword,
         resetPasswordLink: "",
      };

      user = _.extend(user, updatedFields);
      user.updated = Date.now();

      user.save((err, result) => {
         if (err) {
            return res.status(400).json({ error: err });
         }
         res.json({
            message: "Great! Now you can login with your new password.",
         });
      });
   });
};

//social login
exports.socialLogin = (req, res) => {
   User.findOne({ email: req.body.email }, (err, user) => {
      if (err || !user) {
         //create a new account
         let user = new User(req.body);
         user.profile = user;
         user.save((err, result) => {
            if (err) {
               return res.status(400).json({ error: err });
            }
         });
         //generate a token
         const token = jwt.sign(
            { _id: user._id, role: user.role, iss: process.env.APP_NAME },
            process.env.JWT_SECRET
         );

         res.cookie("t", token, { expire: Date.now() + 9999 });
         //response with token and user for frontend client
         const { _id, name, email, role } = user;
         res.json({
            token,
            user: { _id, name, email, role },
         });
      } else {
         //update exiting user
         req.profile = user;
         user = _.extend(user, req.body);
         user.updated = Date.now();
         user.save((err, result) => {
            if (err) {
               return res.status(400).json({ error: err });
            }
         });
         //generate a token with user id and token
         const token = jwt.sign(
            { _id: user._id, role: user.role, iss: process.env.APP_NAME },
            process.env.JWT_SECRET
         );
         res.cookie("t", token, { expire: Date.now() + 9999 });
         //response with token and user for frontend client
         const { _id, name, email, role } = user;
         res.json({ token, user: { _id, name, email, role } });
      }
   });
};

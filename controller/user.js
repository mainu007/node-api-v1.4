const _ = require("lodash");
const User = require("../models/user");

//show all users
exports.allUsers = (req, res) => {
   User.find()
      .select("_id name email")
      .then((users) => {
         return res.json(users);
      })
      .catch((err) => {
         return res.status(400).json({
            error: err,
         });
      });
};

//show single user
exports.getUser = (req, res) => {
   req.profile.salt = undefined;
   req.profile.dashed_password = undefined;
   return res.json(req.profile);
};

//updated user profile
exports.updateUser = (req, res) => {
   let user = req.profile;
   user = _.extend(user, req.body);
   user.updated = Date.now();
   //save
   user.save((err) => {
      if (err) {
         res.status(401).json({
            error: err,
         });
      }
      user.salt = undefined;
      user.dashed_password = undefined;
      res.json({
         message: "User updated successfully.",
         user,
      });
   });
};

//deleted user
exports.deleteUser = (req, res) => {
   const user = req.profile;
   user.remove((err) => {
      if (err) {
         res.status(401).json({ error: err });
      }
      user.salt = undefined;
      user.dashed_password = undefined;
      res.json({
         message: "User deleted successfully.",
         user,
      });
   });
};

//create req.profile method
exports.userById = (req, res, next, id) => {
   User.findById(id).exec((err, user) => {
      if (err || !user) {
         return res.status(401).json({
            error: "User not found.",
         });
      }
      req.profile = user;
      next();
   });
};

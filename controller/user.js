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

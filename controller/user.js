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
   User.findOne({ email: req.profile.email }, (err, user) => {
      if (err || !user) {
         return res.status(401).json({
            error: err,
         });
      }
      res.json(user);
   }).select("_id name email");
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

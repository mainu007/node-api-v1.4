const User = require("../models/user");

//show all users
exports.allUsers = (req, res) => {
   User.find()
      .then((users) => {
         return res.json(users);
      })
      .catch((err) => {
         return res.status(400).json({
            error: err,
         });
      });
};

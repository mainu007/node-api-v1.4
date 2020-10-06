const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const User = require("../models/user");

//show all users
exports.allUsers = async (req, res) => {
   const currentPage = req.query.page || 1;
   const perPage = 6;
   let totalPage;
   const users = await User.find()
      .countDocuments()
      .then((count) => {
         totalPage = Math.ceil(count / perPage);
         return User.find()
            .skip((currentPage - 1) * perPage)
            .sort({ created: -1 })
            .limit(perPage)
            .select("_id name email created updated role");
      })
      .then((users) => {
         const pageArray = (totalPage) => {
            let newArray = [];
            for (let i = 1; i <= totalPage; i++) {
               newArray.push(i);
            }
            return newArray;
         };

         res.json({ users, totalPage: pageArray(totalPage) });
      })
      .catch((err) => {
         res.status(400).json({ error: err });
      });

   // User.find()
   //    .select("_id name email created updated role")
   //    .sort({ created: -1 })
   //    .then((users) => {
   //       return res.json(users);
   //    })
   //    .catch((err) => {
   //       return res.status(400).json({
   //          error: err,
   //       });
   //    });
};
//create req.profile method
exports.userById = (req, res, next, id) => {
   User.findById(id)
      //populate following and followers names, ids
      .populate("following", "_id name")
      .populate("followers", "_id name")
      .exec((err, user) => {
         if (err || !user) {
            return res.status(401).json({
               error: "User not found.",
            });
         }
         req.profile = user;
         next();
      });
};

//authorization
exports.hasAuthorization = (req, res, next) => {
   const someUser = req.profile && req.auth && req.profile._id == req.auth._id;
   const adminUser = req.profile && req.auth && req.auth.role === "admin";
   const authorized = someUser || adminUser;
   console.log("exports.hasAuthorization -> someUser", someUser, req.profile);
   console.log("exports.hasAuthorization -> adminUser", adminUser, req.auth);
   if (!authorized) {
      return res.status(401).json({
         error: "User is not authorized to perform this action!",
      });
   }
   next();
};

//show single user
exports.getUser = (req, res) => {
   req.profile.salt = undefined;
   req.profile.dashed_password = undefined;
   return res.json(req.profile);
};

//updated user profile
exports.updateUser = (req, res) => {
   const form = new formidable.IncomingForm();
   form.keepExtensions = true;
   form.parse(req, async (err, fields, files) => {
      let userEmail = "";
      if (fields.email) {
         userEmail = fields.email;
      }
      //check email exist
      const emailExist = await User.findOne({ email: userEmail });

      if (emailExist) {
         return res.status(403).json({
            error: "Email already exists!!",
         });
      }
      if (err) {
         return res.status(400).json({
            error: "Photo could not be uploaded",
         });
      }
      let user = req.profile;
      user = _.extend(user, fields);
      user.updated = Date.now();

      if (files.photo) {
         user.photo.data = fs.readFileSync(files.photo.path);
         user.photo.contentType = files.photo.type;
      }
      //save
      user.save((err, result) => {
         if (err) {
            return res.status(400).json({ error: err });
         }
         user.dashed_password = undefined;
         user.salt = undefined;
         res.json(result);
      });
   });
};

//get user photo
exports.userPhoto = (req, res, next) => {
   if (req.profile.photo.data) {
      res.set("Content-Type", req.profile.photo.type);
      res.send(req.profile.photo.data);
   } else {
      res.status(400).json({ error: "photo not found" });
   }
   next();
};

//deleted user
exports.deleteUser = (req, res) => {
   const user = req.profile;
   user.remove((err) => {
      if (err) {
         return res.status(401).json({ error: err });
      }
      user.salt = undefined;
      user.dashed_password = undefined;
      res.json({
         message: "User deleted successfully.",
         user,
      });
   });
};

//follow  unFollow
exports.addFollowing = (req, res, next) => {
   User.findByIdAndUpdate(
      req.body.userId,
      { $push: { following: req.body.followId } },
      (err) => {
         if (err) {
            return res.status(400).json({
               error: err,
            });
         }
         next();
      }
   );
};

exports.addFollower = (req, res) => {
   User.findByIdAndUpdate(
      req.body.followId,
      { $push: { followers: req.body.userId } },
      { new: true }
   )
      .populate("following", "_id name")
      .populate("followers", "_id name")
      .exec((err, result) => {
         if (err) {
            return res.status(400).json({ error: err });
         }
         result.dashed_password = undefined;
         result.salt = undefined;
         res.json(result);
      });
};
//remove follow  unFollow
exports.removeFollowing = (req, res, next) => {
   User.findByIdAndUpdate(
      req.body.userId,
      { $pull: { following: req.body.unFollowId } },
      (err) => {
         if (err) {
            return res.status(400).json({
               error: err,
            });
         }
         next();
      }
   );
};

exports.removeFollower = (req, res) => {
   User.findByIdAndUpdate(
      req.body.unFollowId,
      { $pull: { followers: req.body.userId } },
      { new: true }
   )
      .populate("following", "_id name")
      .populate("followers", "_id name")
      .exec((err, result) => {
         if (err) {
            return res.status(400).json({ error: err });
         }
         result.dashed_password = undefined;
         result.salt = undefined;
         res.json(result);
      });
};

//find people
exports.findPeople = async (req, res) => {
   let following = req.profile.following;
   following.push(req.profile._id);

   const currentPage = req.query.page || 1;
   const perPage = 6;
   let totalPage;
   const users = await User.find({ _id: { $nin: following } })
      .countDocuments()
      .then((count) => {
         totalPage = Math.ceil(count / perPage);
         return User.find({ _id: { $nin: following } })
            .skip((currentPage - 1) * perPage)
            .sort({ created: -1 })
            .limit(perPage)
            .select("_id name");
      })
      .then((users) => {
         const pageArray = (totalPage) => {
            let newArray = [];
            for (let i = 1; i <= totalPage; i++) {
               newArray.push(i);
            }
            return newArray;
         };

         res.json({ users, totalPage: pageArray(totalPage) });
      })
      .catch((err) => {
         res.status(400).json({ error: err });
      });

   // User.find({ _id: { $nin: following } }, (err, users) => {
   //    if (err) {
   //       return res.status(400).json({ error: err });
   //    }
   //    res.json(users);
   // }).select("name");
};

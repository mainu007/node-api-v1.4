const Post = require("../models/post");
const formidable = require("formidable");
const fs = require("fs");
const _ = require("lodash");

//is poster
exports.isPoster = (req, res, next) => {
   const someUser =
      req.post && req.auth && req.post.postedBy._id == req.auth._id;
   const adminUser = req.post && req.auth && req.auth.role === "admin";
   const isPoster = someUser || adminUser;
   if (!isPoster) {
      return res.status(401).json({
         error: "User is not authorized to perform this action!",
      });
   }
   next();
};
//get all post and posted user
exports.getPosts = async (req, res) => {
   const currentPage = req.query.page || 1;
   const perPage = 6;
   let totalPage;
   const posts = await Post.find()
      .countDocuments()
      .then((count) => {
         totalPage = Math.ceil(count / perPage);
         return Post.find()
            .skip((currentPage - 1) * perPage)
            .populate("postedBy", "_id name role")
            .populate("comments", "text created")
            .populate("comments.postedBy", "_id name role")
            .sort({ created: -1 })
            .limit(perPage)
            .select("_id title body created likes");
      })
      .then((posts) => {
         const pageArray = (totalPage) => {
            let a = [];
            for (let i = 1; i <= totalPage; i++) {
               a.push(i);
            }
            return a;
         };

         res.json({ posts, totalPage: pageArray(totalPage) });
      })
      .catch((err) => {
         res.status(400).json({ error: err });
      });
   // Post.find()
   //    .populate("postedBy", "_id name role")
   //    .populate("comments", "text created")
   //    .populate("comments.postedBy", "_id name role")
   //    .select("_id title body created likes")
   //    .sort({ created: -1 })
   //    .exec((err, posts) => {
   //       if (err) {
   //          return res.status(400).json({
   //             error: err,
   //          });
   //       }
   //       res.json(posts);
   //    });
};

//create post
exports.createPost = (req, res, next) => {
   const form = new formidable.IncomingForm();
   form.keepExtension = true;
   form.parse(req, (err, fields, files) => {
      if (err) {
         return res.status(400).json({
            error: "Image could be not uploaded.",
         });
      }
      //create post
      const post = new Post(fields);
      //add posted by
      post.postedBy = req.profile;
      //file check
      if (files.photo) {
         post.photo.data = fs.readFileSync(files.photo.path);
         post.photo.contentType = files.photo.type;
      }
      //user salt and dashed_password hide from user
      req.profile.salt = undefined;
      req.profile.dashed_password = undefined;
      //save
      post.save((err, result) => {
         if (err) {
            return res.status(400).json({
               error: err,
            });
         }
         res.json(result);
      });
   });
};

//updated post
exports.updatePost = (req, res) => {
   const form = new formidable.IncomingForm();
   form.keepExtensions = true;
   form.parse(req, (err, fields, files) => {
      if (err) {
         return res.status(400).json({
            error: "Photo could not be uploaded",
         });
      }
      let post = req.post;
      post = _.extend(post, fields);
      post.updated = Date.now();

      if (files.photo) {
         post.photo.data = fs.readFileSync(files.photo.path);
         post.photo.contentType = files.photo.type;
      }
      //save
      post.save((err, result) => {
         if (err) {
            return res.status(400).json({ error: err });
         }
         res.json(result);
      });
   });
};

//delete post
exports.deletePost = (req, res) => {
   const post = req.post;
   post.remove((err) => {
      if (err) {
         return res.status(400).json({ error: err });
      }
      post.salt = undefined;
      post.dashed_password = undefined;
      res.json({
         message: "Post deleted successfully!",
         post,
      });
   });
};

//posts by user
exports.postsByUser = (req, res) => {
   Post.find({ postedBy: req.profile._id })
      .populate("postedBy", "_id name role")
      .populate("comments", "text created")
      .populate("comments.postedBy", "_id name role")
      .sort({ created: -1 })
      .exec((err, posts) => {
         if (err) {
            return res.status(400).json({
               error: err,
            });
         }
         res.json(posts);
      });
};

//signleUserPosts
exports.singleUserPosts = async (req, res) => {
   const currentPage = req.query.page || 1;
   const perPage = 6;
   let totalPage;
   const posts = await Post.find({ postedBy: req.profile._id })
      .countDocuments()
      .then((count) => {
         totalPage = Math.ceil(count / perPage);
         return Post.find({ postedBy: req.profile._id })
            .skip((currentPage - 1) * perPage)
            .populate("postedBy", "_id name role")
            .populate("comments", "text created")
            .populate("comments.postedBy", "_id name role")
            .sort({ created: -1 })
            .limit(perPage)
            .select("_id title body created likes");
      })
      .then((posts) => {
         const pageArray = (totalPage) => {
            let a = [];
            for (let i = 1; i <= totalPage; i++) {
               a.push(i);
            }
            return a;
         };

         res.json({ posts, totalPage: pageArray(totalPage) });
      })
      .catch((err) => {
         res.status(400).json({ error: err });
      });
};

//creating req.post object method
exports.postById = (req, res, next, id) => {
   Post.findById(id).exec((err, post) => {
      if (err || !post) {
         return res.status(400).json({
            error: "Post not found.",
         });
      }
      req.post = post;
      next();
   });
};

//get post photo
exports.photo = (req, res, next) => {
   if (req.post.photo.data) {
      res.set("Content-Type", req.post.photo.contentType);
      res.send(req.post.photo.data);
   } else {
      res.status(400).json({ error: "photo not found" });
   }
   next();
};

//get single post
exports.singlePost = (req, res) => {
   console.log("run single post");
   Post.findById(req.post._id)
      .populate("postedBy", "_id name")
      .populate("comments", "text created")
      .populate("comments.postedBy", "_id name")
      .exec((err, post) => {
         if (err) {
            return res.status(400).json({ error: err });
         }
         res.json(post);
      });
};

//like unlike
exports.like = (req, res) => {
   Post.findByIdAndUpdate(
      req.body.postId,
      { $push: { likes: req.body.userId } },
      { new: true }
   ).exec((err, result) => {
      if (err) {
         return res.status(400).json({ error: err });
      }
      res.json(result);
   });
};
exports.unlike = (req, res) => {
   Post.findByIdAndUpdate(
      req.body.postId,
      { $pull: { likes: req.body.userId } },
      { new: true }
   ).exec((err, result) => {
      if (err) {
         return res.status(400).json({ error: err });
      }
      res.json(result);
   });
};

//comment uncomment
exports.comment = (req, res) => {
   const comment = req.body.comment;
   comment.postedBy = req.body.userId;
   Post.findByIdAndUpdate(
      req.body.postId,
      { $push: { comments: comment } },
      { new: true }
   )
      .populate("comments", "text created")
      .populate("comments.postedBy", "_id name")
      .exec((err, result) => {
         if (err) {
            return res.status(400).json({ error: "jamela ace" });
         }
         res.json(result);
      });
};
exports.uncomment = (req, res) => {
   Post.findByIdAndUpdate(
      req.body.postId,
      { $pull: { comments: { _id: req.body.comment._id } } },
      { new: true }
   )
      .populate("comments", "text created")
      .populate("comments.postedBy", "_id name")
      .exec((err, result) => {
         if (err) {
            return res.status(400).json({ error: err });
         }
         res.json(result);
      });
};

const Post = require("../models/post");
const formidable = require("formidable");
const fs = require("fs");
const _ = require("lodash");

//is poster
exports.isPoster = (req, res, next) => {
   const isPoster =
      req.post && req.auth && req.post.postedBy._id == req.auth._id;
   console.log("req.post:", req.post);
   console.log("req.auth:", req.auth);
   console.log("req.post.postedBy._id:", req.post.postedBy._id);
   console.log("req.auth._id:", req.auth._id);
   if (!isPoster) {
      return res.status(401).json({
         error: "User not a poster",
      });
   }
   next();
};
//get all post and posted user
exports.getPosts = (req, res) => {
   Post.find()
      .select("_id title body")
      .populate("postedBy", "_id name")
      .then((posts) => {
         res.json(posts);
      })
      .catch((err) => {
         res.status(400).json({ error: err });
      });
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
   let post = req.post;
   post = _.extend(post, req.body);
   post.save((err, result) => {
      if (err) {
         return res.status(400).json({
            error: err,
         });
      }
      res.json({
         message: "Post updated successfully!",
         result,
      });
   });
};

//posts by user
exports.postsByUser = (req, res) => {
   Post.find({ postedBy: req.profile._id })
      .populate("postedBy", "_id name")
      .then((posts) => res.json(posts))
      .catch((err) => res.status(400).json({ error: err }));
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

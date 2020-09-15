const Post = require("../models/post");
const formidable = require("formidable");
const fs = require("fs");

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

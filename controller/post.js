const Post = require("../models/post");

exports.getPosts = (req, res) => {
   Post.find()
      .select("_id title body")
      .then((posts) => {
         res.json(posts);
      })
      .catch((err) => {
         res.status(400).json({ error: err });
      });
};

//create post
exports.createPost = (req, res) => {
   const post = new Post(req.body);
   //save
   post.save((err, post) => {
      if (err) {
         return res.status(400).json({ error: err });
      }
      res.json(post);
   });
};

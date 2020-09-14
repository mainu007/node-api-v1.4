const Post = require("../models/post");

exports.getPosts = (req, res) => {
   res.json({
      posts: [
         { title: "Hello node js", body: "Body from node js" },
         { title: "Good Morning", body: "Body from Good morning" },
      ],
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

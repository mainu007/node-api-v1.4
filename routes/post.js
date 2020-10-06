const express = require("express");
const { requireSignin } = require("../controller/auth");
const {
   getPosts,
   createPost,
   postsByUser,
   postById,
   isPoster,
   updatePost,
   deletePost,
   photo,
   singlePost,
   like,
   unlike,
   comment,
   uncomment,
   singleUserPosts,
} = require("../controller/post");
const { postValidator, validatorErrorHandler } = require("../validator");
const { userById } = require("../controller/user");

const router = express.Router();
//router
router.get("/posts", getPosts);
router.put("/post/like", requireSignin, like);
router.put("/post/unlike", requireSignin, unlike);
router.put("/post/comment", requireSignin, comment);
router.put("/post/uncomment", requireSignin, uncomment);
router.get("/posts/by/:userId", requireSignin, singleUserPosts);
router.get("/posts/single-list/:userId", requireSignin, postsByUser);
//single post
router.get("/post/:postId", singlePost);
router.post(
   "/post/new/:userId",
   requireSignin,
   postValidator,
   createPost,
   validatorErrorHandler
);
router.put("/post/:postId", requireSignin, isPoster, updatePost);
router.delete("/post/:postId", requireSignin, isPoster, deletePost);
//photo
router.get("/post/photo/:postId", photo);

//any route containing :userId, our first execute userById()
router.param("userId", userById);
//any route containing :postId, our first execute postById()
router.param("postId", postById);

module.exports = router;

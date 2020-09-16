const express = require("express");
const { requireSignin } = require("../controller/auth");
const {
   getPosts,
   createPost,
   postsByUser,
   postById,
   isPoster,
   updatePost,
} = require("../controller/post");
const { postValidator, validatorErrorHandler } = require("../validator");
const { userById } = require("../controller/user");

const router = express.Router();
//router
router.get("/posts", requireSignin, getPosts);
router.post(
   "/post/new/:userId",
   requireSignin,
   postValidator,
   createPost,
   validatorErrorHandler
);
router.put("/post/:postId", requireSignin, isPoster, updatePost);
router.get("/posts/by/:userId", requireSignin, postsByUser);

//any route containing :userId, our first execute userById()
router.param("userId", userById);
//any route containing :postId, our first execute postById()
router.param("postId", postById);

module.exports = router;

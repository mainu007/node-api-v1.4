const express = require("express");
const { requireSignin } = require("../controller/auth");
const { getPosts, createPost, postsByUser } = require("../controller/post");
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
router.get("/posts/by/:userId", requireSignin, postsByUser);

//any route containing :userId, our first execute userById()
router.param("userId", userById);

module.exports = router;

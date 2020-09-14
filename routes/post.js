const express = require("express");
const { requireSignin } = require("../controller/auth");
const { getPosts, createPost } = require("../controller/post");
const { postValidator, validatorErrorHandler } = require("../validator");

const router = express.Router();
//router
router.get("/posts", requireSignin, getPosts);
router.post("/new/post", postValidator, validatorErrorHandler, createPost);

module.exports = router;

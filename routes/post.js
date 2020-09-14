const express = require("express");
const { getPosts, createPost } = require("../controller/post");
const { postValidator, validatorErrorHandler } = require("../validator");

const router = express.Router();
//router
router.get("/", getPosts);
router.post("/new/post", postValidator, validatorErrorHandler, createPost);

module.exports = router;

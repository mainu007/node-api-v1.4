const express = require("express");
const { allUsers, userById, getUser } = require("../controller/user");

const router = express();

router.get("/users", allUsers);
router.get("/user/:userId", getUser);

//any route containing :userId, our first execute userById()
router.param("userId", userById);

module.exports = router;

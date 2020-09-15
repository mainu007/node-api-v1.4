const express = require("express");
const { requireSignin } = require("../controller/auth");
const {
   allUsers,
   userById,
   getUser,
   updateUser,
} = require("../controller/user");

const router = express();

router.get("/users", allUsers);
router.get("/user/:userId", requireSignin, getUser);
router.put("/user/:userId", requireSignin, updateUser);

//any route containing :userId, our first execute userById()
router.param("userId", userById);

module.exports = router;

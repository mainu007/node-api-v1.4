const express = require("express");
const { requireSignin } = require("../controller/auth");
const {
   allUsers,
   userById,
   getUser,
   updateUser,
   deleteUser,
   userPhoto,
   addFollowing,
   addFollower,
   removeFollowing,
   removeFollower,
   findPeople,
   hasAuthorization,
} = require("../controller/user");

const router = express();

router.put("/user/follow", requireSignin, addFollowing, addFollower);
router.put("/user/unfollow", requireSignin, removeFollowing, removeFollower);

router.get("/users", allUsers);
router.get("/user/:userId", getUser);
router.get("/user/photo/:userId", userPhoto);
router.put("/user/:userId", requireSignin, hasAuthorization, updateUser);
router.delete("/user/:userId", requireSignin, hasAuthorization, deleteUser);

//find people
router.get("/user/findpeople/:userId", findPeople);

//any route containing :userId, our first execute userById()
router.param("userId", userById);

module.exports = router;

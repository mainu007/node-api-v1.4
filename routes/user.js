const express = require("express");
const { allUsers } = require("../controller/user");

const router = express();

router.get("/users", allUsers);

module.exports = router;

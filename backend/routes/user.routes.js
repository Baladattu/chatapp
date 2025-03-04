const express = require("express");
const { registerUser, authUser, searchUser, updateUserData } = require("../controller/user.controller");
const { authUserMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

router.route("/").post(registerUser).get(searchUser).put(updateUserData);
router.route("/login").post(authUser);

module.exports = router;
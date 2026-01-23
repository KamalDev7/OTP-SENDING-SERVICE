const express = require("express");
const router = express.Router();
const user = require("../controllers/usersControllers");

router.get("/status/:email",user.getUserStatus);
router.get("/getAllUsers",user.getAllUsers);
router.post("/changeUserRole",user.changeUserRole);
router.post("/setUserStatus",user.setUserStatus);

module.exports = router;
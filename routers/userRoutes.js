const express = require("express");
const router = express.Router();
const user = require("../controllers/usersControllers");

router.get("/getAllUsers",user.getAllUsers);
router.post("/changeUserRole",user.changeUserRole);

module.exports = router;
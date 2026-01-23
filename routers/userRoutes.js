const express = require("express");
const router = express.Router();
const user = require("../controllers/usersControllers");

router.get("/getAllUsers",user.getAllUsers);
router.post("/changeUserRoleToDealer",user.changeUserRoleToDealer);

module.exports = router;
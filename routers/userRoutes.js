const express = require("express");
const router = express.Router();
const user = require("../controllers/usersControllers");

router.get("/getAllUsers",user.getAllUsers);
router.post("/changeUserRole",user.changeUserRole);
router.post("/getUserPermissions",user.getUserPermissions);
router.post("/grantPermissionToUser",user.grantPermissionToUser);

module.exports = router;
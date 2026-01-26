const express = require("express");
const router = express.Router();
const user = require("../controllers/usersControllers");

router.get("/getAllUsers",user.getAllUsers);
router.put("/changeUserRole",user.changeUserRole);
router.post("/getUserPermissions",user.getUserPermissions);
router.put("/grantPermissionToUser",user.grantPermissionToUser);

module.exports = router;
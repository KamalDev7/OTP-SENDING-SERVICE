const express = require("express");
const router = express.Router();
const auth = require("../controllers/userControllersAuth");

router.post("/send-otp", auth.sendOTP);
router.post("/verify-otp", auth.verifyOtp);
router.post("/createUser",auth.createUser);
router.get("/user/status/:email",auth.getUserStatus);
router.get("/users/getAllUsers",auth.getAllUsers);
router.post("/users/changeUserRole",auth.changeUserRole);
router.post("/users/setUserStatus",auth.setUserStatus);


module.exports = router;




const express = require("express");
const router = express.Router();
const auth = require("../controllers/userControllersAuth");

router.post("/send-otp", auth.sendOTP);
router.post("/verify-otp", auth.verifyOtp);
router.post("/createUser",auth.createUser);

module.exports = router;




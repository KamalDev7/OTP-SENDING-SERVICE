const express = require("express");
const router = express.Router();
const auth = require("../controllers/userControllers");

router.post("/send-otp", auth.sendOTP);
router.post("/verify-otp", auth.verifyOtp);
router.get("/profile",auth.getProfiles);
router.post("/createUser",auth.createUser);

module.exports = router;
const express = require("express");
const router = express.Router();
const auth = require("../controllers/userControllers");

router.post("/send-otp", auth.sendOTP);
router.post("/verify-otp", auth.verifyOtp);
router.get("/profile",auth.getProfiles);
router.get("/send-mail",auth.sendMail);

module.exports = router;
const express = require("express");
const router = express.Router();
const auth = require("../controllers/userControllers");

router.post("/send-otp", auth.sendOTP);
router.post("/verify-otp", auth.verifyOtp);
router.get("/profile",auth.getProfiles);
router.post("/createUser",auth.createUser);
router.post("/subscription-create-order",auth.subscription_create_order);
// router.get("/subscription-verify-order/:orderId",auth.subscription_verify_order);
// router.get("/invoice/:orderId",auth.invoice2);

module.exports = router;
const express = require("express");
const router = express.Router();
const auth = require("../controllers/userControllers");

router.post("/send-otp", auth.sendOTP);
router.post("/verify-otp", auth.verifyOtp);
router.post("/createUser",auth.createUser);
router.get("/user/status/:email",auth.getUserStatus);
router.get("/users/getAllUsers",auth.getAllUsers);
router.post("/users/changeUserRole",auth.changeUserRole);

// Subscription and cashfree
router.post("/subscription-create-order",auth.subscription_create_order);
router.get("/subscription-verify-order/:orderId",auth.subscription_verify_order);
router.get("/invoice/:orderId",auth.invoice);

module.exports = router;




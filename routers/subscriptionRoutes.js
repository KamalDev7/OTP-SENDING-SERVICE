const express = require("express");
const router = express.Router();
const payment = require("../controllers/subscriptionControllers");

router.post("/subscription-create-order",payment.subscription_create_order);
router.get("/subscription-verify-order/:orderId",payment.subscription_verify_order);
router.get("/invoice/:orderId",payment.invoice);

module.exports = router;

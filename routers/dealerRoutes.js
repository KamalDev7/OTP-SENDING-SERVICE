const express = require("express");
const router = express.Router();
const dealer = require("../controllers/dealerControllers");


router.post("/registerBusiness",dealer.registerBusiness);

module.exports = router;
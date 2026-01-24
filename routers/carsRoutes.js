const express = require("express");
const router = express.Router();
const carsControllers = require("../controllers/carsControllers");


router.post("/addNewCar",carsControllers.addCar);

module.exports = router;
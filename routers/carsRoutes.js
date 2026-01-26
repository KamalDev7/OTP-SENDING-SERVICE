
const express = require("express");
const router = express.Router();
const cars = require("../controllers/carsControllers");

router.post("/addNewCar", cars.addCar);
router.post("/getDealerCars", cars.getDealerCars);
router.post("/updateCar", cars.updateCar);
router.delete("/deleteCar", cars.deleteCar);
router.get("/getAllCars",cars.getAllCars);

module.exports = router;
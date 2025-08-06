import express from "express";
import { getVehicleColors, getVehicleBrands } from "../controllers/dataController.js";

const router = express.Router();

router.get("/colors", getVehicleColors); 
router.get("/brands", getVehicleBrands); 

export default router; 
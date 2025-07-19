import express from "express";
import { getVehicles, getVehicleById, getVehiclesByUserId,createVehicle, updateVehicle, deleteVehicle } from "../controllers/vehicleController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", createVehicle);
router.get("/", getVehicles);
router.get("/:id", getVehicleById);
router.get("/user/:userId", getVehiclesByUserId);
router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

export default router;
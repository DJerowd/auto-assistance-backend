import express from "express";
import { 
    getVehicles, 
    getVehicleById, 
    getVehiclesByUserId,
    createVehicle, 
    updateVehicle, 
    deleteVehicle 
} from "../controllers/vehicleController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { validateBody, vehicleSchema } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Todas as rotas de veículos são protegidas
router.use(verifyToken);

router.get("/", getVehicles);
router.get("/:id", getVehicleById);
router.get("/user/:userId", getVehiclesByUserId);
router.post("/", validateBody(vehicleSchema, true), createVehicle);
router.put("/:id", validateBody(vehicleSchema, false), updateVehicle);
router.delete("/:id", deleteVehicle);

export default router;
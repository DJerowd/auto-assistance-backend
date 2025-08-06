import express from "express";
import { 
    getVehicles, 
    getVehicleById, 
    getVehiclesByUserId,
    createVehicle, 
    updateVehicle, 
    deleteVehicle,
    deleteVehicleImage
} from "../controllers/vehicleController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { validateBody, vehicleSchema } from "../middlewares/validationMiddleware.js";
import { uploadVehicleImage, handleUploadError } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Todas as rotas de veículos requerem autenticação
router.use(verifyToken);

// GET all vehicles (apenas do usuário logado)
router.get("/", getVehicles);

// GET vehicle by ID (apenas se pertencer ao usuário logado)
router.get("/:id", getVehicleById);

// GET vehicles by user ID (apenas se for o próprio usuário)
router.get("/user/:userId", getVehiclesByUserId);

// CREATE vehicle (apenas para o usuário logado) - com upload de imagem
router.post("/", uploadVehicleImage, handleUploadError, validateBody(vehicleSchema, false), createVehicle);

// UPDATE vehicle (apenas se pertencer ao usuário logado) - com upload de imagem
router.put("/:id", uploadVehicleImage, handleUploadError, validateBody(vehicleSchema, false), updateVehicle);

// DELETE vehicle (apenas se pertencer ao usuário logado)
router.delete("/:id", deleteVehicle);

// DELETE vehicle image (apenas se pertencer ao usuário logado)
router.delete("/:id/image", deleteVehicleImage);

export default router;
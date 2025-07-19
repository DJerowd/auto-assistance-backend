import express from "express";
import { createUser, loginUser, getUsers, getCurrentUser, refreshToken, getUserById, updateUser, deleteUser } from "../controllers/userController.js";
import { verifyToken, verifyOwnership } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Rotas públicas
router.post("/", createUser);
router.post("/login", loginUser);

// Rotas protegidas
router.get("/", verifyToken, getUsers);
router.get("/:id", verifyToken, getUserById);
router.get("/me", verifyToken, getCurrentUser);
router.get("/refresh", verifyToken, refreshToken);

// Rotas que requerem autenticação e verificação de propriedade
router.put("/:id", verifyToken, verifyOwnership, updateUser);
router.delete("/:id", verifyToken, verifyOwnership, deleteUser);

export default router; 
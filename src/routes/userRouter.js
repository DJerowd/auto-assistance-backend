import express from "express";
import { 
    getUsers, 
    getUserById, 
    getCurrentUser,
    createUser, 
    updateUser, 
    deleteUser, 
    loginUser,
    refreshToken
} from "../controllers/userController.js";
import { verifyToken, verifyOwnership } from "../middlewares/authMiddleware.js";
import { validateBody, userSchema } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Rotas públicas
router.post("/auth/register", validateBody(userSchema, true), createUser); // Registro
router.post("/auth/login", loginUser); // Login

// Rotas protegidas
router.get("/", verifyToken, getUsers); // Lista todos os usuários (requer token)
router.get("/me", verifyToken, getCurrentUser); // Usuário atual
router.get("/refresh", verifyToken, refreshToken); // Renovar token
router.get("/:id", verifyToken, getUserById); // Buscar usuário por ID

// Rotas que requerem autenticação e verificação de propriedade
router.put("/:id", verifyToken, verifyOwnership, validateBody(userSchema, false), updateUser); // Atualizar usuário
router.delete("/:id", verifyToken, verifyOwnership, deleteUser); // Deletar usuário

export default router; 
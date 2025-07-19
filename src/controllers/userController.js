import {db} from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendSuccess, sendError } from "../middlewares/responseMiddleware.js";

// CREATE USER (REGISTER)
export const createUser = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return sendError(res, "Campos obrigatórios: name, email, password", 400);
    try {
        const checkEmailQuery = "SELECT id FROM users WHERE email = ?";
        db.query(checkEmailQuery, [email], (err, data) => {
            if (err) return sendError(res, "Erro interno no servidor", 500);
            if (data.length > 0) return sendError(res, "Email já cadastrado", 400);
            bcrypt.hash(password, 10, (err, hash) => {
                if (err)  return sendError(res, "Erro interno no servidor", 500);
                const q = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
                const values = [name, email, hash];
                db.query(q, values, (err, data) => {
                    if (err) return sendError(res, "Erro interno no servidor", 500);
                    return sendSuccess(res, "Usuário criado com sucesso", { id: data.insertId, name, email }, 201);
                });
            });
        });
    } catch (error) {
        return sendError(res, "Erro interno no servidor", 500);
    }
};

// LOGIN USER
export const loginUser = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, "Campos obrigatórios: email, password", 400);
    const q = "SELECT * FROM users WHERE email = ?";
    db.query(q, [email], (err, data) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        if (data.length === 0) return sendError(res, "Email ou senha incorretos", 401);
        const user = data[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return sendError(res, "Erro interno no servidor", 500);
            if (!isMatch) return sendError(res, "Email ou senha incorretos", 401);
            const token = jwt.sign(
                { id: user.id, email: user.email, name: user.name },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );
            return sendSuccess(res, "Login realizado com sucesso", {
                user: { id: user.id, name: user.name, email: user.email },
                token
            });
        });
    });
};

// GET ALL USERS com paginação e filtros
export const getUsers = (req, res) => {
    const { page = 1, limit = 10, name, email } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let filters = "1=1";
    let values = [];
    if (name) {
        filters += " AND name LIKE ?";
        values.push(`%${name}%`);
    }
    if (email) {
        filters += " AND email LIKE ?";
        values.push(`%${email}%`);
    }
    const countQuery = `SELECT COUNT(*) as total FROM users WHERE ${filters}`;
    db.query(countQuery, values, (err, countResult) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        const total = countResult[0].total;
        if (total === 0) return sendError(res, "Não há usuários cadastrados", 204);
        const totalPages = Math.ceil(total / parseInt(limit));
        const dataQuery = `SELECT id, name, email FROM users WHERE ${filters} LIMIT ? OFFSET ?`;
        db.query(dataQuery, [...values, parseInt(limit), offset], (err, data) => {
            if (err) return sendError(res, "Erro interno no servidor", 500);
            return sendSuccess(res, "Usuários encontrados", {
                users: data,
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages
            });
        });
    });
};

// GET USER BY ID
export const getUserById = (req, res) => {
    const userId = req.params.id;
    const q = "SELECT id, name, email FROM users WHERE id = ?";
    db.query(q, [userId], (err, data) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        if (data.length === 0) return sendError(res, "Usuário não encontrado", 404);
        return sendSuccess(res, "Usuário encontrado", data[0]);
    });
};

// GET CURRENT USER (from JWT token)
export const getCurrentUser = (req, res) => {
    const userId = req.user.id;
    const q = "SELECT id, name, email FROM users WHERE id = ?";
    db.query(q, [userId], (err, data) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        if (data.length === 0) return sendError(res, "Usuário não encontrado", 404);
        return sendSuccess(res, "Usuário encontrado", data[0]);
    });
};

// REFRESH TOKEN
export const refreshToken = (req, res) => {
    const userId = req.user.id;
    const q = "SELECT id, name, email FROM users WHERE id = ?";
    db.query(q, [userId], (err, data) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        if (data.length === 0) return sendError(res, "Usuário não encontrado", 404);
        const user = data[0];
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );
        return sendSuccess(res, "Token renovado com sucesso", {
            user: { id: user.id, name: user.name, email: user.email },
            token
        });
    });
};

// UPDATE USER
export const updateUser = async (req, res) => {
    const userId = req.params.id;
    const { name, email, password } = req.body;
    if (!name || !email) return sendError(res, "Campos obrigatórios: name, email", 400);
    try {
        const checkEmailQuery = "SELECT id FROM users WHERE email = ? AND id != ?";
        db.query(checkEmailQuery, [email, userId], (err, data) => {
            if (err) return sendError(res, "Erro interno no servidor", 500);
            if (data.length > 0) return sendError(res, "Email já cadastrado", 400);
            if (password) {
                bcrypt.hash(password, 10, (err, hash) => {
                    if (err) return sendError(res, "Erro interno no servidor", 500);
                    const q = "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?";
                    const values = [name, email, hash, userId];
                    db.query(q, values, (err, data) => {
                        if (err) return sendError(res, "Erro interno no servidor", 500);
                        if (data.affectedRows === 0) return sendError(res, "Usuário não encontrado", 404);
                        return sendSuccess(res, "Usuário atualizado com sucesso");
                    });
                });
            } else {
                const q = "UPDATE users SET name = ?, email = ? WHERE id = ?";
                const values = [name, email, userId];
                db.query(q, values, (err, data) => {
                    if (err) return sendError(res, "Erro interno no servidor", 500);
                    if (data.affectedRows === 0) return sendError(res, "Usuário não encontrado", 404);
                    return sendSuccess(res, "Usuário atualizado com sucesso");
                });
            }
        });
    } catch (error) {
        return sendError(res, "Erro interno no servidor", 500);
    }
};

// DELETE USER
export const deleteUser = (req, res) => {
    const userId = req.params.id;
    const q = "DELETE FROM users WHERE id = ?";
    db.query(q, [userId], (err, data) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        if (data.affectedRows === 0) return sendError(res, "Usuário não encontrado", 404);
        return sendSuccess(res, "Usuário deletado com sucesso");
    });
};
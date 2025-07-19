import {db} from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// CREATE USER (REGISTER)
export const createUser = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Campos obrigatórios: name, email, password" });
    try {
        const checkEmailQuery = "SELECT id FROM users WHERE email = ?";
        db.query(checkEmailQuery, [email], (err, data) => {
            if (err) return res.status(500).json({ message: "Erro interno no servidor" });
            if (data.length > 0) return res.status(400).json({ message: "Email já cadastrado" });
            bcrypt.hash(password, 10, (err, hash) => {
                if (err)  return res.status(500).json({ message: "Erro interno no servidor" });
                const q = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
                const values = [name, email, hash];
                db.query(q, values, (err, data) => {
                    if (err) return res.status(500).json({ message: "Erro interno no servidor" });
                    return res.status(201).json({ 
                        message: "Usuário criado com sucesso",
                        user: { id: data.insertId, name: name, email: email }
                    });
                });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: "Erro interno no servidor" });
    }
};

// LOGIN USER
export const loginUser = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Campos obrigatórios: email, password" });
    const q = "SELECT * FROM users WHERE email = ?";
    db.query(q, [email], (err, data) => {
        if (err) return res.status(500).json({ message: "Erro interno no servidor" });
        if (data.length === 0) return res.status(401).json({ message: "Email ou senha incorretos" });
        const user = data[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: "Erro interno no servidor" });
            if (!isMatch) return res.status(401).json({ message: "Email ou senha incorretos" });
            const token = jwt.sign(
                { id: user.id, email: user.email, name: user.name },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );
            return res.status(200).json({
                message: "Login realizado com sucesso",
                user: { id: user.id, name: user.name, email: user.email },
                token: token
            });
        });
    });
};

// GET ALL USERS
export const getUsers = (_, res) => {
    const q = "SELECT id, name, email FROM users";
    db.query(q, (err, data) => {
        if (err) return res.status(500).json({ message: "Erro interno no servidor" });
        if (data.length === 0) return res.status(204).json({ message: "Não há usuários cadastrados" });
        return res.status(200).json(data);
    });
};

// GET USER BY ID
export const getUserById = (req, res) => {
    const userId = req.params.id;
    const q = "SELECT id, name, email FROM users WHERE id = ?";
    
    db.query(q, [userId], (err, data) => {
        if (err) return res.status(500).json({ message: "Erro interno no servidor" });
        if (data.length === 0) return res.status(404).json({ message: "Usuário não encontrado" });
        return res.status(200).json(data[0]);
    });
};

// GET CURRENT USER (from JWT token)
export const getCurrentUser = (req, res) => {
    const userId = req.user.id;
    const q = "SELECT id, name, email FROM users WHERE id = ?";
    db.query(q, [userId], (err, data) => {
        if (err) return res.status(500).json({ message: "Erro interno no servidor" });
        if (data.length === 0) return res.status(404).json({ message: "Usuário não encontrado" });
        return res.status(200).json(data[0]);
    });
};

// UPDATE USER
export const updateUser = async (req, res) => {
    const userId = req.params.id;
    const { name, email, password } = req.body;
    if (!name || !email) return res.status(400).json({ message: "Campos obrigatórios: name, email" });
    try {
        const checkEmailQuery = "SELECT id FROM users WHERE email = ? AND id != ?";
        db.query(checkEmailQuery, [email, userId], (err, data) => {
            if (err) return res.status(500).json({ message: "Erro interno no servidor" });
            if (data.length > 0) return res.status(400).json({ message: "Email já cadastrado" });
            if (password) {
                bcrypt.hash(password, 10, (err, hash) => {
                    if (err) return res.status(500).json({ message: "Erro interno no servidor" });
                    const q = "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?";
                    const values = [name, email, hash, userId];
                    db.query(q, values, (err, data) => {
                        if (err) return res.status(500).json({ message: "Erro interno no servidor" });
                        if (data.affectedRows === 0) return res.status(404).json({ message: "Usuário não encontrado" });
                        return res.status(200).json({ message: "Usuário atualizado com sucesso" });
                    });
                });
            } else {
                const q = "UPDATE users SET name = ?, email = ? WHERE id = ?";
                const values = [name, email, userId];
                db.query(q, values, (err, data) => {
                    if (err) return res.status(500).json({ message: "Erro interno no servidor" });
                    if (data.affectedRows === 0) return res.status(404).json({ message: "Usuário não encontrado" });
                    return res.status(200).json({ message: "Usuário atualizado com sucesso" });
                });
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Erro interno no servidor" });
    }
};

// DELETE USER
export const deleteUser = (req, res) => {
    const userId = req.params.id;
    const q = "DELETE FROM users WHERE id = ?";
    db.query(q, [userId], (err, data) => {
        if (err) return res.status(500).json({ message: "Erro interno no servidor" });
        if (data.affectedRows === 0) return res.status(404).json({ message: "Usuário não encontrado" });
        return res.status(200).json({ message: "Usuário deletado com sucesso" });
    });
};

// REFRESH TOKEN
export const refreshToken = (req, res) => {
    const userId = req.user.id;
    const q = "SELECT id, name, email FROM users WHERE id = ?";
    db.query(q, [userId], (err, data) => {
        if (err) return res.status(500).json({ message: "Erro interno no servidor" });
        if (data.length === 0) return res.status(404).json({ message: "Usuário não encontrado" });
        const user = data[0];
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );
        return res.status(200).json({
            message: "Token renovado com sucesso",
            user: { id: user.id, name: user.name, email: user.email },
            token: token
        });
    });
}; 
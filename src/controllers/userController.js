import {db} from "../db.js";
import bcrypt from "bcrypt";

// GET ALL USERS
export const getUsers = (_, res) => {
    const q = "SELECT id, name, email FROM users";
    db.query(q, (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Erro interno no servidor" });
        }
        if (data.length === 0) return res.status(204).json({ message: "Não há usuários cadastrados" });
        return res.status(200).json(data);
    });
};
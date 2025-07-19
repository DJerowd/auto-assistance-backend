import {db} from "../db.js";
import { sendSuccess, sendError } from "../middlewares/responseMiddleware.js";

// GET ALL VEHICLES (apenas veículos do usuário logado) com paginação e filtros
export const getVehicles = (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10, brand, model, color, licensePlate } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let filters = "userId = ?";
    let values = [userId];
    if (brand) {
        filters += " AND brand LIKE ?";
        values.push(`%${brand}%`);
    }
    if (model) {
        filters += " AND model LIKE ?";
        values.push(`%${model}%`);
    }
    if (color) {
        filters += " AND color LIKE ?";
        values.push(`%${color}%`);
    }
    if (licensePlate) {
        filters += " AND licensePlate LIKE ?";
        values.push(`%${licensePlate}%`);
    }
    const countQuery = `SELECT COUNT(*) as total FROM vehicles_table WHERE ${filters}`;
    db.query(countQuery, values, (err, countResult) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        const total = countResult[0].total;
        if (total === 0) return sendError(res, "Não há veículos cadastrados", 204);
        const totalPages = Math.ceil(total / parseInt(limit));
        const dataQuery = `SELECT * FROM vehicles_table WHERE ${filters} LIMIT ? OFFSET ?`;
        db.query(dataQuery, [...values, parseInt(limit), offset], (err, data) => {
            if (err) return sendError(res, "Erro interno no servidor", 500);
            return sendSuccess(res, "Veículos encontrados", {
                vehicles: data,
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages
            });
        });
    });
};

// GET VEHICLE BY ID (apenas se pertencer ao usuário logado)
export const getVehicleById = (req, res) => {
    const vehicleId = req.params.id;
    const userId = req.user.id;
    const q = "SELECT * FROM vehicles_table WHERE id = ? AND userId = ?";
    db.query(q, [vehicleId, userId], (err, data) => {
        if (err)  return sendError(res, "Erro interno no servidor", 500);
        if (data.length === 0) return sendError(res, "Veículo não encontrado", 404);
        return sendSuccess(res, "Veículo encontrado", data[0]);
    });
};

// GET VEHICLES BY USER ID (apenas se for o próprio usuário)
export const getVehiclesByUserId = (req, res) => {
    const requestedUserId = req.params.userId;
    const currentUserId = req.user.id;
    if (requestedUserId != currentUserId) return sendError(res, "Acesso negado: você só pode ver seus próprios veículos", 403);
    const q = "SELECT * FROM vehicles_table WHERE userId = ?";
    db.query(q, [requestedUserId], (err, data) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        if (data.length === 0) return sendError(res, "Não há veículos cadastrados para este usuário", 204);
        return sendSuccess(res, "Veículos encontrados", data);
    });
};

// CREATE VEHICLE (apenas para o usuário logado)
export const createVehicle = (req, res) => {
    const userId = req.user.id;
    const { name, brand, model, version, color, licensePlate, mileage } = req.body;
    if (!brand || !model || !color) return sendError(res, "Campos obrigatórios: brand, model, color", 400);
    const q = "INSERT INTO vehicles_table (userId, name, brand, model, version, color, licensePlate, mileage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [userId, name, brand, model, version, color, licensePlate, mileage];
    db.query(q, values, (err, data) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        return sendSuccess(res, "Veículo criado com sucesso", { id: data.insertId }, 201);
    });
};

// UPDATE VEHICLE (apenas se pertencer ao usuário logado)
export const updateVehicle = (req, res) => {
    const vehicleId = req.params.id;
    const userId = req.user.id;
    const { name, brand, model, version, color, licensePlate, mileage } = req.body;
    if (!brand || !model || !color) return sendError(res, "Campos obrigatórios: brand, model, color", 400);
    const q = "UPDATE vehicles_table SET name = ?, brand = ?, model = ?, version = ?, color = ?, licensePlate = ?, mileage = ? WHERE id = ? AND userId = ?";
    const values = [name, brand, model, version, color, licensePlate, mileage, vehicleId, userId];
    db.query(q, values, (err, data) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        if (data.affectedRows === 0) return sendError(res, "Veículo não encontrado ou você não tem permissão para editá-lo", 404);
        return sendSuccess(res, "Veículo atualizado com sucesso");
    });
};

// DELETE VEHICLE (apenas se pertencer ao usuário logado)
export const deleteVehicle = (req, res) => {
    const vehicleId = req.params.id;
    const userId = req.user.id;
    const q = "DELETE FROM vehicles_table WHERE id = ? AND userId = ?";
    db.query(q, [vehicleId, userId], (err, data) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        if (data.affectedRows === 0) return sendError(res, "Veículo não encontrado ou você não tem permissão para deletá-lo", 404);
        return sendSuccess(res, "Veículo deletado com sucesso");
    });
};
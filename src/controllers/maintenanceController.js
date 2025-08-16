import {db} from "../db.js";
import { sendSuccess, sendError } from "../middlewares/responseMiddleware.js";

export const getMaintenanceReminders = (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10, vehicleId, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let filters = "v.userId = ?";
    let values = [userId];
    if (vehicleId) {
        filters += " AND mt.vehicle_id LIKE ?";
        values.push(`%${vehicleId}%`);
    }
    if (search) {
        filters += " AND mt.title LIKE ?";
        values.push(`%${search}%`);
    }
    const countQuery = `SELECT COUNT(*) as total FROM maintenances_table mt JOIN vehicles_table v ON v.id = mt.vehicle_id WHERE ${filters}`;
    db.query(countQuery, values, (err, countResult) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        const total = countResult[0].total;
        if (total === 0) return sendError(res, "Nenhum lembrete encontrado", 404);
        const totalPages = Math.ceil(total / parseInt(limit));
        const dataQuery = `
            SELECT mt.*,
                (CASE WHEN mt.type 
                    IN ('km', 'km_time') THEN mt.km_target - (v.mileage - mt.last_km_record) ELSE NULL END) 
                AS km_remaining,
                (CASE WHEN mt.type 
                    IN ('time', 'km_time') THEN mt.days_target - DATEDIFF(CURDATE(), mt.last_maintenance_date) ELSE NULL END) 
                AS days_remaining
            FROM maintenances_table mt
            JOIN vehicles_table v ON v.id = mt.vehicle_id
            WHERE ${filters}
            LIMIT ? OFFSET ?
        `;
        db.query(dataQuery, [...values, parseInt(limit), offset], (err, data) => {
            if (err) return sendError(res, "Erro interno no servidor", 500);
            return sendSuccess(res, "Lembretes encontrados", {
                reminders: data,
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages
            });
        });
    });
};

export const getMaintenanceReminderById = (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const q = ` SELECT mt.*  FROM maintenances_table mt JOIN vehicles_table v ON v.id = mt.vehicle_id WHERE mt.id = ? AND v.userId = ?`;
    db.query(q, [id, userId], (err, data) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        if (data.length === 0) return sendError(res, "Lembrete não encontrado", 404);
        return sendSuccess(res, "Lembrete encontrado", data[0]);
    });
};

export const createMaintenanceReminder = (req, res) => {
    const userId = req.user.id;
    const { vehicle_id, title, description, type, km_target, days_target, last_km_record, last_maintenance_date } = req.body;
    if (!vehicle_id || !title || !type) return sendError(res, "Campos obrigatórios: vehicle_id, title, type", 400);
    // Verificar se veículo pertence ao usuário
    const checkVehicleQuery = "SELECT id FROM vehicles_table WHERE id = ? AND userId = ?";
    db.query(checkVehicleQuery, [vehicle_id, userId], (err, result) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        if (result.length === 0) return sendError(res, "Veículo não encontrado ou não pertence ao usuário", 403);
        const insertQuery = `
            INSERT INTO maintenances_table 
                (vehicle_id, title, description, type, km_target, days_target, last_km_record, last_maintenance_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(insertQuery, [
            vehicle_id, title, description, type, km_target || null, days_target || null,
            last_km_record || null, last_maintenance_date || null
        ], (err, data) => {
            if (err) return sendError(res, "Erro interno no servidor", 500);
            return sendSuccess(res, "Lembrete criado com sucesso", { id: data.insertId }, 201);
        });
    });
};

export const updateMaintenanceReminder = (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { vehicle_id, title, description, type, km_target, days_target, last_km_record, last_maintenance_date } = req.body;
    if (!vehicle_id || !title || !type) return sendError(res, "Campos obrigatórios: vehicle_id, title, type", 400);
    const checkQuery = `SELECT mt.id FROM maintenances_table mt JOIN vehicles_table v ON v.id = mt.vehicle_id WHERE mt.id = ? AND v.userId = ?`;
    db.query(checkQuery, [id, userId], (err, result) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        if (result.length === 0) return sendError(res, "Lembrete não encontrado ou sem permissão", 404);
        const updateQuery = `
            UPDATE maintenances_table
            SET vehicle_id=?, title=?, description=?, type=?, km_target=?, days_target=?, last_km_record=?, last_maintenance_date=?, update_date=NOW()
            WHERE id=?
        `;
        db.query(updateQuery, [
            vehicle_id, title, description, type, km_target || null, days_target || null,
            last_km_record || null, last_maintenance_date || null, id
        ], (err) => {
            if (err) return sendError(res, "Erro interno no servidor", 500);
            return sendSuccess(res, "Lembrete atualizado com sucesso");
        });
    });
};

export const deleteMaintenanceReminder = (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const checkQuery = `SELECT mt.id FROM maintenances_table mt JOIN vehicles_table v ON v.id = mt.vehicle_id WHERE mt.id = ? AND v.userId = ?`;
    db.query(checkQuery, [id, userId], (err, result) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        if (result.length === 0) return sendError(res, "Lembrete não encontrado ou sem permissão", 404);
        const deleteQuery = "DELETE FROM maintenances_table WHERE id = ?";
        db.query(deleteQuery, [id], (err) => {
            if (err) return sendError(res, "Erro interno no servidor", 500);
            return sendSuccess(res, "Lembrete deletado com sucesso");
        });
    });
};
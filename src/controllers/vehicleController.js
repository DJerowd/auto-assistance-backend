import {db} from "../db.js";
import { sendSuccess, sendError } from "../middlewares/responseMiddleware.js";
import { getImageUrl } from "../middlewares/uploadMiddleware.js";
import fs from "fs";
import path from "path";

// GET ALL VEHICLES (apenas veículos do usuário logado) com paginação e filtros
export const getVehicles = (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10, brand, color, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let filters = "userId = ?";
    let values = [userId];
    if (brand) {
        filters += " AND brand LIKE ?";
        values.push(`%${brand}%`);
    }
    if (color) {
        filters += " AND color LIKE ?";
        values.push(`%${color}%`);
    }
    if (search) {
        filters += " AND (name LIKE ? OR model LIKE ? OR version LIKE ? OR licensePlate LIKE ?)";
        values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    const countQuery = `SELECT COUNT(*) as total FROM vehicles_table WHERE ${filters}`;
    db.query(countQuery, values, (err, countResult) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        const total = countResult[0].total;
        if (total === 0) return sendError(res, "Nenhum veículo encontrado", 404);
        const totalPages = Math.ceil(total / parseInt(limit));
        const dataQuery = `SELECT * FROM vehicles_table WHERE ${filters} LIMIT ? OFFSET ?`;
        db.query(dataQuery, [...values, parseInt(limit), offset], (err, data) => {
            if (err) return sendError(res, "Erro interno no servidor", 500);
            // Adicionar URLs completas das imagens
            const vehiclesWithImages = data.map(vehicle => ({
                ...vehicle,
                imageUrl: vehicle.imageUrl ? getImageUrl(vehicle.imageUrl) : null
            }));
            return sendSuccess(res, "Veículos encontrados", {
                vehicles: vehiclesWithImages,
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
        // Adicionar URL completa da imagem
        const vehicle = {
            ...data[0],
            imageUrl: data[0].imageUrl ? getImageUrl(data[0].imageUrl) : null
        };
        return sendSuccess(res, "Veículo encontrado", vehicle);
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
        // Adicionar URLs completas das imagens
        const vehiclesWithImages = data.map(vehicle => ({
            ...vehicle,
            imageUrl: vehicle.imageUrl ? getImageUrl(vehicle.imageUrl) : null
        }));
        return sendSuccess(res, "Veículos encontrados", vehiclesWithImages);
    });
};

// CREATE VEHICLE (apenas para o usuário logado)
export const createVehicle = (req, res) => {
    const userId = req.user.id;
    const { name, brand, model, version, color, licensePlate, year, mileage } = req.body;
    if (!brand || !model || !color) return sendError(res, "Campos obrigatórios: brand, model, color", 400);
    
    const imageUrl = req.file ? req.file.filename : null;
    if (licensePlate)  licensePlate = licensePlate.toUpperCase();
    
    const q = "INSERT INTO vehicles_table (userId, name, brand, model, version, color, licensePlate, year, mileage, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [userId, name, brand, model, version, color, licensePlate, year, mileage, imageUrl];
    db.query(q, values, (err, data) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        return sendSuccess(res, "Veículo criado com sucesso", { 
            id: data.insertId,
            imageUrl: imageUrl ? getImageUrl(imageUrl) : null
        }, 201);
    });
};

// UPDATE VEHICLE (apenas se pertencer ao usuário logado)
export const updateVehicle = (req, res) => {
    const vehicleId = req.params.id;
    const userId = req.user.id;
    const { name, brand, model, version, color, licensePlate, year, mileage } = req.body;
    if (!brand || !model || !color) return sendError(res, "Campos obrigatórios: brand, model, color", 400);
    
    const licensePlateUpper = licensePlate ? licensePlate.toUpperCase() : null;
    const newImageUrl = req.file ? req.file.filename : null;

    // Atualizar com nova imagem
    const updateWithImage = (imageUrl) => {
        const query = `UPDATE vehicles_table SET name = ?, brand = ?, model = ?, version = ?, color = ?, licensePlate = ?, year = ?, mileage = ?, imageUrl = ?, updatedAt = NOW() WHERE id = ? AND userId = ?`;
        const values = [name, brand, model, version, color, licensePlateUpper, year, mileage, imageUrl, vehicleId, userId];
        db.query(query, values, (err, data) => {
            if (err) return sendError(res, "Erro interno no servidor", 500);
            if (data.affectedRows === 0) 
                return sendError(res, "Veículo não encontrado ou você não tem permissão para editá-lo", 404);
            return sendSuccess(res, "Veículo atualizado com sucesso", {
                imageUrl: imageUrl ? getImageUrl(imageUrl) : null
            });
        });
    };
    
    // Se há nova imagem, deletar a antiga
    if (newImageUrl) {
        const getOldImageQuery = "SELECT imageUrl FROM vehicles_table WHERE id = ? AND userId = ?";
        db.query(getOldImageQuery, [vehicleId, userId], (err, data) => {
            if (err) return sendError(res, "Erro interno no servidor", 500);
            if (data.length === 0) return sendError(res, "Veículo não encontrado ou você não tem permissão para editá-lo", 404);
            // Deletar imagem antiga se existir
            if (data[0].imageUrl) {
                const oldImagePath = path.join("uploads", "vehicles", data[0].imageUrl);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updateWithImage(newImageUrl);
        });
    } else {
        // Atualizar sem mudar a imagem
        const q = `UPDATE vehicles_table SET name = ?, brand = ?, model = ?, version = ?, color = ?, licensePlate = ?, year = ?, mileage = ?, updatedAt = NOW() WHERE id = ? AND userId = ?`;
        const values = [name, brand, model, version, color, licensePlateUpper, year, mileage, vehicleId, userId];
        db.query(q, values, (err, data) => {
            if (err) return sendError(res, "Erro interno no servidor", 500);
            if (data.affectedRows === 0) return sendError(res, "Veículo não encontrado ou você não tem permissão para editá-lo", 404);
            return sendSuccess(res, "Veículo atualizado com sucesso");
        });
    }
};

// DELETE VEHICLE (apenas se pertencer ao usuário logado)
export const deleteVehicle = (req, res) => {
    const vehicleId = req.params.id;
    const userId = req.user.id;
    
    // Primeiro, buscar a imagem para deletá-la
    const getImageQuery = "SELECT imageUrl FROM vehicles_table WHERE id = ? AND userId = ?";
    db.query(getImageQuery, [vehicleId, userId], (err, data) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        if (data.length === 0) return sendError(res, "Veículo não encontrado ou você não tem permissão para deletá-lo", 404);
        
        // Deletar imagem se existir
        if (data[0].imageUrl) {
            const imagePath = path.join("uploads", "vehicles", data[0].imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        // Deletar veículo do banco
        const q = "DELETE FROM vehicles_table WHERE id = ? AND userId = ?";
        db.query(q, [vehicleId, userId], (err, data) => {
            if (err) return sendError(res, "Erro interno no servidor", 500);
            if (data.affectedRows === 0) return sendError(res, "Veículo não encontrado ou você não tem permissão para deletá-lo", 404);
            return sendSuccess(res, "Veículo deletado com sucesso");
        });
    });
};

// DELETE VEHICLE IMAGE (apenas se pertencer ao usuário logado)
export const deleteVehicleImage = (req, res) => {
    const vehicleId = req.params.id;
    const userId = req.user.id;
    
    const getImageQuery = "SELECT imageUrl FROM vehicles_table WHERE id = ? AND userId = ?";
    db.query(getImageQuery, [vehicleId, userId], (err, data) => {
        if (err) return sendError(res, "Erro interno no servidor", 500);
        if (data.length === 0) return sendError(res, "Veículo não encontrado ou você não tem permissão para editá-lo", 404);
        
        if (!data[0].imageUrl) {
            return sendError(res, "Veículo não possui imagem para deletar", 400);
        }
        
        // Deletar arquivo de imagem
        const imagePath = path.join("uploads", "vehicles", data[0].imageUrl);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        
        // Remover referência da imagem do banco
        const updateQuery = "UPDATE vehicles_table SET imageUrl = NULL WHERE id = ? AND userId = ?";
        db.query(updateQuery, [vehicleId, userId], (err, data) => {
            if (err) return sendError(res, "Erro interno no servidor", 500);
            return sendSuccess(res, "Imagem do veículo deletada com sucesso");
        });
    });
};
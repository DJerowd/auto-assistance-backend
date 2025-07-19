import {db} from "../db.js";

// GET ALL VEHICLES (apenas veículos do usuário logado)
export const getVehicles = (req, res) => {
    const userId = req.user.id;
    const q = "SELECT * FROM vehicles_table WHERE userId = ?";
    
    db.query(q, [userId], (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Erro interno no servidor" });
        }
        if (data.length === 0) return res.status(204).json({ message: "Não há veículos cadastrados" });
        return res.status(200).json(data);
    });
};

// GET VEHICLE BY ID (apenas se pertencer ao usuário logado)
export const getVehicleById = (req, res) => {
    const vehicleId = req.params.id;
    const userId = req.user.id;
    const q = "SELECT * FROM vehicles_table WHERE id = ? AND userId = ?";
    
    db.query(q, [vehicleId, userId], (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Erro interno no servidor" });
        }
        if (data.length === 0) {
            return res.status(404).json({ message: "Veículo não encontrado" });
        }
        return res.status(200).json(data[0]);
    });
};

// GET VEHICLES BY USER ID (apenas se for o próprio usuário)
export const getVehiclesByUserId = (req, res) => {
    const requestedUserId = req.params.userId;
    const currentUserId = req.user.id;
    
    if (requestedUserId != currentUserId) {
        return res.status(403).json({ message: "Acesso negado: você só pode ver seus próprios veículos" });
    }
    
    const q = "SELECT * FROM vehicles_table WHERE userId = ?";
    
    db.query(q, [requestedUserId], (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Erro interno no servidor" });
        }
        if (data.length === 0) {
            return res.status(204).json({ message: "Não há veículos cadastrados para este usuário" });
        }
        return res.status(200).json(data);
    });
};

// CREATE VEHICLE (apenas para o usuário logado)
export const createVehicle = (req, res) => {
    const userId = req.user.id;
    const { name, brand, model, version, color, licensePlate, mileage } = req.body;
    
    if (!brand || !model || !color) {
        return res.status(400).json({ message: "Campos obrigatórios: brand, model, color" });
    }
    
    const q = "INSERT INTO vehicles_table (userId, name, brand, model, version, color, licensePlate, mileage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [userId, name, brand, model, version, color, licensePlate, mileage];
    
    db.query(q, values, (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Erro interno no servidor" });
        }
        return res.status(201).json({ 
            message: "Veículo criado com sucesso",
            id: data.insertId 
        });
    });
};

// UPDATE VEHICLE (apenas se pertencer ao usuário logado)
export const updateVehicle = (req, res) => {
    const vehicleId = req.params.id;
    const userId = req.user.id;
    const { name, brand, model, version, color, licensePlate, mileage } = req.body;
    
    if (!brand || !model || !color) {
        return res.status(400).json({ message: "Campos obrigatórios: brand, model, color" });
    }
    
    const q = "UPDATE vehicles_table SET name = ?, brand = ?, model = ?, version = ?, color = ?, licensePlate = ?, mileage = ? WHERE id = ? AND userId = ?";
    const values = [name, brand, model, version, color, licensePlate, mileage, vehicleId, userId];
    
    db.query(q, values, (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Erro interno no servidor" });
        }
        if (data.affectedRows === 0) {
            return res.status(404).json({ message: "Veículo não encontrado ou você não tem permissão para editá-lo" });
        }
        return res.status(200).json({ message: "Veículo atualizado com sucesso" });
    });
};

// DELETE VEHICLE (apenas se pertencer ao usuário logado)
export const deleteVehicle = (req, res) => {
    const vehicleId = req.params.id;
    const userId = req.user.id;
    const q = "DELETE FROM vehicles_table WHERE id = ? AND userId = ?";
    
    db.query(q, [vehicleId, userId], (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Erro interno no servidor" });
        }
        if (data.affectedRows === 0) {
            return res.status(404).json({ message: "Veículo não encontrado ou você não tem permissão para deletá-lo" });
        }
        return res.status(200).json({ message: "Veículo deletado com sucesso" });
    });
};
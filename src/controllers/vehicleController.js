import {db} from "../db.js";

// GET ALL VEHICLES
export const getVehicles = (_, res) => {
    const q = "SELECT * FROM vehicles_table";
    db.query(q, (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Erro interno no servidor" });
        }
        if (data.length === 0) return res.status(204).json({ message: "Não há veículos cadastrados" });
        return res.status(200).json(data);
    });
};
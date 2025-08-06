import {db} from "../db.js";
import { sendSuccess, sendError } from "../middlewares/responseMiddleware.js";

export const getVehicleColors = (_, res) => {
    const q = "SELECT * FROM vehicles_colors";
    db.query(q, (err, data) => {
        if (err)  return sendError(res, "Erro interno no servidor", 500);
        if (data.length === 0) return sendError(res, "Dados não encontrados", 404);
        return sendSuccess(res, "Dados encontrados", data);
    });
};

export const getVehicleBrands = (_, res) => {
    const q = "SELECT * FROM vehicles_brands";
    db.query(q, (err, data) => {
        if (err)  return sendError(res, "Erro interno no servidor", 500);
        if (data.length === 0) return sendError(res, "Dados não encontrados", 404);
        return sendSuccess(res, "Dados encontrados", data);
    });
};
import express from "express";
import { createMaintenanceReminder, deleteMaintenanceReminder, getMaintenanceReminderById, getMaintenanceReminders, updateMaintenanceReminder } from "../controllers/maintenanceController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getMaintenanceReminders);

router.get("/:id", getMaintenanceReminderById);

router.post("/", createMaintenanceReminder);

router.put("/:id", updateMaintenanceReminder);

router.delete("/:id", deleteMaintenanceReminder);

export default router;
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import vehicleRouter from "./src/routes/vehicleRouter.js";
import maintenanceRouter from "./src/routes/maintenanceRouter.js";
import userRouter from "./src/routes/userRouter.js";
import dataRouter from "./src/routes/dataRouter.js"
import { errorHandler } from "./src/middlewares/responseMiddleware.js";

const server = express();

dotenv.config();

server.use(express.json());
server.use(cors());

// Servir arquivos estáticos (imagens)
server.use("/uploads", express.static("uploads"));

server.use("/vehicles", vehicleRouter);
server.use("/maintenances", maintenanceRouter);
server.use("/users", userRouter);
server.use("/data", dataRouter);

server.use(errorHandler);

server.listen(process.env.SERVER_PORT, () => console.log(`Server running on port ${process.env.SERVER_PORT}`));
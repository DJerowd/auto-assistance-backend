import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import vehicleRouter from "./src/routes/vehicleRouter.js";
import userRouter from "./src/routes/userRouter.js";
import { errorHandler } from "./src/middlewares/responseMiddleware.js";

const server = express();

dotenv.config();

server.use(express.json());
server.use(cors());
server.use("/vehicles", vehicleRouter);
server.use("/users", userRouter);

// Middleware global de erro (deve ser o último)
server.use(errorHandler);

server.listen(process.env.SERVER_PORT, () => console.log(`Server running on port ${process.env.SERVER_PORT}`));
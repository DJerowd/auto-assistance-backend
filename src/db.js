import mysql from "mysql";
import dotenv from "dotenv";
import { userSchema } from "../models/userSchema.js";
import { vehicleSchema } from "../models/vehicleSchema.js";

dotenv.config();

// CONECTION CONFIG
export const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Root141314",
    database: process.env.DB_NAME || "auto_assistance_schema"
});

// DATABASE AND TABLES LOADING
db.connect(function(err) {
    if (err) {  
        console.log(JSON.stringify(err));
        throw err;
    }
    db.query(userSchema, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            throw err;
        }
    });
    db.query(vehicleSchema, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            throw err;
        }
    });
});
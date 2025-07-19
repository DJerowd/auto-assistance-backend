import mysql from "mysql";

import { userSchema } from "../models/userSchema.js";
import { vehicleSchema } from "../models/vehicleSchema.js";

// CONECTION CONFIG
export const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Root141314",
    database: "auto_assistance_schema"
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
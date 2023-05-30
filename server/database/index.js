"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;
const connectionString = `mongodb://${dbHost}:${dbPort}/${dbName}`;
const conn = mongoose_1.default.connect(connectionString, {});
conn.then(() => {
    console.log("Successful database connection");
}).catch(error => console.log('Failed connection to database'));
exports.default = conn;

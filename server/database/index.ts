import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;

const connectionString = `mongodb://${dbHost}:${dbPort}/${dbName}`;

const conn:Promise<any> = mongoose.connect(connectionString, {});

conn.then(() => {
    console.log("Successful database connection");
}).catch(error => console.log('Failed connection to database'));

export default conn;
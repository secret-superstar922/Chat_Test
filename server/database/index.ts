import mongoose from "mongoose";

const conn:Promise<any> = mongoose.connect('mongodb://localhost:27017/chatAppDB', {});

conn.then(() => {
    console.log("Successful database connection");
}).catch(error => console.log('Failed connection to database'));

export default conn;
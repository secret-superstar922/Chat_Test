"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.static('public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
const wss = new ws_1.WebSocketServer({
    port: 8080
});
wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        const obj = JSON.parse(data);
        console.log(obj.command);
    });
});

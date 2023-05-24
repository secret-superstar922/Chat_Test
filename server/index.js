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
let clients = [];
wss.on('connection', (ws) => {
    ws.on('message', (str_data) => {
        const data_json = JSON.parse(str_data);
        if (data_json.command === "connect") {
            clients.push({ ws: ws, uuid: generateUserId(), username: data_json.data });
        }
        clients.forEach((client) => {
            console.log(client);
        });
    });
});
function generateUserId() {
    return Math.random().toString(36).substr(2, 8);
}

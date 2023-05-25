"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const database_1 = __importDefault(require("./database"));
const models_1 = require("./models");
const app = (0, express_1.default)();
app.use(express_1.default.static(`${__dirname}/public`));
app.use(body_parser_1.default.json());
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/login-page` + '/index.html');
});
app.get('/chat-page', (req, res) => {
    res.sendFile(`${__dirname}/public/chat-page` + '/chat-page.html');
});
app.post("/login", (req, res) => {
    models_1.User.findOne({ username: req.body.name })
        .then((user) => {
        if (!user) {
            const newUser = new models_1.User({
                username: req.body.name
            });
            newUser.save();
            res.send({ status: "200", success: true, data: req.body.name });
        }
        else {
            res.send({ status: "200", success: false, data: "The use has been taken!" });
        }
    }).catch(error => console.log(error));
});
const port = 3000;
database_1.default.then(() => __awaiter(void 0, void 0, void 0, function* () {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
})).catch(error => console.log('Server failed on started'));
const wss = new ws_1.WebSocketServer({
    port: 8080
});
let clients = [];
wss.on('connection', (ws) => {
    ws.on('message', (str_data) => {
        let isValidUser = true;
        const data_json = JSON.parse(str_data);
        if (data_json.command === "connect") {
            console.log(data_json.content);
        }
        clients.forEach(client => {
            if (client.username === data_json.content) {
                isValidUser = false;
            }
        });
        if (isValidUser) {
            const newClient = {
                ws: ws,
                uuid: generateUserId(),
                username: data_json.content
            };
            clients.forEach((client) => {
                client.ws.send(JSON.stringify({
                    type: "broadcast",
                    uuid: newClient.uuid,
                    username: newClient.username
                }));
            });
            clients.forEach((client) => {
                ws.send(JSON.stringify({
                    type: "addUserList",
                    uuid: client.uuid,
                    username: client.username
                }));
            });
            clients.push(newClient);
        }
    });
});
function generateUserId() {
    return Math.random().toString(36).substr(2, 8);
}

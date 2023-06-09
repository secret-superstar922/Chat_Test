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
const User_1 = require("./models/User");
const Message_1 = require("./models/Message");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
    User_1.User.findOne({ username: req.body.name })
        .then((user) => {
        if (!user) {
            const newUser = new User_1.User({
                username: req.body.name,
                uuid: req.body.uuid
            });
            newUser.save();
            res.send({
                status: "200",
                success: true,
                payload: req.body
            });
        }
        else {
            res.send({
                status: "200",
                success: false,
                payload: "The user has been taken!"
            });
        }
    }).catch(error => console.log(error));
});
app.post("/message", (req, res) => {
    const user1 = req.body.user1;
    const user2 = req.body.user2;
    Message_1.Message.find({
        $or: [
            {
                from: user1,
                to: user2
            },
            {
                from: user2,
                to: user1
            }
        ]
    }).then(messages => {
        res.send({
            payload: messages
        });
    });
});
app.post("/saveofflinemessage", (req, res) => {
    const messages = req.body;
    messages.map((message) => {
        const newMessage = new Message_1.Message({
            from: message.from.username,
            to: message.to.username,
            text: message.text,
            created_at: new Date()
        });
        newMessage.save();
    });
});
const port = process.env.PORT;
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
            clients.forEach(client => {
                if (client.username === data_json.username) {
                    isValidUser = false;
                }
            });
            if (isValidUser) {
                const newClient = {
                    ws: ws,
                    uuid: data_json.uuid,
                    username: data_json.username,
                    isOnline: true
                };
                clients.forEach((client) => {
                    client.ws.send(JSON.stringify({
                        type: "broadcast",
                        uuid: newClient.uuid,
                        username: newClient.username,
                        isOnline: newClient.isOnline
                    }));
                });
                clients.push(newClient);
                User_1.User.find().then(users => {
                    users.map(user => {
                        if (user.username !== newClient.username) {
                            ws.send(JSON.stringify({
                                type: "addUser",
                                uuid: user.uuid,
                                username: user.username,
                                isOnline: user.isOnline
                            }));
                        }
                    });
                }).catch(error => console.log('Failed to fetch all users from database'));
                User_1.User.findOneAndUpdate({ username: newClient.username }, { isOnline: true }, { new: true }).then(updatedUser => {
                    if (updatedUser) {
                    }
                    else {
                        console.log(`User not found.`);
                    }
                }).catch(error => {
                    console.error(`Error updating user: ${error}`);
                });
            }
            else {
                User_1.User.findOneAndUpdate({ username: data_json.username }, { isOnline: true }, { new: true }).then(updatedUser => {
                    if (updatedUser) {
                        User_1.User.find().then(users => {
                            users.map(user => {
                                if (user.username !== data_json.username) {
                                    ws.send(JSON.stringify({
                                        type: "addUser",
                                        uuid: user.uuid,
                                        username: user.username,
                                        isOnline: user.isOnline
                                    }));
                                }
                            });
                        }).catch(error => console.log('Failed to fetch all users from database'));
                    }
                    else {
                        console.log(`User not found.`);
                    }
                }).catch(error => {
                    console.error(`Error updating user: ${error}`);
                });
                clients.map(client => client.ws.send(JSON.stringify({
                    type: "statusUpdate",
                    username: data_json.username,
                    uuid: data_json.uuid,
                    isOnline: true
                })));
            }
        }
        else if (data_json.command === "sendMessage") {
            clients.forEach((client) => {
                if (client.username === data_json.to.username) {
                    client.ws.send(JSON.stringify({
                        type: "message",
                        from: data_json.from.username,
                        text: data_json.text
                    }));
                    const newMessage = new Message_1.Message({
                        from: data_json.from.username,
                        to: data_json.to.username,
                        text: data_json.text,
                        created_at: new Date()
                    });
                    newMessage.save();
                }
            });
        }
    });
    ws.on('close', (code, reason) => {
        var _a, _b;
        const clientIndex = clients.findIndex((client) => client.ws === ws);
        const offlineUsername = (_a = clients.at(clientIndex)) === null || _a === void 0 ? void 0 : _a.username;
        const offlineUuid = (_b = clients.at(clientIndex)) === null || _b === void 0 ? void 0 : _b.uuid;
        if (clientIndex !== -1) {
            clients.splice(clientIndex, 1);
        }
        User_1.User.findOneAndUpdate({ username: offlineUsername }, { isOnline: false }, { new: true }).then(updatedUser => {
            if (updatedUser) {
            }
            else {
                console.log(`User not found.`);
            }
        }).catch(error => {
            console.error(`Error updating user: ${error}`);
        });
        clients.map(client => client.ws.send(JSON.stringify({
            type: "statusUpdate",
            username: offlineUsername,
            uuid: offlineUuid,
            isOnline: false
        })));
    });
});
exports.default = app;

import { WebSocket, WebSocketServer } from "ws";
import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import conn from './database';
import {User} from './models/User';
import { Message } from "./models/Message";

const app = express();
app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.json());

app.get('/', (req:Request, res:Response) => {
    res.sendFile(`${__dirname}/public/login-page` + '/index.html');
});

app.get('/chat-page', (req: Request, res: Response) => {
    res.sendFile(`${__dirname}/public/chat-page` + '/chat-page.html');
});

app.post("/login", (req: Request, res: Response) => {
    console.log(req.body);
    User.findOne({username: req.body.name})
        .then((user) => {
            if(!user) {
                const newUser = new User({
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

app.post("/message", (req: Request, res: Response) => {
    const user1: string = req.body.user1;
    const user2: string = req.body.user2;

    Message.find({
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
    })
});

app.post("/saveofflinemessage", (req: Request, res: Response) => {
    const messages = req.body;

    messages.map((message: any) => {
        const newMessage = new Message({
            from: message.from.username,
            to: message.to.username,
            text: message.text,
            created_at: new Date()
        });
        newMessage.save();
    })
});

const port = 3000;
conn.then(async() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch(error => console.log('Server failed on started'));

const wss: WebSocketServer = new WebSocketServer({
    port:8080
});

interface client {
    ws: WebSocket,
    uuid: String,
    username: String,
    isOnline: Boolean
}

let clients: client[] = []

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (str_data: string)=>{
        let isValidUser: Boolean = true;
        const data_json = JSON.parse(str_data);

        if(data_json.command === "connect") {
            clients.forEach(client => {
                if(client.username === data_json.username) {
                    isValidUser = false;
                }
            });

            if(isValidUser) {
                const newClient: client = {
                    ws:ws,
                    uuid:data_json.uuid,
                    username: data_json.username,
                    isOnline: true
                }

                clients.forEach((client) => {
                    client.ws.send(JSON.stringify({
                        type: "broadcast",
                        uuid: newClient.uuid,
                        username: newClient.username,
                        isOnline: newClient.isOnline
                    }))
                });

                clients.push(newClient);
                User.find().then(users => {
                    users.map(user => {
                        if(user.username !== newClient.username) {
                            ws.send(JSON.stringify({
                                type: "addUser",
                                uuid: user.uuid,
                                username: user.username,
                                isOnline: user.isOnline
                            }));
                        }
                    });
                }).catch(error => console.log('Failed to fetch all users from database'));

                User.findOneAndUpdate(
                    {username: newClient.username},
                    {isOnline: true},
                    {new: true}
                ).then(updatedUser => {
                    if (updatedUser) {
                      } else {
                        console.log(`User not found.`);
                      }
                }).catch(error => {
                    console.error(`Error updating user: ${error}`);
                });
            } else {
                User.findOneAndUpdate(
                    {username: data_json.username},
                    {isOnline: true},
                    {new: true}
                ).then(updatedUser => {
                    if (updatedUser) {
                        User.find().then(users => {
                            users.map(user => {
                                if(user.username !== data_json.username) {
                                    console.log(user.isOnline);
                                    ws.send(JSON.stringify({
                                        type: "addUser",
                                        uuid: user.uuid,
                                        username: user.username,
                                        isOnline: user.isOnline
                                    }));
                                }
                            });
                        }).catch(error => console.log('Failed to fetch all users from database'));
                      } else {
                        console.log(`User not found.`);
                      }
                }).catch(error => {
                    console.error(`Error updating user: ${error}`);
                });

                clients.map(client => 
                    client.ws.send(JSON.stringify({
                        type: "statusUpdate",
                        username: data_json.username,
                        uuid: data_json.uuid,
                        isOnline: true
                    }))
                );
            }
        } else if(data_json.command === "sendMessage") {
            console.log(data_json);
            console.log(clients.length);
            clients.forEach((client) => {
                if(client.username === data_json.to.username) {
                    client.ws.send(JSON.stringify({
                        type: "message",
                        from: data_json.from.username,
                        text: data_json.text
                    }));

                    const newMessage = new Message({
                        from: data_json.from.username,
                        to: data_json.to.username,
                        text: data_json.text,
                        created_at: new Date()
                    });
                    newMessage.save();
                }
            })
        }
    });

    ws.on('close', (code: number, reason: string) => {
        const clientIndex = clients.findIndex((client) => client.ws === ws);
        const offlineUsername = clients.at(clientIndex)?.username;
        const offlineUuid = clients.at(clientIndex)?.uuid;

        if(clientIndex !== -1) {
            clients.splice(clientIndex, 1);
        }

        User.findOneAndUpdate(
            {username: offlineUsername},
            {isOnline: false},
            {new: true}
        ).then(updatedUser => {
            if (updatedUser) {
              } else {
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
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
                res.send({status: "200", success: true, payload:req.body});
            }
            else {
                res.send({status: "200", success: false, payload:"The use has been taken!"});
            }
        }).catch(error => console.log(error));
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
    username: String
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
                    username: data_json.username
                }
        
                clients.forEach((client) => {
                    client.ws.send(JSON.stringify({
                        type: "broadcast",
                        uuid: newClient.uuid,
                        username: newClient.username
                    }))
                });
        
                clients.forEach((client) => {
                    ws.send(JSON.stringify({
                        type: "addUserList",
                        uuid: client.uuid,
                        username: client.username
                    }));
                });

                clients.push(newClient);
            } else {
                clients.forEach((client) => {
                    if(client.username !== data_json.username) {
                        ws.send(JSON.stringify({
                            type: "addUserList",
                            uuid: client.uuid,
                            username: client.username
                        }));
                    }
                });
            }
        } else if(data_json.command === "sendMessage") {
            console.log(data_json);

            clients.forEach((client) => {
                if(client.uuid === data_json.to.uuid) {
                    client.ws.send(JSON.stringify({
                        type: "message",
                        from: data_json.from,
                        text: data_json.text
                    }));

                    const newMessage = new Message({
                        from: data_json.from,
                        to: data_json.to.username,
                        text: data_json.text,
                        created_at: new Date()
                    });
                    newMessage.save();
                }
            })
        }
    });
})


import { WebSocket, WebSocketServer } from "ws";
import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import conn from './database';
import {User} from './models';

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
    User.findOne({username: req.body.name})
        .then((user) => {
            if(!user) {
                const newUser = new User({
                    username: req.body.name
                });
                newUser.save();
                res.send({status: "200", success: true, data:req.body.name});
            }
            else {
                res.send({status: "200", success: false, data:"The use has been taken!"});
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
        
        if(data_json.command ==="connect") {
            console.log(data_json.content);
        }

        clients.forEach(client => {
            if(client.username === data_json.content) {
                isValidUser = false;
            }
        })

        if(isValidUser) {
            const newClient: client = {
                ws:ws,
                uuid:generateUserId(),
                username: data_json.content
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
        }
    });
})

function generateUserId(): String {
    return Math.random().toString(36).substr(2, 8);
}


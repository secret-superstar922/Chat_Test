import { WebSocket, WebSocketServer } from "ws";
import express, {Request, Response} from 'express';
import conn from './database';
import {User} from './models';

const app = express();
app.use(express.static('public'));
app.get('/', (req: Request, res: Response) => {
    res.sendFile(__dirname + '/index.html');
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
        const data_json = JSON.parse(str_data);
        if(data_json.command ==="connect") {
            let requestedUser:client = {ws:ws, uuid:generateUserId(), username:data_json.data};

            User.findOne({username: requestedUser.username})
                .then((user) => {
                    if(!user) {
                        const newUser = new User({
                            username:requestedUser.username
                        });
                        newUser.save();
                        clients.push(requestedUser);
                    }
                    else {
                        console.log("Username has been taken!");
                    }
                }).catch(error => console.log(error));
        }
        clients.forEach((client) => {
            console.log(client);
        });
    });
})

function generateUserId(): String {
    return Math.random().toString(36).substr(2, 8);
}


import { WebSocket, WebSocketServer } from "ws";
import express, {Request, Response} from 'express';

const app = express();
app.use(express.static('public'));
app.get('/', (req: Request, res: Response) => {
    res.sendFile(__dirname + '/index.html');
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const wss: WebSocketServer = new WebSocketServer({
    port:8080
});

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (data: string)=>{
        const obj = JSON.parse(data);
        console.log(obj.command);
    });
})


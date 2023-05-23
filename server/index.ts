import WebSocket, {WebSocketServer} from 'ws';

const wss: WebSocketServer = new WebSocketServer({
    port:8080
});

const ws: WebSocket = new WebSocket('ws://localhost:8080');
ws.on('open', () => {
    const data: Object = {
        command: "register",
        content: "",
    }
    const json: string = JSON.stringify(data);
    ws.send(json);
});

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (data: string)=>{
        const obj = JSON.parse(data);
        console.log(obj.command);
    });
})
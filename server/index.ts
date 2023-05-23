import WebSocket, {WebSocketServer} from 'ws';

const wss: WebSocketServer = new WebSocketServer({
    port:8080
});

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (data: string)=>{
        const obj = JSON.parse(data);
        console.log(obj.command);
    });
})
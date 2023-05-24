const ws:WebSocket = new WebSocket('ws://localhost:8080');
function login() {
    const inputElement = document.getElementById("username") as HTMLInputElement;
    const username = inputElement.value;
    console.log("username", username);
    const data: Object = {
        command: "connect",
        data: username,
    }
    const json: string = JSON.stringify(data);
    ws.send(json);
}
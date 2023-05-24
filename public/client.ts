function getValue() {
    const inputElement = document.getElementById("username") as HTMLInputElement;
    const username = inputElement.value;
    console.log("username", username);
    const ws:WebSocket = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
        const data: Object = {
            command: "register",
            data: username,
        }
        const json: string = JSON.stringify(data);
        ws.send(json);
    };
}
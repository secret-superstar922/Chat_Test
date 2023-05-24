"use strict";
const ws = new WebSocket('ws://localhost:8080');
function login() {
    const inputElement = document.getElementById("username");
    const username = inputElement.value;
    console.log("username", username);
    const data = {
        command: "connect",
        data: username,
    };
    const json = JSON.stringify(data);
    ws.send(json);
}

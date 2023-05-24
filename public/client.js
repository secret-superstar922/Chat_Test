"use strict";
function login() {
    const inputElement = document.getElementById("username");
    const username = inputElement.value;
    console.log("username", username);
    const ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
        const data = {
            command: "register",
            data: username,
        };
        const json = JSON.stringify(data);
        ws.send(json);
    };
}

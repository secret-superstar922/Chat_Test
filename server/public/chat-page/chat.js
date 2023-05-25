"use strict";
const ws = new WebSocket("ws://localhost:8080");
let userList = [];
ws.onopen = (e) => {
    const username = localStorage.getItem("auth");
    const data = {
        command: "connect",
        content: username,
    };
    ws.send(JSON.stringify(data));
};
ws.onmessage = (e) => {
    const json_data = JSON.parse(e.data);
    if (json_data.type === "broadcast" || json_data.type === "addUserList") {
        console.log(json_data.type);
        userList.push({
            uuid: json_data.uuid,
            username: json_data.username
        });
        const userlistElement = document.getElementById("userlist");
        userList.map((user) => {
            var userElement = document.createElement("p");
            userElement.setAttribute("id", user.uuid);
            userElement.setAttribute("class", "user");
            userElement.addEventListener('click', (event) => {

            });
            userElement.textContent = user.username;
            userlistElement.appendChild(userElement);
        });
    }
};

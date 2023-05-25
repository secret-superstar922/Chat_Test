"use strict";
const ws = new WebSocket("ws://localhost:8080");
let userList = [];
let selectedUser = {
    uuid: "",
    username: ""
};
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
        const childElements = userlistElement.querySelectorAll('p');
        childElements.forEach(childElement => {
            childElement.remove();
        });
        userList.map((user) => {
            var userElement = document.createElement("p");
            userElement.setAttribute("id", user.uuid);
            userElement.setAttribute("class", "user");
            userElement.textContent = user.username;
            userElement.addEventListener('click', (event) => {
                selectedUser.uuid = userElement.id;
                if (userElement.textContent) {
                    selectedUser.username = userElement.textContent;
                }
                userElement.style.backgroundColor = "red";
                console.log(selectedUser);
            });
            userlistElement.appendChild(userElement);
        });
    }
    else if (json_data.type === "message") {
        const chatboardElement = document.getElementById('chatboard');
        const chatContentElement = document.createElement('div');
        chatContentElement.setAttribute('class', 'chat-content');
        chatContentElement.textContent = json_data.text;
        chatboardElement.appendChild(chatContentElement);
    }
};
function sendMessage() {
    const messageElement = document.getElementById("message");
    const data = {
        command: "sendMessage",
        from: localStorage.getItem("auth"),
        to: selectedUser,
        text: messageElement.value
    };
    const json_data = JSON.stringify(data);
    ws.send(json_data);
}

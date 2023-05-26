import { Message } from "../../models/Message";

const ws:WebSocket = new WebSocket("ws://localhost:8080");
interface User {
    uuid: string,
    username: string,
    isOnline: Boolean
}

interface Message {
    from: string,
    to: string,
    text: string,
    create_at: Date
}

let userList: User[] = [];
let selectedUser: User = {
    uuid: "",
    username: "",
    isOnline: true
};

let messageList: Message[] = [];

const username = localStorage.getItem("username") ?? "";
document.getElementsByTagName('h1')[0].innerText = username;

ws.onopen = (e) => {
    const data = {
        command: "connect",
        uuid: localStorage.getItem("uuid"),
        username: localStorage.getItem("username"),
    }

    ws.send(JSON.stringify(data));
}

ws.onmessage = (e) => {
    const json_data = JSON.parse(e.data);

    const chatpanelElement = document.getElementsByClassName('chat-panel')[0] as HTMLElement;

    if(json_data.type === "broadcast" || json_data.type === "addUser") {
        if(userList.findIndex(user => user.username === json_data.username) === -1) {
            userList.push({
                uuid:json_data.uuid,
                username: json_data.username,
                isOnline: json_data.isOnline
            });
        } else {
            userList.map(user => {
                if(user.username === json_data.username) {
                    user.isOnline = true;
                }
            });
        }
    } else if(json_data.type === "statusUpdate") {
        userList.map(user => {
            if(user.username === json_data.username) {
                user.isOnline = json_data.isOnline;
            }
        });
    } else if(json_data.type === "message") {
        if(json_data.from === selectedUser.username) {
            appendMessageElementToChatPanel(chatpanelElement, json_data.from, json_data.text);
        }
    }

    const userlistElement = document.getElementsByClassName("sidebar")[0] as HTMLElement;
    const childElements = userlistElement.querySelectorAll('div');

    childElements.forEach(childElement => {
        childElement.remove();
    });

    userList.map((user) => {
        var userElement = document.createElement("div");
        var textElement = document.createElement("div");
        var statusElement = document.createElement("div");

        userElement.setAttribute("class", "userItem");
        textElement.innerHTML = user.username;
        statusElement.setAttribute("class", "status");

        userElement.appendChild(statusElement);
        userElement.appendChild(textElement);
        userlistElement.appendChild(userElement);

        userElement.addEventListener("click", event => {
            var userElementList = document.getElementsByClassName('userItem');
            for(var i = 0 ; i < userElementList.length; i ++){
                userElementList[i].classList.remove('active');
            }
            userElement.classList.add("active");

            const childMsgElements = chatpanelElement.querySelectorAll('div');
            childMsgElements.forEach(childMsgElement => {
                childMsgElement.remove();
            })

            selectedUser.username = user.username;
            selectedUser.uuid = user.uuid;

            const userPair = {
                user1: localStorage.getItem("username"),
                user2: userElement.textContent
            }

            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(userPair)
            }

            fetch("http://localhost:3000/message", options)
                .then(response => {
                    if(response.ok) {
                        response.json()
                                .then(payload => {
                                    payload.payload.map((message: Message) => {
                                    console.log("message", message);

                                    appendMessageElementToChatPanel(chatpanelElement, message.from, message.text);
                            });
                        });
                    } else {
                        console.log('Error fetching message:', response.statusText);
                    }
                });
        });

        var statusElements = userElement.getElementsByClassName('status');
        
        statusElements[0].classList.remove('active');
        if(user.isOnline) {
            statusElements[0].classList.add('active');
        }
    });
}

function sendMessage() {
    const messageElement = document.getElementById("message") as HTMLInputElement;

    const data = {
        command: "sendMessage",
        from: {
            username: localStorage.getItem("username"),
            uuid: localStorage.getItem("uuid")
        },
        to: selectedUser,
        text: messageElement.value
    }

    const json_data = JSON.stringify(data);

    console.log(json_data);
    ws.send(json_data);

    const chatpanelElement = document.getElementsByClassName('chat-panel')[0] as HTMLElement;
    appendMessageElementToChatPanel(chatpanelElement, localStorage.getItem("username") ?? "", messageElement.value);

    messageElement.value = "";
}

function appendMessageElementToChatPanel(chatpanelElement: HTMLElement, messageSender: string, messageText: string) {
    const msgboxElement = document.createElement('div');

    if(messageSender === localStorage.getItem("username")) {
        msgboxElement.setAttribute('class', 'msg-box msg-right');
    } else {
        msgboxElement.setAttribute('class', 'msg-box msg-left');
    }
    const textboxElement = document.createElement('div');
    textboxElement.setAttribute('class', 'text-box');
    textboxElement.textContent = messageText;

    msgboxElement.appendChild(textboxElement);
    chatpanelElement.appendChild(msgboxElement);

}
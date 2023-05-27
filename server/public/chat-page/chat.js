"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const ws = new WebSocket("ws://localhost:8080");
let userList = [];
let selectedUser = {
    uuid: "",
    username: "",
    isOnline: true
};
const username = (_a = localStorage.getItem("username")) !== null && _a !== void 0 ? _a : "";
document.getElementsByTagName('h1')[0].innerText = username;
ws.onopen = () => {
    const data = {
        command: "connect",
        uuid: localStorage.getItem("uuid"),
        username: localStorage.getItem("username"),
    };
    ws.send(JSON.stringify(data));
};
ws.onmessage = (e) => {
    const json_data = JSON.parse(e.data);
    const chatpanelElement = document.getElementsByClassName('chat-panel')[0];
    if (json_data.type === "broadcast" || json_data.type === "addUser") {
        if (userList.findIndex(user => user.username === json_data.username) === -1) {
            userList.push({
                uuid: json_data.uuid,
                username: json_data.username,
                isOnline: json_data.isOnline
            });
        }
        else {
            userList.map(user => {
                if (user.username === json_data.username) {
                    user.isOnline = true;
                }
            });
        }
    }
    else if (json_data.type === "statusUpdate") {
        userList.map(user => {
            if (user.username === json_data.username) {
                user.isOnline = json_data.isOnline;
            }
        });
    }
    else if (json_data.type === "message") {
        if (json_data.from === selectedUser.username) {
            appendMessageElementToChatPanel(chatpanelElement, json_data.from, json_data.text);
        }
    }
    const userlistElement = document.getElementsByClassName("sidebar")[0];
    const childElements = userlistElement.querySelectorAll('div');
    childElements.forEach(childElement => {
        childElement.remove();
    });
    userList.map((user) => {
        if (selectedUser.uuid === "" && userList.length > 0) {
            selectedUser = userList[0];
        }
        var userElement = document.createElement("div");
        var textElement = document.createElement("div");
        var statusElement = document.createElement("div");
        userElement.setAttribute("class", "userItem");
        textElement.innerHTML = user.username;
        statusElement.setAttribute("class", "status");
        userElement.appendChild(statusElement);
        userElement.appendChild(textElement);
        userlistElement.appendChild(userElement);
        console.log(user.uuid, "uuid", selectedUser.uuid);
        if (user.uuid === selectedUser.uuid) {
            userElement.classList.add("active");
        }
        userElement.addEventListener("click", event => {
            var userElementList = document.getElementsByClassName('userItem');
            for (var i = 0; i < userElementList.length; i++) {
                userElementList[i].classList.remove('active');
            }
            userElement.classList.add("active");
            const childMsgElements = chatpanelElement.querySelectorAll('div');
            childMsgElements.forEach(childMsgElement => {
                childMsgElement.remove();
            });
            selectedUser.username = user.username;
            selectedUser.uuid = user.uuid;
            const userPair = {
                user1: localStorage.getItem("username"),
                user2: userElement.textContent
            };
            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(userPair)
            };
            fetch("http://localhost:3000/message", options)
                .then(response => {
                if (response.ok) {
                    response.json()
                        .then(payload => {
                        payload.payload.map((message) => {
                            console.log("message", message);
                            appendMessageElementToChatPanel(chatpanelElement, message.from, message.text);
                        });
                    });
                }
                else {
                    console.log('Error fetching message:', response.statusText);
                }
            });
        });
        var statusElements = userElement.getElementsByClassName('status');
        statusElements[0].classList.remove('active');
        if (user.isOnline) {
            statusElements[0].classList.add('active');
        }
    });
};
function sendMessage() {
    var _a;
    const messageElement = document.getElementById("message");
    const data = {
        command: "sendMessage",
        from: {
            username: localStorage.getItem("username"),
            uuid: localStorage.getItem("uuid")
        },
        to: selectedUser,
        text: messageElement.value
    };
    const json_data = JSON.stringify(data);
    console.log(json_data);
    console.log("Check Online Status");
    console.log(ws.readyState);
    if (navigator.onLine) {
        console.log("Online");
        ws.send(json_data);
    }
    else {
        console.log("Offline");
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready
                .then(function (registration) {
                const request = window.indexedDB.open('offline-messages', 4);
                // Handle database opening success
                request.onsuccess = function (event) {
                    const db = event.target.result;
                    // Start a transaction and access the object store
                    const transaction = db.transaction(['messages'], 'readwrite');
                    const store = transaction.objectStore('messages');
                    // Create a new message object
                    const newMessage = data;
                    // Add the message to the object store
                    const addRequest = store.add(newMessage);
                    // Handle message addition success
                    addRequest.onsuccess = function () {
                        console.log('Message saved offline:', newMessage);
                        registration.sync.register('sendMessages')
                            .then(function () {
                            console.log('Sync event registered');
                        })
                            .catch(function (error) {
                            console.error('Failed to register sync event:', error);
                        });
                    };
                    // Handle message addition error
                    addRequest.onerror = function (error) {
                        console.error('Failed to save message offline:', error);
                    };
                    // Close the database connection
                    transaction.oncomplete = function () {
                        db.close();
                    };
                };
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    console.log("Creating Store");
                    const objectStore = db.createObjectStore('messages', { autoIncrement: true });
                    objectStore.createIndex('timestamp', 'timestamp');
                };
                // Handle database opening error
                request.onerror = function (error) {
                    console.error('Failed to open database:', error);
                };
            });
        }
    }
    const chatpanelElement = document.getElementsByClassName('chat-panel')[0];
    appendMessageElementToChatPanel(chatpanelElement, (_a = localStorage.getItem("username")) !== null && _a !== void 0 ? _a : "", messageElement.value);
    messageElement.value = "";
}
function appendMessageElementToChatPanel(chatpanelElement, messageSender, messageText) {
    const msgboxElement = document.createElement('div');
    if (messageSender === localStorage.getItem("username")) {
        msgboxElement.setAttribute('class', 'msg-box msg-right');
    }
    else {
        msgboxElement.setAttribute('class', 'msg-box msg-left');
    }
    const textboxElement = document.createElement('div');
    textboxElement.setAttribute('class', 'text-box');
    textboxElement.textContent = messageText;
    msgboxElement.appendChild(textboxElement);
    chatpanelElement.appendChild(msgboxElement);
}

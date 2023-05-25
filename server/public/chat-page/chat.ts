const ws:WebSocket = new WebSocket("ws://localhost:8080");
interface User {
    uuid: string,
    username: string
}

let userList: User[] = [];
let selectedUser: User = {
    uuid: "",
    username: ""
};

ws.onopen = (e) => {
    console.log("Init");
    const data = {
        command: "connect",
        uuid: localStorage.getItem("uuid"),
        username: localStorage.getItem("username"),
    }

    ws.send(JSON.stringify(data));
}

ws.onmessage = (e) => {
    const json_data = JSON.parse(e.data);

    if(json_data.type === "broadcast" || json_data.type === "addUserList") {
        console.log(json_data.type);
        userList.push({
            uuid:json_data.uuid,
            username: json_data.username
        });

        const userlistElement = document.getElementById("userlist") as HTMLElement;
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
                if(userElement.textContent) {
                    selectedUser.username = userElement.textContent;
                }

                console.log(selectedUser);
                var userElementList = document.getElementsByClassName('user');
                for(var i = 0 ; i < userElementList.length ; i ++){
                    userElementList[i].classList.remove('active');
                }
                userElement.setAttribute("class", "user active");

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
                            response.json().then(payload => {
                                console.log(payload);
                            });
                        }
                    });
            });
            userlistElement.appendChild(userElement);
        });

    } else if(json_data.type === "message") {
        const chatboardElement = document.getElementById('chatboard') as HTMLElement;
        const chatContentElement = document.createElement('div') as HTMLElement;

        chatContentElement.setAttribute('class', 'chat-content');
        chatContentElement.textContent = json_data.text;
        chatboardElement.appendChild(chatContentElement);
    }
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
}


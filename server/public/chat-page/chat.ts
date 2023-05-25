const ws:WebSocket = new WebSocket("ws://localhost:8080");
interface user {
    uuid: String,
    username: String
}

let userList: user[] = [];

ws.onopen = (e) => {
    const username = localStorage.getItem("auth");
    const data = {
        command: "connect",
        content: username,
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
    }
}
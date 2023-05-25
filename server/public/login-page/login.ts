function login() {
    const inputElement = document.getElementById("username") as HTMLInputElement;
    const username = inputElement.value;
    const user = {
        name: username
    }

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(user)
    }

    fetch("http://localhost:3000/login", options)
        .then(response => {
            if(response.ok) {
                console.log(response.json().then(d => console.log(d)));
                localStorage.setItem("auth", username);
                window.location.assign('/chat-page');
            } else {
                console.error('Error sending data:', response.statusText);
            }
        });
}

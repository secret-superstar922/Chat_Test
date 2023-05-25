function login() {
    const inputElement = document.getElementById("username") as HTMLInputElement;

    const user = {
      name: inputElement.value,
      uuid: generateUserId()
    };
  
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(user)
    };
  
    fetch("http://localhost:3000/login", options)
      .then(response => { 
        if (response.ok) {
          response.json().then(payload => {
            localStorage.setItem("username", user.name);
            localStorage.setItem("uuid", user.uuid);
            window.location.assign('/chat-page');
          });
        } else {
          console.error('Error sending data:', response.statusText);
        }
      });
  }
  

function generateUserId(): string {
    return Math.random().toString(36).substr(2, 8);
}

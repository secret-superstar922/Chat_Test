"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function login() {
    const inputElement = document.getElementById("username");
    if (inputElement.value.trim() !== "") {
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
            }
            else {
                console.error('Error sending data:', response.statusText);
            }
        });
    }
}
function generateUserId() {
    return Math.random().toString(36).substr(2, 8);
}
const registerServiceWorker = () => __awaiter(void 0, void 0, void 0, function* () {
    if ("serviceWorker" in navigator) {
        try {
            yield navigator.serviceWorker.register("sw.js", { scope: "/" });
        }
        catch (error) {
            console.log("Registration failed with ${error}");
        }
    }
});
registerServiceWorker();

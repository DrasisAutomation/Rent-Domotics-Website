const SERVER_URL = "https://sms-server-dciw.onrender.com";

function pingServer() {
    fetch(`${SERVER_URL}/api/ping`)
        .then(res => res.json())
        .then(data => console.log("Ping:", data))
        .catch(err => console.error(err));
}

// every 3 min ONLY if active
setInterval(() => {
    if (document.visibilityState === "visible") {
        pingServer();
    }
}, 180000);

// when tab becomes active
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        pingServer();
    }
});

// first load
pingServer();
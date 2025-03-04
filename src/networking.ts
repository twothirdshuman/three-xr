const socket = new WebSocket("/ws");

socket.addEventListener("open", () => {
    console.log("aaAAaaAAAA");
});

socket.addEventListener("message", (msg) => {
    console.log("msg", msg.data);
});

setTimeout(() => {
    socket.send('[12345, {"x":1, "y":1, "z":1}]');
}, 1000);

export default socket;
interface Point {
    x: number,
    y: number,
    z: number
}
type ID = number;
type Message = [ID, Point];

const sockets: WebSocket[] = [];
Deno.serve({
    port: 8000,
    hostname: "localhost"
},(req) => {
    const url = new URL(req.url);
    if (url.pathname !== "/ws") {
        return new Response(null, {status:404});
    }
    if (req.headers.get("upgrade")?.includes("websocket") !== true) {
        return new Response(null, {status:400});
    }
    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.addEventListener("open", () => {
        console.log("client connected");
        sockets.push(socket);
    });

    socket.addEventListener("message", (msg) => {
        try {
            /*
            console.log(typeof msg.data);
            const w = JSON.parse(msg.data);
            if (!Array.isArray(w)) {
                throw undefined;
            }
            if (typeof w[0] !== "number") {
                throw undefined;
            }
            const t = (a: unknown) => typeof a === "number";
            if (t(w[1].x) && t(w[1].y) && t(w[1].z)) {;} else {throw undefined;}
            */
            sockets.forEach(s => {
                if (s !== socket) { 
                    s.send(msg.data) 
                }
            });
        } catch (_) {
            console.log(":(");
        }
    });

    socket.addEventListener("close", () => {
        
    })
    
    return response;
})
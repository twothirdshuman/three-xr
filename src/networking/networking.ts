import { createEffect, createSignal } from "../signals";
import { username } from "../username";
import * as controls from "../controls";
import { Joined, Username } from "./networkingTypes";
import { parseMessage } from "./parsing";
const avatarResource = new URL(`${window.location.origin}/avatar.ts`);
const socket = new WebSocket("/ws");
const [getJoined, setJoined] = createSignal<Username[]>([]);


socket.addEventListener("open", () => {
    console.log("aaAAaaAAAA");
    const message: Joined = {
        type: "Joined",
        username: username
    };

    socket.send(JSON.stringify(message));
});


socket.addEventListener("message", (msg) => {
    let json;
    try {
        json = JSON.parse(msg.data);
    } catch (_) {
        return;
    }
    const message = parseMessage(json);
    if (message === undefined) {
        return;
    }

    if (message.data.type === "Joined") {
        setJoined([...getJoined(), message.data.username]);

        const toSend: Joined = {
            type: "Joined",
            username: username
        }
        socket.send(JSON.stringify(toSend));
    }
});

setTimeout(() => {
    socket.send('[12345, {"x":1, "y":1, "z":1}]');
}, 1000);

export default {
    getJoined: getJoined
};
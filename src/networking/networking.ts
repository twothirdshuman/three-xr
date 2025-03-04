import { createEffect, createSignal, remoteContextControlled, Setter } from "../signals";
import { username } from "../username";
import * as controls from "../controls";
import { Joined, Message, ResourceId, Update, Username } from "./networkingTypes";
import { parseMessage } from "./parsing";
const avatarResource = new URL(`${window.location.origin}/avatar.ts`);
const socket = new WebSocket("/ws");
const [getJoined, setJoined] = createSignal<Username[]>([]);

socket.addEventListener("open", () => {
    const message: Joined = {
        type: "Joined",
        username: username
    };

    socket.send(JSON.stringify(message));
});

let endpointNew = (resourceId: ResourceId): Setter<string | number>[] => {return [];};
export function setNewEndpoint(endpoint: (resourceId: ResourceId) => Setter<string | number>[]) {
    endpointNew = endpoint;
}

const settersMap: Map<ResourceId, Setter<string | number>[]> = new Map();
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

    if (message.data.type === "New") {
        const setters = endpointNew(message.data.resource);
        settersMap.set(message.data.resource, setters);
    }
    if (message.data.type === "Update") {
        const setters = settersMap.get(message.data.resource);
        if (setters === undefined) {
            throw new Error("tried to update on non existant resource");
        }
        message.data.updates.forEach(update => setters[update.signalNr](update.value));
    }
});

const updateQueue: Message[] = [];
setInterval(() => {
    if (socket.readyState !== WebSocket.OPEN) {
        return;
    }
    updateQueue.forEach(msg => {
        socket.send(JSON.stringify(msg));
    });
}, 1);
export function registerRemote(resourceId: ResourceId, func: () => void) {
    const getters = remoteContextControlled(() => {
        func();
    });

    for (let i = 0; i < getters.length; i++) {
        createEffect(() => {
            const value = getters[i]();
            const messageData: Update = {
                type: "Update",
                resource: resourceId,
                updates: [{
                    signalNr: i,
                    value: value
                }]
            };

            const message: Message = {
                from: username,
                to: getJoined(),
                data: messageData
            };

            updateQueue.push(message);
        });
    }
}


import { createEffect, createSignal, remoteContextControlled, Setter } from "../signals";
import { username } from "../username";
import { Joined, Message, ResourceId, Update, Username, New, UpdateInner } from "./networkingTypes";
import { parseMessage } from "./parsing";
const avatarResource = new URL(`${window.location.origin}/avatar.ts`);
const socket = new WebSocket("/ws");
const [getJoined, setJoined] = createSignal<Username[]>([]);

const announcePresence = () => {
    const message: Joined = {
        type: "Joined",
    };

    const joined = getJoined();
    let to = joined;
    if (joined.length === 0) {
        to = ["all"];
    }
    socket.send(JSON.stringify({
        to: to,
        from: username,
        data: message
    }));

    const newl: New = {
        type: "New",
        resource: "a"
    };
    const msg: Message = {
        from: username,
        to: ["all"],
        data: newl
    }
    socket.send(JSON.stringify(msg));
}

const announceLeave = () => {
    const disconnect: Message = {
        to: ["a"],
        from: username,
        data: {
            type: "Disconnect"
        }
    };

    socket.send(JSON.stringify(disconnect));

}

window.addEventListener("beforeunload", function(e){
    announceLeave();
});

socket.addEventListener("open", () => {
    announcePresence();
});

type RemoteThingObject = {
    unMount: () => void,
    setters: Setter<string | number>[]
};
type Endpoint = (resourceId: ResourceId) => RemoteThingObject;
let endpointNew: Endpoint = (resourceId) => {return {unMount: () => {;}, setters:[]};};
export function setNewEndpoint(endpoint: Endpoint) {
    endpointNew = endpoint;
}

const settersMap: Map<ResourceId, RemoteThingObject> = new Map();
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
        const joined = getJoined();
        if (joined.includes(message.from)) {
            return;
        }
        if (!message.to.includes("all")) {
            return;
        }
        setJoined([...joined, message.from]);

        announcePresence();
    }

    if (message.data.type === "New") {
        const setters = endpointNew(message.data.resource);
        console.log("new!!!");
        settersMap.set(message.data.resource, setters);
    }
    if (message.data.type === "Disconnect") {
        const setters = settersMap.get("a"); // TODO fix a not hard coded
        if (setters === undefined) {
            throw new Error("tried to disconnect on non existant resource");
        }
        setters.unMount();
    }
    if (message.data.type === "Update") {
        const setters = settersMap.get(message.data.resource);
        if (setters === undefined) {
            throw new Error("tried to update on non existant resource");
        }
        message.data.updates.forEach(update => setters.setters[update.signalNr](update.value));
    }
});

type OneUpdate = {
    resource: ResourceId,
    update: UpdateInner
}
let updateQueue: OneUpdate[] = [];
type MessageUpdate = {
    to: string[],
    from: string,
    data: Update
}
setInterval(() => {
    if (socket.readyState !== WebSocket.OPEN) {
        return;
    }
    
    const insertUpdate = (toInsert: OneUpdate, insertInto: MessageUpdate) => {
        if (insertInto.data.resource !== toInsert.resource) {
            throw new Error("Resource not matched when inserting");
        }
        const nr = toInsert.update.signalNr;

        let inserted = false;
        for (let i = 0; i < insertInto.data.updates.length; i++) {
            if (insertInto.data.updates[i].signalNr === nr) {
                insertInto.data.updates[i] = toInsert.update;
                inserted = true;
                break;
            }
        }

        if (!inserted) {
            insertInto.data.updates.push(toInsert.update);
        }
    };
    let toSend: MessageUpdate[] = [];

    for (const update of updateQueue) {
        let inserted = false;
        for (let i = 0; i < toSend.length; i++) {
            if (toSend[i].data.resource === update.resource) {
                insertUpdate(update, toSend[i]);
                inserted = true;
                break;
            }
        }
        // New data resource
        if (!inserted) {
            toSend.push({
                from: username,
                to: ["all"],
                data: {
                    type: "Update",
                    resource: update.resource,
                    updates: [
                        update.update
                    ]
                }
            });
        }
    }
    
    toSend.forEach(msg => {
        const sanity: Message = msg;
        socket.send(JSON.stringify(sanity));
    });
    

    updateQueue = [];
}, 1000 / 30);
export function registerRemote(resourceId: ResourceId, func: () => void) {
    const getters = remoteContextControlled(() => {
        func();
    });

    for (let i = 0; i < getters.length; i++) {
        createEffect(() => {
            const value = getters[i]();
            
            const message: OneUpdate = {
                resource: resourceId,
                update: {
                    signalNr: i,
                    value: value
                }
            };

            updateQueue.push(message);
        });
    }
}


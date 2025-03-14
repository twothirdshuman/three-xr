import { createEffect, createSignal, controlledContext, Setter } from "../signals";
import { username } from "../username";
import { Joined, Message, ResourceId, Update, Username, UpdateInner, DataPart, Disconnect } from "./networkingTypes";
import { parseMessage } from "./parsing";
import { addUser, createUser, getUser, getUsernames, removeUser } from "./users";

const announcePresence = (socket: WebSocket, avatarId: string) => {
    const message: Joined = {
        type: "Joined",
        avatarId: avatarId
    };

    const joined = getUsernames();
    let to = joined;
    if (joined.length === 0) {
        to = ["all"];
    }
    socket.send(JSON.stringify({
        to: to,
        from: username,
        data: message
    }));
};

const announceLeave = (socket: WebSocket) => {
    const disconnect: Message<Disconnect> = {
        to: ["all"],
        from: username,
        data: {
            type: "Disconnect"
        }
    };

    socket.send(JSON.stringify(disconnect));
};

function intoMessage(msg: MessageEvent<unknown>): Message<DataPart> | undefined {
    let json;
    try {
        json = JSON.parse(msg.data as string);
    } catch (_) {
        return;
    }
    const message = parseMessage(json);
    if (message === undefined) {
        return;
    }

    return message;
}

function isNew(message: Message<Joined>) {
    const joined = getUsernames();
    const ret = joined.includes(message.from);

    return !ret;
}

function onSomeoneJoin(message: Message<Joined>, announcePresence: () => void) {
    if (!isNew(message)) {
        return;
    }
    
    const user = createUser(message.from, message.data.avatarId);
    if (user === undefined) {
        throw new Error("Could not create avatar");
    }
    addUser(user);

    announcePresence();
}

function onDisconnect(message: Message<Disconnect>) {
    const user = getUser(message.from);
    if (user === undefined) {
        throw new Error("tried to disconnect on non existant user");
    }
    user.unMount();
}

function onUpdate(message: Message<Update>) {
    const user = getUser(message.from);
    if (user === undefined) {
        throw new Error("tried to update on non existant user");
    }
    message.data.updates.forEach(update => user.setters[update.signalNr](update.value));
}

function onMessage(msg: MessageEvent<unknown>, announcePresence: () => void) {
    const message = intoMessage(msg);
    if (message === undefined) {
        return;
    }
    console.log(message.data.type);
    if (message.data.type === "Joined") {
        onSomeoneJoin(message as Message<Joined>, announcePresence);
    }
    if (message.data.type === "Disconnect") {
        onDisconnect(message as Message<Disconnect>)
    }
    if (message.data.type === "Update") {
        onUpdate(message as Message<Update>)
    }
}

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

function sendUpdates(socket: WebSocket) {
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
        const sanity: Message<DataPart> = msg;
        socket.send(JSON.stringify(sanity));
    });
    

    updateQueue = [];
}

export function registerRemote(resourceId: ResourceId, func: () => void) {
    const [getters, _] = controlledContext(() => {
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

export function connect(avatarId: string) {
    const socket = new WebSocket("/ws");

    window.addEventListener("beforeunload", function(e){
        announceLeave(socket);
    });
    
    socket.addEventListener("open", () => {
        announcePresence(socket, avatarId);
        setInterval(() => {
            sendUpdates(socket);
        }, 1000 / 30);
    });
    socket.addEventListener("message", msg => {
        onMessage(msg, () => announcePresence(socket, avatarId));
    });
}
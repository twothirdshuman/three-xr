import idResolve from "../content/idResolve";
import { addAvatar } from "../engine/sceneRenderer";
import { Setter } from "../signals";

type User = {
    username: string,
    avatarId: string,
    setters: Setter<string>[],
    unMount: () => void
}
type Users = User[];

const users: Users = [];

export function createUser(username: string, avatarId: string): User | undefined {
    const resource = idResolve(avatarId);
    if (resource === undefined) {
        return undefined;
    }
    if ("world" in resource) {
        throw new Error("we do not allow worlds as users");
    }

    const rendererPart = addAvatar(resource);

    return {
        username,
        avatarId,
        unMount: rendererPart.unMount,
        setters: rendererPart.setters
    };
}

export function addUser(toAdd: User) {
    for (const user of users) {
        if (toAdd.username === user.username) {
            throw new Error("Trying to add multiple of the same username");
        }
    }
    
    users.push(toAdd);
}

export function getUser(username: string): User | undefined {
    for (const user of users) {
        if (user.username === username) {
            return user;
        }
    }
    return undefined;
}

type WasSuccess = boolean;
export function removeUser(username: string): User | undefined {
    for (let i = 0; i < users.length; i++) {
        if (users[i].username === username) {
            const [user] = users.splice(i, 1);
            return user;
        }
    }
    return undefined;
}

export function getUsernames(): string[] {
    const ret: string[] = [];
    
    users.forEach((user) => {
        ret.push(user.username);
    });

    return ret;
}
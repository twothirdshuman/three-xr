import { DataPart, Message, UpdateInner } from "./networkingTypes";


function isObject(obj: unknown): obj is Record<string, unknown> {
    return typeof obj === "object" && !!obj;
}

function parseDataPart(dataPart: unknown): DataPart | undefined {
    if (!isObject(dataPart)) {
        return undefined;
    }
    if (dataPart.type === "Joined") {
        return {
            type: dataPart.type
        };
    }
    if (dataPart.type === "New") {
        if (typeof dataPart.resource !== "string") {
            return undefined;
        }
        try {
            return {
                type: "New",
                resource: dataPart.resource
            }
        } catch (_) {
            return undefined;
        }
    }
    if (dataPart.type === "Update") {
        const updates = (() => {
            if (!Array.isArray(dataPart.updates)) {
                return undefined;
            }
            let ret: UpdateInner[] = [];
            for (const update of dataPart.updates) {
                if (!isObject(update)) {
                    return undefined;
                }
                if (typeof update.signalNr !== "number") {
                    return undefined;
                }
                if (typeof update.value !== "string") {
                    return undefined;
                }
                ret.push({
                    signalNr: update.signalNr,
                    value: update.value
                });
            } 
            return ret;
        })();

        if (updates === undefined) {
            return undefined;
        }

        if (typeof dataPart.resource !== "string") {
            return undefined;
        }
        try {
            return {
                type: "Update",
                resource: dataPart.resource,
                updates: updates
            };
        } catch (_) {
            return undefined;
        }
    }
    
    console.log("WARNING NOT SAFE JSON PARSE");
    return dataPart as unknown as DataPart;
}

export function parseMessage(jsonParsed: unknown): Message | undefined {
    if (!isObject(jsonParsed)) {
        return undefined;
    }

    if (typeof jsonParsed.from !== "string") {
        return undefined;
    }

    if (!Array.isArray(jsonParsed.to)) {
        return undefined;
    }
    if (typeof jsonParsed.to.map(s => typeof s === "string").reduce((prev, now) => prev && now)) {
        return undefined;
    }

    const dataPart = parseDataPart(jsonParsed.data);
    if (dataPart === undefined) {
        return undefined;
    }

    return {
        to: jsonParsed.to,
        from: jsonParsed.from,
        data: dataPart
    };
} 
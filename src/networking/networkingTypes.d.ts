export type Username = string;
export type ResourceId = string;

export interface Joined {
    type: "Joined",
    avatarId: string
}
export interface Disconnect {
    type: "Disconnect"
}

export type UpdateInner = {
    signalNr: number,
    value: string
};
export type Update = {
    type: "Update",
    resource: ResourceId,
    updates: UpdateInner[]
};

export type DataPart = Joined | Update | Disconnect;
export type Message<T extends DataPart> = {
    to: Username[],
    from: Username,
    data: T
}; 
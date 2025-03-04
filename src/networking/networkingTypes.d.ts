export type Username = string;
export type ResourceId = string;

export interface Joined {
    type: "Joined",
    username: Username
}

export interface New {
    type: 'New',
    resource: ResourceId
}

export type UpdateInner = {
    signalNr: number,
    value: number | string
};
export type Update = {
    type: "Update",
    resource: ResourceId,
    updates: UpdateInner[]
};

export type DataPart = Joined | New | Update;
export type Message = {
    to: Username | Username[],
    from: Username,
    data: DataPart
}; 
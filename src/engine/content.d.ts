import { GameObject } from "./gameTypes";
import { Getter } from "../signals";

interface AvatarExport {
    uniqueName: string,
    avatar: () => GameObject
};

interface WorldExport {
    uniqueName: string,
    world: () => GameObject
};
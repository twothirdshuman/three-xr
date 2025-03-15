import { AvatarExport, WorldExport } from "../engine/content";
import defaultAvi from "./deafultAvi";
import floater from "./floater";

const exports: (WorldExport | AvatarExport)[] = [defaultAvi, floater];
export default (id: string): WorldExport | AvatarExport | undefined => {
    return exports.find(ex => ex.uniqueName === id);
};
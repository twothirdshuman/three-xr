import { AvatarExport, WorldExport } from "../engine/content";
import defaultAvi from "./deafultAvi";
import floater from "./floater";
import dynamicCubes from "./dynamicCubes";

const exports: (WorldExport | AvatarExport)[] = [defaultAvi, floater, dynamicCubes];
export default (id: string): WorldExport | AvatarExport | undefined => {
    return exports.find(ex => ex.uniqueName === id);
};
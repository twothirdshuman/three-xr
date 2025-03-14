import { AvatarExport, WorldExport } from "../engine/content";
import avatar from "./avatar";
import world from "./world";

const exports: (WorldExport | AvatarExport)[] = [avatar, world];
export default (id: string): WorldExport | AvatarExport | undefined => {
    return exports.find(ex => ex.uniqueName === id);
};
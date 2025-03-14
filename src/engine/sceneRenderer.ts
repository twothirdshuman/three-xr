import * as THREE from 'three';
import * as controlls from "./controls"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GameObject, GameObjectGetter, GameObjectNoMesh } from './gameTypes';
import { createEffect, createSignal, remoteContext, Setter } from '../signals';
import { Children } from './helpers';
import { AvatarExport, WorldExport } from './content';
import { connect, registerRemote } from '../networking/networking';
import IDResolver from "../content/idResolve";
import idResolve from '../content/idResolve';
import { username } from '../username';
type StartObjects = {
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    camera: THREE.Camera
    
}
type Options = {
    debug: boolean
};

const [getGrandObject, setGrandObject] = createSignal<GameObjectNoMesh>(Children([]));

function getGameObject(thing: GameObjectGetter): GameObject {
    if (typeof thing === "function") {
        return thing();
    }
    return thing;
};

function getMeshes(current: GameObject): Set<THREE.Mesh> {
    let ret: Set<THREE.Mesh> = new Set(); 

    for (const child of current.children) {
        const gameObject = getGameObject(child);

        ret = ret.union(getMeshes(gameObject));
    }

    if (current.mesh !== undefined) {
        ret.add(current.mesh);
    }
    return ret;
}

let oldMeshes: Set<THREE.Mesh> = new Set();
function updateObjectsInScene(scene: THREE.Scene) {
    const grand = getGrandObject();
    const newMeshes = getMeshes(grand);

    const toRemove = oldMeshes.difference(newMeshes);
    const toAdd = newMeshes.difference(oldMeshes);

    for (const mesh of toRemove) {
        scene.remove(mesh);
    }

    for (const mesh of toAdd) {
        scene.add(mesh);
    }

    oldMeshes = newMeshes;
}

function initilizeWorld(worldId: string, avatarId: string) {
    const world = idResolve(worldId);
    if (world === undefined) {
        throw new Error(`could not find world of id: ${worldId}`);
    }
    if ("avatar" in world) {
        throw new Error("Cannot spawn avatar as world");
    }
    const avatar = idResolve(avatarId);
    if (avatar === undefined) {
        throw new Error("could not find avatar of id: " + avatarId);
    }
    if ("world" in avatar) {
        throw new Error("Cannot spawn world as avatar")
    }

    
    const worldParent = world.world();
    const worldGameObject = getGameObject(worldParent);

    let avatarParent: GameObject | undefined;
    registerRemote(avatarId, () => {
        avatarParent = avatar.avatar();
    });
    if (avatarParent === undefined) {
        throw new Error("The impossible happened");
    }
    const avatarGameObject = getGameObject(avatarParent);

    const grand = getGrandObject();
    if (grand.children.size !== 0) {
        throw new Error("Grand Object should be empty on initilization");
    }
    const newChildren = [...grand.children, worldGameObject, avatarGameObject];
    setGrandObject(Children(newChildren));
}

export function addAvatar(avatarExport: AvatarExport): {unMount: () => void, setters: Setter<string>[]} {
    let avi: GameObject;
    const [_, setters] = remoteContext(() => {
        avi = avatarExport.avatar();
        setGrandObject(Children([...getGrandObject().children, avi]))
    });

    return {
        unMount: () => {
            const grand = getGrandObject();
            if (!grand.children.delete(avi)) {
                return new Error("could not find avi that should be mounted");
            }
            setGrandObject(Children(grand.children)); // Nedded for effect update
        },
        setters
    };
}

export function start(threeObjects: StartObjects, worldId: string, options?: Options) {
    const scene = threeObjects.scene;
    const renderer = threeObjects.renderer;
    const camera = threeObjects.camera;
    if (options === undefined) {
        options = {
            debug: false
        };
    }

    let orbitControls: undefined | OrbitControls = undefined;
    if (options.debug) {
        orbitControls = new OrbitControls( camera, renderer.domElement );
        camera.position.z = 2;
        orbitControls.update();
    
        const gridHelper = new THREE.GridHelper(200, 200);
        scene.add(gridHelper);
    }

    createEffect(() => {
        updateObjectsInScene(scene);
    });
    initilizeWorld(worldId, "DeafaultAvi");
    connect("DeafaultAvi");

    let prevTime = 0;
    renderer.setAnimationLoop((time: number) => {
        const delta = time - prevTime;
        prevTime = time;

        if (!renderer.xr.isPresenting && orbitControls !== undefined) {
            orbitControls.update(delta);
        }
        controlls.update(renderer)

        renderer.render(scene, camera);
    });
}
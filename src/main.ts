import * as THREE from 'three';
import * as XRButton from "three/examples/jsm/webxr/XRButton.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setNewEndpoint, registerRemote } from './networking/networking';
import Avatar from "./avatar";
import World from './world';
import * as controlls from "./controls"
import { createEffect, createSignal, remoteContextRemote } from './signals';
import { GameObject, GameObjectAll, GameObjectNoMesh } from './game';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

const orbitControls = new OrbitControls( camera, renderer.domElement );
camera.position.z = 2;
orbitControls.update();

const gridHelper = new THREE.GridHelper(200, 200);
scene.add(gridHelper);

let prevTime = 0;
function animate(time: number) {
    const delta = time - prevTime;
    prevTime = time;

    if (!renderer.xr.isPresenting) {
        orbitControls.update();
    }
    controlls.update(renderer)

    renderer.render(scene, camera);
}

const [getObjects, setObjects] = createSignal<GameObjectNoMesh>({mesh:undefined,children:[]});
(() => {
    const objects: GameObjectAll[] = [];
    registerRemote("a", () => {
        for (const obj of Avatar()) {
            objects.push(obj);
        }
    });

    
    const world = World();
    objects.push(world);

    setObjects({mesh:undefined,children:objects});
})();

let oldObjects: GameObject[] = [];
createEffect(() => {
    const currentObjects = getObjects();
    for (const obj of oldObjects) {
        scene.remove(obj.mesh);
    }
    // currenlty broken
    for (const obj of currentObjects) {
        scene.add(obj.mesh);
    }
    oldObjects = currentObjects;
});

// This is basically an ID resolver
setNewEndpoint((id) => {
    let objects: GameObject[] = [];
    const [_, setters] = remoteContextRemote(() => {
        if (id === "a") {
            objects = Avatar();
            setObjects([...getObjects(), ...objects]);
        }
    });
    return {
        setters: setters,
        unMount: () => {
            const newObjects = getObjects().filter(obj => !objects.includes(obj));
            setObjects(newObjects);
        } 
    };
})

renderer.setAnimationLoop(animate)
document.body.appendChild(XRButton.XRButton.createButton(renderer))
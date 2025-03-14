import * as THREE from 'three';
import * as XRButton from "three/examples/jsm/webxr/XRButton.js";
import { start } from './engine/sceneRenderer';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(XRButton.XRButton.createButton(renderer));

start({
        scene,camera,renderer
}, "floaters!!!!", {
    debug: true
});

/*
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
    objects.push(world.children[0]);

    setObjects({mesh:undefined,children:objects});
})();

const getGameObject = (thing: GameObjectAll): GameObjectAllTypes => {
    if (typeof thing === "function") {
        return thing();
    }
    return thing;
};

let oldObjects: GameObjectAll[] = [];
createEffect(() => {

    const currentObjects = getObjects();
    for (const obj of oldObjects) {
        const gameObject = getGameObject(obj);
        if (gameObject.mesh === undefined) {
            continue;
        }
        scene.remove(gameObject.mesh);
    }
    // currenlty broken
    for (const obj of currentObjects.children) {
        const gameObject = getGameObject(obj);

        if (gameObject.mesh === undefined) {
            continue;
        }
        scene.add(gameObject.mesh);
    }
    oldObjects = currentObjects.children;
});

// This is basically an ID resolver
setNewEndpoint((id) => {
    let objects: GameObjectAllTypes[] = [];
    const [_, setters] = remoteContextRemote(() => {
        if (id === "a") {
            objects = Avatar();
            setObjects({mesh:undefined,children:[...getObjects().children, ...objects]});
        }
    });
    return {
        setters: setters,
        unMount: () => {
            const newObjects = {mesh:undefined,children:getObjects().children.filter(obj => !objects.includes(getGameObject(obj)))};
            setObjects(newObjects);
        } 
    };
})

renderer.setAnimationLoop(animate)
*/

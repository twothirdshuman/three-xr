import * as THREE from 'three';
import * as XRButton from "three/examples/jsm/webxr/XRButton.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setNewEndpoint, registerRemote } from './networking/networking';
import Avatar from "./avatar";
import World from './world';
import * as controlls from "./controls"
import { createEffect, remoteContextRemote } from './signals';

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

const objects = [];
registerRemote("a", () => {
    for (const obj of Avatar()) {
        objects.push(obj);
    }
});

for (const obj of World()) {
    objects.push(obj);
}

for (const obj of objects) {
    scene.add(obj.mesh);
}

// This is basically an ID resolver
setNewEndpoint((id) => {
    return remoteContextRemote(() => {
        if (id === "a") {
            Avatar(); 
        }
    });
})

renderer.setAnimationLoop(animate)
document.body.appendChild(XRButton.XRButton.createButton(renderer))
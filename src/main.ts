import * as THREE from 'three';
import * as XRButton from "three/examples/jsm/webxr/XRButton.js";
import Avatar from "./avatar";
import World from './world';
import { GameObject } from './game';
import { Body, Thing } from './avatarTypes';
import { createSignal } from './signals';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

camera.position.z = 2;

const [getHead, setHead] = createSignal<Thing>({
    position: new THREE.Vector3(),
    rotation: new THREE.Euler()
});
const [getLeftHand, setLeftHand] = createSignal<Thing>({
    position: new THREE.Vector3(),
    rotation: new THREE.Euler()
});
const [getRightHand, setRightHand] = createSignal<Thing>({
    position: new THREE.Vector3(),
    rotation: new THREE.Euler()
});

const updateHands = () => {
    let controller = renderer.xr.getController(0);
    setLeftHand({
        position: controller.position,
        rotation: controller.rotation
    });
    controller = renderer.xr.getController(1);
    setRightHand({
        position: controller.position,
        rotation: controller.rotation
    });
};

const updateHead = () => {
    let head = renderer.xr.getCamera();
    setLeftHand({
        position: head.position,
        rotation: head.rotation
    });
};

let prevTime = 0;
function animate(time: number) {
    const delta = time - prevTime;
    prevTime = time;

    updateHands();
    updateHead();

    renderer.render(scene, camera);
}

const objects = [];
for (const obj of Avatar({
    head: getHead,
    leftHand: getLeftHand,
    rightHand: getRightHand
})) {
    objects.push(obj);
}

for (const obj of World(getRightHand)) {
    objects.push(obj);
}

for (const obj of objects) {
    scene.add(obj.mesh);
}

renderer.setAnimationLoop(animate)
document.body.appendChild(XRButton.XRButton.createButton(renderer))
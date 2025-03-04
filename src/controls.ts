import * as THREE from 'three';
import { Thing } from './avatarTypes';
import { createEffect, createSignal } from './signals';

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

const updateHands = (renderer: THREE.WebGLRenderer) => {
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

const updateHead = (renderer: THREE.WebGLRenderer) => {
    let head = renderer.xr.getCamera();
    setHead({
        position: head.position,
        rotation: head.rotation
    });
};

const keys = new Set();
document.onkeydown = (e) => {
    keys.add(e.key);
};
document.onkeyup = (e) => {
    keys.delete(e.key)
};
const updateNonXr = (renderer: THREE.WebGLRenderer) => {
    const head = getHead();
    const mag = 0.025;

    if (keys.has("d")) {
        setHead({
            position: head.position.add(new THREE.Vector3(mag, 0, 0)),
            rotation: head.rotation
        });   
    }
    if (keys.has("a")) {
        setHead({
            position: head.position.add(new THREE.Vector3(-mag, 0, 0)),
            rotation: head.rotation
        }); 
    }
    if (keys.has("s")) {
        setHead({
            position: head.position.add(new THREE.Vector3(0, 0, mag)),
            rotation: head.rotation
        }); 
    }
    if (keys.has("w")) {
        setHead({
            position: head.position.add(new THREE.Vector3(0, 0, -mag)),
            rotation: head.rotation
        }); 
    }
    if (keys.has("q")) {
        setHead({
            position: head.position.add(new THREE.Vector3(0, mag, 0)),
            rotation: head.rotation
        }); 
    }
    if (keys.has("e")) {
        setHead({
            position: head.position.add(new THREE.Vector3(0, -mag, 0)),
            rotation: head.rotation
        }); 
    }
};
let isPresenting = false;
createEffect(() => {
    const newHead = getHead();

    if (isPresenting) { return; } 
    setRightHand({
        position: newHead.position.clone().add(new THREE.Vector3(0.25, -1, 0)),
        rotation: newHead.rotation.clone()
    });
    
    setLeftHand({
        position: newHead.position.clone().add(new THREE.Vector3(-0.25, -1, 0)),
        rotation: newHead.rotation.clone()
    });
})
export const update = (renderer: THREE.WebGLRenderer) => {
    isPresenting = renderer.xr.isPresenting;
    if (renderer.xr.isPresenting) {
        updateHands(renderer);
        updateHead(renderer);
    } else {
        updateNonXr(renderer);
    }
};

export const signals = {
    getters: {
        head: getHead,
        leftHand: getLeftHand,
        rightHand: getRightHand
    },
    setters: {
        head: setHead,
        leftHand: setLeftHand,
        rightHand: setRightHand
    }
}
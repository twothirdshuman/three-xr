import * as THREE from 'three';
import { Getter, createEffect } from './signals';
import { GameObject, Mesh } from './game';
import { Thing, Body } from './avatarTypes';
const hand = (getHand: Getter<Thing>, color: number): GameObject => {
    const geometry = new THREE.SphereGeometry(0.02);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const object = Mesh(geometry, material);

    createEffect(() => {
        const hand = getHand();
        object.mesh.position.copy(hand.position);
        object.mesh.rotation.copy(hand.rotation);
    });

    return object;
}

const head = (getHead: Getter<Thing>): GameObject => {
    const geometry = new THREE.SphereGeometry(0.15);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const object = Mesh(geometry, material);

    createEffect(() => {
        const hand = getHead();
        object.mesh.position.copy(hand.position);
        object.mesh.rotation.copy(hand.rotation);
    });

    return object;
};

export default (body: Body) => {
    
    const left = hand(body.leftHand, 0x00ffff);
    const right = hand(body.rightHand, 0xffff00);
    setInterval(() => console.log("left", left.mesh.position), 1000);
    setInterval(() => console.log("right", right.mesh.position), 1000);
    return [
        right,
        left,
        head(body.head)
    ];
}
import * as THREE from 'three';
import { Mesh } from '../engine/helpers';
import { Getter } from '../signals';
import { Thing } from '../engine/avatarTypes';
import { GameObjectNoMesh } from '../engine/gameTypes';
import * as controlls from "../engine/controls"
import { WorldExport } from '../engine/content';

function clamp(x: number, y: number): number {
    return Math.max(Math.min(x, y), -x);
}

const floater = (toTrack: Getter<Thing>) => { 
    const geometry = new THREE.SphereGeometry(0.01);
    const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const GameObject = Mesh(geometry, material);
    
    let velX = 0;
    let velY = 0;
    let velZ = 0;

    let x = 0.1;
    let y = 0.2;
    let z = 0.1;

    setInterval(() => {
        // F = ma => a = F/m
        // F = d^2
        // const mass = 1;
        let deltaTime = 1;
        deltaTime = deltaTime * 0.01;

        const otherPos = toTrack().position;
        const myPos = new THREE.Vector3(x, y, z);
        const diffX = otherPos.x - myPos.x;
        const diffY = otherPos.y - myPos.y;
        const diffZ = otherPos.z - myPos.z;
        if (diffX + diffY + diffZ > Math.pow(10, 3)) {
            return;
        } 
        const distance = Math.sqrt(
            Math.pow(diffX, 2) + 
            Math.pow(diffY, 2) + 
            Math.pow(diffZ, 2)
        );

        const force = distance * distance;
        const posMagnitude = 3 * force/distance;
        velX += posMagnitude * diffX;
        velY += posMagnitude * diffY;
        velZ += posMagnitude * diffZ;

        velX += -Math.sign(velX) * velX * velX * 0.01;
        velY += -Math.sign(velY) * velY * velY * 0.01;
        velZ += -Math.sign(velZ) * velZ * velZ * 0.01;

        x = myPos.x + velX * deltaTime;
        y = myPos.y + velY * deltaTime;
        z = myPos.z + velZ * deltaTime;

        GameObject.mesh.position.set(
            x, 
            y, 
            z
        );

        x = clamp(10, x);
        y = clamp(10, y);
        z = clamp(10, z);

        velX = clamp(10, velX);
        velY = clamp(10, velY);
        velZ = clamp(10, velZ);
    }, 1);

    GameObject.mesh.position.set(0.01, 0.01, 0.02);
    return GameObject;
};

const world = (): GameObjectNoMesh => {
    return {
        mesh: undefined,
        children: new Set([floater(controlls.signals.getters.rightHand)])
    };
};

const toExport: WorldExport = {
    uniqueName: "floaters!!!!",
    world: world
};

export default toExport;
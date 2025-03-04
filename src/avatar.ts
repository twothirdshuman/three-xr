import * as THREE from 'three';
import { Getter, Setter, createEffect, createRemoteSignal, createSignal } from './signals';
import { GameObject, Mesh } from './game';
import { Body, Thing as ThingLocal } from './avatarTypes';
type Thing = {
    position: {
        x: number,
        y: number,
        z: number
    },
    rotation: {
        x: number,
        y: number,
        z: number,
        order: "XYZ" | "YXZ" | "ZXY" | "ZYX" | "YZX" | "XZY"
    }
};
const thingInit: Thing = {
    position: {
        x: 0, y:0, z:0
    },
    rotation: {
        x: 0, 
        y:0, 
        z:0, 
        order: "XYZ"
    }
};
const hand = (getHand: Getter<ThingLocal>, color: number): GameObject => {
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

const head = (getHead: Getter<ThingLocal>): GameObject => {
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
    const thingInitStr = JSON.stringify(thingInit);
    const [leftHand, setLeftHand] = createRemoteSignal<string>(thingInitStr);
    const [rightHand, setRightHand] = createRemoteSignal<string>(thingInitStr);
    const [getHead, setHead] = createRemoteSignal<string>(thingInitStr);

    const applyThing = (getter: Getter<ThingLocal>, setter: Setter<string>) => {
        return () => {
            const thingLocal: ThingLocal = getter();
            const thing: Thing = {
                position: {
                    x: thingLocal.position.x,
                    y: thingLocal.position.y,
                    z: thingLocal.position.z
                },
                rotation: {
                    x: thingLocal.rotation.x,
                    y: thingLocal.rotation.y,
                    z: thingLocal.rotation.z,
                    order: thingLocal.rotation.order
                }
            }
            setter(JSON.stringify(thing));
        }
    };

    createEffect(applyThing(body.head, setHead));
    createEffect(applyThing(body.leftHand, leftHand));
    createEffect(applyThing(body.rightHand, rightHand));

    const convertToLocal = (getter: Getter<string>): ThingLocal => {
        const parsed: Thing = JSON.parse(getter());
        return {
            position: new THREE.Vector3(parsed.position.x, parsed.position.y, parsed.position.z),
            rotation: new THREE.Euler(parsed.rotation.x, parsed.rotation.y, parsed.rotation.z, parsed.rotation.order)
        }
    };

    return [
        hand(() => convertToLocal(leftHand), 0x00ffff),
        hand(() => convertToLocal(rightHand), 0xffff00),
        head(() => convertToLocal(getHead))
    ];
}
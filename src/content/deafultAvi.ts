import * as THREE from 'three';
import { Getter, Setter, createEffect, createRemoteSignal, createSignal } from '../signals';
import { Children, Mesh } from '../engine/helpers';
import { Body, Thing as ThingLocal } from '../engine/avatarTypes';
import { signals as controlSignals} from "../engine/controls";
import { GameObjectMesh } from '../engine/gameTypes';
import { AvatarExport } from '../engine/content';
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
const hand = (getHand: Getter<ThingLocal>, color: number): GameObjectMesh => {
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

const head = (getHead: Getter<ThingLocal>): GameObjectMesh => {
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

const avatar = () => {
    const thingInitStr = JSON.stringify(thingInit);
    const [leftHand, setLeftHand] = createRemoteSignal(thingInitStr);
    const [rightHand, setRightHand] = createRemoteSignal(thingInitStr);
    const [getHead, setHead] = createRemoteSignal(thingInitStr);

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
    
    createEffect(applyThing(controlSignals.getters.head, setHead));
    createEffect(applyThing(controlSignals.getters.leftHand, setLeftHand));
    createEffect(applyThing(controlSignals.getters.rightHand, setRightHand));

    const convertToLocal = (getter: Getter<string>): ThingLocal => {
        const parsed: Thing = JSON.parse(getter());
        return {
            position: new THREE.Vector3(parsed.position.x, parsed.position.y, parsed.position.z),
            rotation: new THREE.Euler(parsed.rotation.x, parsed.rotation.y, parsed.rotation.z, parsed.rotation.order)
        }
    };

    return Children([
        hand(() => convertToLocal(leftHand), 0x00ffff),
        hand(() => convertToLocal(rightHand), 0xffff00),
        head(() => convertToLocal(getHead))
    ]);
};

const toExport: AvatarExport = {
    avatar: avatar,
    uniqueName: "DeafaultAvi"
};
export default toExport;
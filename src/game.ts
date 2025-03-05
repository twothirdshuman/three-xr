import * as THREE from 'three';
import { Getter } from './signals';

export type GameObjectAllTypes = GameObject | GameObjectNoMesh;
export type GameObjectAll = GameObjectAllTypes | Getter<GameObjectAllTypes>
export interface GameObjectNoMesh {
    mesh: undefined,
    children: GameObjectAll[]
}

export interface GameObject {
    mesh: THREE.Mesh,
    children: GameObjectAll[]
}

export function Mesh(geometry?: THREE.BufferGeometry | undefined, material?: THREE.Material | THREE.Material[] | undefined): GameObject {
    return {
        mesh: new THREE.Mesh(geometry, material),
        children: []
    }
}
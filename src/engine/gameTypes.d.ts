import * as THREE from 'three';
import { Getter } from '../signals';

export type GameObject = GameObjectMesh | GameObjectNoMesh;
export type GameObjectGetter = GameObject | Getter<GameObject>
export interface GameObjectNoMesh {
    mesh: undefined,
    children: Set<GameObjectAll>
}

export interface GameObjectMesh {
    mesh: THREE.Mesh,
    children: Set<GameObjectAll>
}
import * as THREE from 'three';
import { Getter } from '../signals';
import { GameObjectGetter, GameObjectMesh, GameObjectNoMesh } from './gameTypes';

export function Mesh(geometry?: THREE.BufferGeometry | undefined, material?: THREE.Material | THREE.Material[] | undefined): GameObjectMesh {
    return {
        mesh: new THREE.Mesh(geometry, material),
        children: new Set([])
    }
}

export function Children(children: Set<GameObjectGetter> | GameObjectGetter[]): GameObjectNoMesh {
    if (Array.isArray(children)) {
        children = new Set(children);
    }
    return {
        mesh: undefined,
        children: children
    }
}
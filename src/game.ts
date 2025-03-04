import * as THREE from 'three';

export interface GameObject {
    mesh: THREE.Mesh
}

export function Mesh(geometry?: THREE.BufferGeometry | undefined, material?: THREE.Material | THREE.Material[] | undefined): GameObject {
    return {
        mesh: new THREE.Mesh(geometry, material)
    }
}
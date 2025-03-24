import * as THREE from "three";
import { WorldExport } from "../engine/content";
import { GameObject } from "../engine/gameTypes";
import { Children, Mesh } from "../engine/helpers";
import { createSignal } from "../signals";

const Cube = () => {
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshBasicMaterial({ color: Math.floor(Math.random() * 0xffffff) });
    const mesh = Mesh(geometry, material);

    mesh.mesh.position.set(Math.random(), Math.random(), Math.random());

    return mesh;
}

const Cubes = (nCubes: number) => {
    const cubesList: GameObject[] = [];

    for (let i = 0; i < nCubes; i++) {
        cubesList.push(Cube());
    }

    return Children(cubesList);
}

const World = () => {
    let [getCubes, setCubes] = createSignal<GameObject>(Cubes(1));

    setInterval(() => {
        setCubes(Cubes(Math.ceil(Math.random() * 10)));
    }, 500);

    return Children([getCubes]);
};

const toExport: WorldExport = {
    uniqueName: "dynamicCubes",
    world: World
};

export default toExport;
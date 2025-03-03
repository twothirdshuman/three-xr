import * as THREE from 'three';
import * as XRButton from "three/examples/jsm/webxr/XRButton.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

const makeCube = () => {
    
}
const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const geometry2 = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const material2 = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const cube2 = new THREE.Mesh(geometry2, material2);
scene.add(cube);

camera.position.z = 5;

let prevTime = 0;
function animate(time: number) {
    const delta = time - prevTime;
    prevTime = time;
    cube.rotation.x += 0.001 * delta;
    cube.rotation.y += 0.001 * delta;
    // camera.position.z = 5 + 20 * Math.cos(time / 1000);
    const controller = renderer.xr.getController(0).position;
    cube.position.set(controller.x, controller.y, controller.z); 
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate)

// console.log(XRButton);
document.body.appendChild(XRButton.XRButton.createButton(renderer))
// document.body.appendChild();
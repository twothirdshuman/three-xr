import * as THREE from 'three';
import * as XRButton from "three/examples/jsm/webxr/XRButton.js";
import { start } from './engine/sceneRenderer';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(XRButton.XRButton.createButton(renderer));

start({
        scene,camera,renderer
}, "dynamicCubes", {
    debug: true
});
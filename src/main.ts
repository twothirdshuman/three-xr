import * as THREE from 'three';
import * as XRButton from "three/examples/jsm/webxr/XRButton.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

function clamp(x: number, y: number): number {
    return Math.max(Math.min(x, y), -x);
}

const cube = (() => { 
    const geometry = new THREE.BoxGeometry(0.025, 0.025, 0.025);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    return new THREE.Mesh(geometry, material) 
})();
scene.add(cube);

const cube2 = (() => { 
    const geometry = new THREE.SphereGeometry(0.02);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    return new THREE.Mesh(geometry, material) 
})();
scene.add(cube2);

const floater = (() => { 
    const geometry = new THREE.SphereGeometry(0.01);
    const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    return new THREE.Mesh(geometry, material) 
})();
scene.add(floater);

floater.position.set(0.01, 0.01, 0.02);
const floaterUpdate = (() => {
    // const mass = 1;

    let velX = 0;
    let velY = 0;
    let velZ = 0;

    let x = 0.1;
    let y = 0.2;
    let z = 0.1;

    // F = ma => a = F/m
    // F = d^2

    return (deltaTime) => {
        deltaTime = deltaTime * 0.01;

        if (cube2.position.distanceTo(new THREE.Vector3(0, 0, 0)) > 10) {
            console.log("ere");
            return;
        }

        const otherPos = cube2.position;
        const myPos = new THREE.Vector3(x, y, z);
        if (Number.isNaN(otherPos.x + otherPos.z + otherPos.y + myPos.x + myPos.y + myPos.z)) {
            alert("aaa");
            debugger;
        }
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
        if (Number.isNaN(velX)) {
            debugger;
        }
        velY += posMagnitude * diffY;
        velZ += posMagnitude * diffZ;

        velX += -Math.sign(velX) * velX * velX * 0.01;
        velY += -Math.sign(velY) * velY * velY * 0.01;
        velZ += -Math.sign(velZ) * velZ * velZ * 0.01;

        x = myPos.x + velX * deltaTime;
        y = myPos.y + velY * deltaTime;
        z = myPos.z + velZ * deltaTime;

        if (Number.isNaN(x)) {
            debugger;
        }

        floater.position.set(
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
        
    };
})();

camera.position.z = 2;

let prevTime = 0;
function animate(time: number) {
    const delta = time - prevTime;
    prevTime = time;
    cube.rotation.x += 0.001 * delta;
    cube.rotation.y += 0.001 * delta;
    
    let controller = renderer.xr.getController(0).position;
    cube.position.set(controller.x, controller.y, controller.z); 

    controller = renderer.xr.getController(1).position;
    cube2.position.set(controller.x, controller.y, controller.z); 

    //floaterUpdate(delta);
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate)
setInterval(() => floaterUpdate(1), 1);
document.body.appendChild(XRButton.XRButton.createButton(renderer))
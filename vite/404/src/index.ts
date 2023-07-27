import * as THREE from "three";
import { enableStylesheet, disableStylesheet, getVar, toggleMusic } from "./helper";
import { displayTexture, makeCampfire, makeLift, makeNotice } from "./generators";
import { setCamera, setRatio, setRenderer, setSpawned } from "./states";
import "./handler";

if (getVar("no_music") == "0") (document.getElementById("player") as HTMLAudioElement).play();
else if (!getVar("no_music")) toggleMusic();

const scene = new THREE.Scene();
const camera = setCamera(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500)) as THREE.PerspectiveCamera;
const renderer = setRenderer(new THREE.WebGLRenderer({
	canvas: document.querySelector(`#bg`)!
}));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
export var midX: number, midY: number;

const pointLight = new THREE.PointLight(0xfff8be, 1.5, 300, 2);
pointLight.position.y = camera.position.y = 0;
pointLight.castShadow = true;
scene.add(pointLight);
const obj = makeLift(scene);
export const { doorL, doorR, buttonU, buttonD, sign, display } = obj;
export function spawnOutside() {
	setSpawned(true);
	makeCampfire(scene);
	makeNotice(scene);
}

export function resize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	renderer.render(scene, camera);
	midX = window.innerWidth / 2;
	midY = window.innerHeight / 2;
	const ratio = setRatio(window.innerWidth / window.innerHeight);
	if (ratio < 1) {
		enableStylesheet(document.getElementById("vertical"));
		disableStylesheet(document.getElementById("horizontal"));
	} else {
		enableStylesheet(document.getElementById("horizontal"));
		disableStylesheet(document.getElementById("vertical"));
	}
}

function animate() {
	requestAnimationFrame(animate);

	renderer.render(scene, camera);
}

resize();
animate();

const xm = new THREE.MeshStandardMaterial({ map: displayTexture(null), transparent: true });
xm.map!.needsUpdate = true;
display.material.splice(4, 1, xm);
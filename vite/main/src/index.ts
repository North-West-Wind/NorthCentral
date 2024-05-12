import * as THREE from "three";
import WebGL from "three/examples/jsm/capabilities/WebGL.js";
import { displayTexture, makeLift } from "./generators";
import { getGotoFloor, getRatio, setActualFloor, setCamera, setCurrentFloor, setFloor, setGotoFloor, setPassedInFloor, setRatio, setRenderer, setSpawned } from "./states";
import { enableStylesheet, disableStylesheet } from "./helpers/css";
import { getVar, setVar, toggleMusic } from "./helpers/control";
import { holdModelLoads } from "./loaders";
import { FLOORS } from "./constants";
import "./handler";

if (!WebGL.isWebGLAvailable()) {
  alert("WebGL is not supported! You have lost your privilege to the R³ space.");
  const split = window.location.href.split("/");
  split.splice(3, 0, "2d");
  window.location.href = split.join("/");
}

const passedInFloor = setPassedInFloor(Array.from(FLOORS.keys()).indexOf(window.location.pathname.split("/")[1]));

if (getVar("use_cookies")) {
  setVar("use_cookies", 1);
  setVar("answered", 1);
  for (const key of Object.keys(window.sessionStorage)) setVar(key, window.sessionStorage.getItem(key));
}
if (getVar("no_music") == "0") (document.getElementById("player") as HTMLAudioElement).play();
else if (!getVar("no_music")) toggleMusic();

export const scene = new THREE.Scene();
const camera = setCamera(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)) as THREE.PerspectiveCamera;
const renderer = setRenderer(new THREE.WebGLRenderer({
  canvas: document.querySelector(`#bg`)!
}));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
export var midX: number, midY: number;

export const pointLight = new THREE.PointLight(0xfff8be, 1.5, 300, 2);
pointLight.position.y = camera.position.y = passedInFloor > 0 ? 1000 * passedInFloor : 0;
pointLight.castShadow = true;
scene.add(pointLight);
export const obj = makeLift(scene);
export const { doorL, doorR, buttonU, buttonD, sign, display } = obj;
var outside: any;
export async function spawnOutside() {
  setSpawned(true);
  const floor = setFloor(Array.from(FLOORS.values())[getGotoFloor()]);
  outside = await floor.generate(scene);
}
export function despawnOutside() {
  setSpawned(false);
  for (const ob of Object.values(outside)) {
    if (Array.isArray(ob)) scene.remove(...ob);
    else scene.remove(ob as any);
  }
  outside = undefined;
}

export function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.render(scene, camera);
  midX = window.innerWidth / 2;
  midY = window.innerHeight / 2;
  setRatio(window.innerWidth / window.innerHeight);
  if (getRatio() < 1) {
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

(async () => {
  if (passedInFloor > 0) {
    setActualFloor(setCurrentFloor(setGotoFloor(passedInFloor)));
    const xm = new THREE.MeshStandardMaterial({ map: displayTexture(passedInFloor), transparent: true });
    xm.map!.needsUpdate = true;
    display.material.splice(4, 1, xm);
    await holdModelLoads();
    spawnOutside();
  }
})();
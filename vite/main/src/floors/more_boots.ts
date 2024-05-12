import * as THREE from "three";
import Floor from "../types/floor";
import { GLTF_LOADED, LOADER } from "../loaders";
import { camera, rotatedY, touched } from "../states";
import { openOrCloseInfo } from "../helpers/html";

const div = document.getElementById("info")!;
export default class MoreBootsFloor extends Floor {
	constructor() {
		super("more-boots", 2);
	}

	spawn(scene: THREE.Scene) {
		const armorStand = GLTF_LOADED.armor_stand;
		armorStand.position.set(0, 1969.5, -156.5);
		armorStand.scale.set(20, 20, 20);
		scene.add(armorStand);
	
		const geometryC = new THREE.BoxGeometry(16, 16, 80);
		const material = new THREE.MeshBasicMaterial({ color: 0xa0a6a7 });
		const corridor = new THREE.Mesh(geometryC, material);
		corridor.position.set(0, 1961.5, -92.5);
		scene.add(corridor);
	
		const geometryP = new THREE.BoxGeometry(48, 16, 48);
		const platform = new THREE.Mesh(geometryP, material);
		platform.position.set(0, 1961.5, -156.5);
		scene.add(platform);
	
		const geometryB = new THREE.BoxGeometry(5, 7.5, 5);
		const materials = [
				new THREE.MeshBasicMaterial({ map: LOADER.load("/assets/textures/diamond_boots/side_0.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
				new THREE.MeshBasicMaterial({ map: LOADER.load("/assets/textures/diamond_boots/side_1.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
				new THREE.MeshBasicMaterial({ map: LOADER.load("/assets/textures/diamond_boots/bottom.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
				new THREE.MeshBasicMaterial({ map: LOADER.load("/assets/textures/diamond_boots/side_2.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
				new THREE.MeshBasicMaterial({ map: LOADER.load("/assets/textures/diamond_boots/side_3.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
				new THREE.MeshBasicMaterial({ map: LOADER.load("/assets/textures/diamond_boots/bottom.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
		];
		const bootL = new THREE.Mesh(geometryB, materials);
		const bootR = new THREE.Mesh(geometryB, materials);
		bootL.position.set(-2.5, 1974, -156.5);
		bootR.position.set(2.5, 1974, -156.5);
		scene.add(bootL, bootR);
	
		return { corridor, platform, bootL, bootR };
	}

	handleWheel(scroll: number) {
		const cam = camera();
		if (cam.position.y != this.num * 1000) cam.position.y = this.num * 1000;
		const rotateAngle = -1.2;
		const maxDist = 100;
		var zoomLimitReached = false, maxed = false;
		if (cam.position.z == -maxDist && scroll > 0 && !touched()) {
			if (div.classList.contains('hidden')) openOrCloseInfo(this.num);
		} else if (!(cam.position.z == 0 && scroll < 0)) {
			cam.translateZ(-scroll);
			if (cam.position.z > 0) {
				cam.position.z = 0;
				maxed = true;
			}
			else if (cam.position.z < -maxDist) {
				cam.position.z = -maxDist;
				if (touched()) zoomLimitReached = true;
				maxed = true;
			}
		}
		if (cam.position.x != 0) cam.position.x = 0;
		rotatedY(rotateAngle * Math.abs(cam.position.z) / maxDist);

		if (zoomLimitReached) openOrCloseInfo(this.num);
		return maxed;
	}
}
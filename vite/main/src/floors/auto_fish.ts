import * as THREE from "three";
import Floor from "../types/floor";
import { LOADER } from "../loaders";
import { getRenderer, getCamera, getTouched, setRotatedX } from "../states";
import { openOrCloseInfo } from "../helpers/html";

const div = document.getElementById("info")!;
const WATER_TEXTURES: THREE.Texture[] = [];
export default class AutoFishFloor extends Floor {
	constructor() {
		super("auto-fish", 1);
	}

	generate(scene: THREE.Scene) {
		for (let i = 0; i < 32; i++) {
			const water = LOADER.load(`/assets/textures/water/water_still-00-${(i < 10 ? "0" : "") + i}.png`, texture => {
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				texture.offset.set(0, 0);
				texture.repeat.set(100, 100);
				texture.magFilter = THREE.NearestFilter;
				texture.minFilter = THREE.LinearMipMapLinearFilter;
			});
			WATER_TEXTURES.push(water);
		}

		const geometryW = new THREE.BoxGeometry(1000, 10, 1000);
		const materialW = new THREE.MeshBasicMaterial({ map: WATER_TEXTURES[0], opacity: 0.4, transparent: true });
		materialW.map!.needsUpdate = true;
		const ocean = new THREE.Mesh(geometryW, materialW);
		ocean.position.set(0, 946.5, -550);
		scene.add(ocean);

		const geometryF = new THREE.BoxGeometry(128, 16, 80);
		const oakF = LOADER.load("/assets/textures/oak_planks.png", texture => {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			texture.offset.set(0, 0);
			texture.repeat.set(8, 5);
			texture.magFilter = THREE.NearestFilter;
			texture.minFilter = THREE.LinearMipMapLinearFilter;
		});
		const materialF = new THREE.MeshStandardMaterial({ map: oakF });
		const oakFloor = new THREE.Mesh(geometryF, materialF);
		oakFloor.position.set(0, 959.5, -90);
		scene.add(oakFloor);

		const geometryR = new THREE.BoxGeometry(3, 80, 3);
		const materialR = new THREE.MeshStandardMaterial({ color: 0xad7726 });
		const fishingRod = new THREE.Mesh(geometryR, materialR);
		fishingRod.position.set(56, 991.5, -122);
		fishingRod.setRotationFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI / 6);
		scene.add(fishingRod);

		const geometryS = new THREE.BoxGeometry(1, 80, 1);
		const materialS = new THREE.MeshStandardMaterial({ color: 0xffffff });
		const string = new THREE.Mesh(geometryS, materialS);
		string.position.set(56, 984, -140);
		scene.add(string);

		const geometryH = new THREE.BoxGeometry(8, 16, 8);
		const materialH = new THREE.MeshStandardMaterial({ color: 0x7d4700 });
		const holder = new THREE.Mesh(geometryH, materialH);
		holder.position.set(56, 975.5, -118);
		scene.add(holder);

		var oceanCounter = 0;
		setInterval(() => {
			if (!ocean) return;
			oceanCounter = ++oceanCounter % 32;
			const materialW = new THREE.MeshBasicMaterial({ map: WATER_TEXTURES[oceanCounter], opacity: 0.4, transparent: true });
			materialW.map!.needsUpdate = true;
			ocean.material = materialW;
			getRenderer().render(scene, getCamera());
		}, 250);
		return { ocean, oakFloor, fishingRod, string, holder };
	}

	handleWheel(scroll: number): void {
		const camera = getCamera();
		if (camera.position.y != this.num * 1000) camera.position.y = this.num * 1000;
		const rotateAngle = -1 / 2;
		const maxDist = 70;
		const touched = getTouched();
		var zoomLimitReached = false;
		if (camera.position.z == -maxDist && scroll > 0 && !touched) {
			if (div.classList.contains('hidden')) openOrCloseInfo(this.num);
		} else if (!(camera.position.z == 0 && scroll < 0)) {
			camera.translateZ(-scroll);
			if (camera.position.z > 0) camera.position.z = 0;
			else if (camera.position.z < -maxDist) {
				camera.position.z = -maxDist;
				if (touched) zoomLimitReached = true;
			}
		}

		if (camera.position.x != 0) camera.position.x = 0;
		setRotatedX(rotateAngle * Math.abs(camera.position.z) / maxDist);

		if (zoomLimitReached) openOrCloseInfo(this.num);
	}
}
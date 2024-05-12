import * as THREE from "three";
import Floor from "../types/floor";
import { LOADER } from "../loaders";
import { getCamera, getTouched, setRotatedX } from "../states";
import { openOrCloseInfo } from "../helpers/html";

const div = document.getElementById("info")!;
export default class SkyFarmFloor extends Floor {
	constructor() {
		super("sky-farm", 3);
	}

	generate(scene: THREE.Scene) {
		const geometryS = new THREE.BoxGeometry(250, 2, 250);
		const material = new THREE.MeshBasicMaterial({ color: 0x46c7ec });
		const skyT = new THREE.Mesh(geometryS, material);
		const skyB = new THREE.Mesh(geometryS, material);
		skyT.position.set(0, 3125, -175);
		skyB.position.set(0, 2875, -175);
	
		const geometryW = new THREE.BoxGeometry(2, 250, 250);
		const skyL = new THREE.Mesh(geometryW, material);
		const skyR = new THREE.Mesh(geometryW, material);
		skyL.position.set(-126, 3000, -175);
		skyR.position.set(126, 3000, -175);
	
		const geometryF = new THREE.BoxGeometry(250, 250, 2);
		const skyF = new THREE.Mesh(geometryF, material);
		skyF.position.set(0, 3000, -301);
		scene.add(skyT, skyB, skyL, skyR, skyF);
	
		const geometryB = new THREE.BoxGeometry(24, 8, 24);
		const matSide = new THREE.MeshBasicMaterial({ color: 0x888888, map: LOADER.load("/assets/textures/grass/side.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(3, 1); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) });
		const materials = [
				matSide,
				matSide,
				new THREE.MeshBasicMaterial({ color: 0x888888, map: LOADER.load("/assets/textures/grass/top.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(3, 3); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
				matSide,
				matSide,
				new THREE.MeshBasicMaterial({ color: 0x888888, map: LOADER.load("/assets/textures/grass/bottom.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(3, 3); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
		];
		const block = new THREE.Mesh(geometryB, materials);
		block.position.set(0, 2970, -175);
		scene.add(block);
	
		const geometryL = new THREE.BoxGeometry(8, 40, 8);
		const matSideL = new THREE.MeshBasicMaterial({ color: 0x888888, map: LOADER.load("/assets/textures/tree/side.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(1, 5); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) });
		const materialsL = [
				matSideL,
				matSideL,
				new THREE.MeshBasicMaterial({ color: 0x888888, map: LOADER.load("/assets/textures/tree/top.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
				matSideL,
				matSideL,
				new THREE.MeshBasicMaterial({ color: 0x888888, map: LOADER.load("/assets/textures/tree/top.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) })
		];
		const logs = new THREE.Mesh(geometryL, materialsL);
		logs.position.set(0, 2994, -175);
		scene.add(logs);
	
		const geometryL0 = new THREE.BoxGeometry(40, 16, 40);
		const matSideL0 = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, map: LOADER.load("/assets/textures/tree/leaves.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(5, 2); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) });
		const matTopL0 = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, map: LOADER.load("/assets/textures/tree/leaves.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(5, 5); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) });
		const leaves0 = new THREE.Mesh(geometryL0, [matSideL0, matSideL0, matTopL0, matSideL0, matSideL0, matTopL0]);
		leaves0.position.set(0, 2998, -175);
	
		const geometryL1 = new THREE.BoxGeometry(24, 8, 24);
		const matSideL1 = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, map: LOADER.load("/assets/textures/tree/leaves.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(3, 1); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) });
		const matTopL1 = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, map: LOADER.load("/assets/textures/tree/leaves.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(3, 3); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) });
		const leaves1 = new THREE.Mesh(geometryL1, [matSideL1, matSideL1, matTopL1, matSideL1, matSideL1, matTopL1]);
		leaves1.position.set(0, 3010, -175);
	
		const geometryL2 = new THREE.BoxGeometry(24, 8, 8);
		const matSideL2 = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, map: LOADER.load("/assets/textures/tree/leaves.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(3, 1); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) });
		const matTopL2 = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, map: LOADER.load("/assets/textures/tree/leaves.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) });
		const leaves2 = new THREE.Mesh(geometryL2, [matTopL2, matSideL2, matSideL2, matTopL2, matSideL2, matSideL2]);
		leaves2.position.set(0, 3018, -175);
	
		const geometryL3 = new THREE.BoxGeometry(8, 8, 24);
		const matSideL3 = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, map: LOADER.load("/assets/textures/tree/leaves.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(1, 3); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) });
		const leaves3 = new THREE.Mesh(geometryL3, [matSideL2, matTopL2, matSideL3, matSideL2, matTopL2, matSideL3]);
		leaves3.position.set(0, 3018, -175);
		scene.add(leaves0, leaves1, leaves2, leaves3);
		return { skyT, skyB, skyL, skyR, skyF, block, logs, leaves0, leaves1, leaves2, leaves3 };
	}

	handleWheel(scroll: number) {
		const camera = getCamera();
		const rotateAngle = -1;
		const maxDist0 = 100;
		const maxDist1 = 162;
		const maxDist2 = 8;
		const maxDist3 = 17.5;
		const touched = getTouched();
		var zoomLimitReached = false, maxed = false;
		if (camera.position.z <= -maxDist0) {
			if (camera.position.z > -maxDist1 || scroll < 0) {
				camera.translateZ(-scroll);
				if (camera.position.z < -maxDist1) {
					camera.position.z = -maxDist1;
					if (touched) zoomLimitReached = true;
					maxed = true;
				}
				camera.position.x = -(Math.abs(camera.position.z) - maxDist0) * maxDist2 / (maxDist1 - maxDist0);
				camera.position.y = -(Math.abs(camera.position.z) - maxDist0) * maxDist3 / (maxDist1 - maxDist0) + this.num * 1000;
				setRotatedX(rotateAngle * (Math.abs(camera.position.z) - maxDist0) / (maxDist1 - maxDist0));
			} else if (scroll > 0 && !touched) {
				if (div.classList.contains('hidden')) openOrCloseInfo(this.num);
			}
		} else {
			camera.translateZ(-scroll);
			if (camera.position.z > 0) {
				camera.position.z = 0;
				maxed = true;
			}
			if (camera.position.x != 0) camera.position.x = 0;
			if (camera.position.y != this.num * 1000) camera.position.y = this.num * 1000;
			setRotatedX(0);
		}

		if (zoomLimitReached) openOrCloseInfo(this.num);
		return maxed;
	}
}
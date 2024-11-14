import * as THREE from "three";
import Floor from "../types/floor";
import { GLTF_LOADED, TEXTURE_LOADER } from "../loaders";
import { camera } from "../states";
import { toggleContent } from "../helpers/html";
import { LazyLoader } from "../types/misc";
import { readPage } from "../helpers/reader";

enum ModPage {
	AUTO_FISH = "auto-fish",
	MORE_BOOTS = "more-boots"
};

const WATER_TEXTURES: THREE.Texture[] = [];
const MOD_CONTENTS = new Map<string, LazyLoader<string>>();
for (const page of Object.values(ModPage)) MOD_CONTENTS.set(page, new LazyLoader(() => readPage(`/contents/mods/${page}.html`)));

export default class ModsFloor extends Floor {
	textureUpdater?: NodeJS.Timer;

	constructor() {
		super("mods", 2);
		this.listenClick = true;
		this.listenMove = true;
	}

	async spawn(scene: THREE.Scene) {
		for (let i = 0; i < 32; i++) {
			const water = TEXTURE_LOADER.load(`/assets/textures/water/water_still-00-${(i < 10 ? "0" : "") + i}.png`, texture => {
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
		ocean.position.set(0, this.num * 1000 - 53.5, -550);
		scene.add(ocean);

		const geometryF = new THREE.BoxGeometry(128, 16, 80);
		const oakF = TEXTURE_LOADER.load("/assets/textures/oak_planks.png", texture => {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			texture.offset.set(0, 0);
			texture.repeat.set(8, 5);
			texture.magFilter = THREE.NearestFilter;
			texture.minFilter = THREE.LinearMipMapLinearFilter;
		});
		const materialF = new THREE.MeshStandardMaterial({ map: oakF });
		const oakFloor = new THREE.Mesh(geometryF, materialF);
		oakFloor.position.set(0, this.num * 1000 - 40.5, -90);
		scene.add(oakFloor);

		const geometryR = new THREE.BoxGeometry(3, 80, 3);
		const materialR = new THREE.MeshStandardMaterial({ color: 0xad7726 });
		const fishingRod = new THREE.Mesh(geometryR, materialR);
		fishingRod.position.set(56, this.num * 1000 - 8.5, -122);
		fishingRod.setRotationFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI / 6);
		scene.add(fishingRod);

		const geometryS = new THREE.BoxGeometry(1, 80, 1);
		const materialS = new THREE.MeshStandardMaterial({ color: 0xffffff });
		const string = new THREE.Mesh(geometryS, materialS);
		string.position.set(56, this.num * 1000 - 16, -140);
		scene.add(string);

		const geometryH = new THREE.BoxGeometry(8, 16, 8);
		const materialH = new THREE.MeshStandardMaterial({ color: 0x7d4700 });
		const holder = new THREE.Mesh(geometryH, materialH);
		holder.position.set(56, this.num * 1000 - 24.5, -118);
		scene.add(holder);

		var oceanCounter = 0;
		this.textureUpdater = setInterval(() => {
			if (!ocean) return;
			oceanCounter = ++oceanCounter % 32;
			const materialW = new THREE.MeshBasicMaterial({ map: WATER_TEXTURES[oceanCounter], opacity: 0.4, transparent: true });
			materialW.map!.needsUpdate = true;
			ocean.material = materialW;
		}, 250);

		const armorStand = await GLTF_LOADED.armor_stand.get();
		armorStand.position.set(-48, this.num * 1000 - 30.5, -114);
		armorStand.rotation.set(0, Math.PI / 4, 0);
		armorStand.scale.set(20, 20, 20);
		scene.add(armorStand);
	
		/*const geometryC = new THREE.BoxGeometry(16, 16, 80);
		const material = new THREE.MeshBasicMaterial({ color: 0xa0a6a7 });
		const corridor = new THREE.Mesh(geometryC, material);
		corridor.position.set(0, this.num * 1000 - 38.5, -92.5);
		scene.add(corridor);
	
		const geometryP = new THREE.BoxGeometry(48, 16, 48);
		const platform = new THREE.Mesh(geometryP, material);
		platform.position.set(0, this.num * 1000 - 38.5, -156.5);
		scene.add(platform);*/
	
		const geometryB = new THREE.BoxGeometry(5, 7.5, 5);
		const materials = [
				new THREE.MeshBasicMaterial({ map: TEXTURE_LOADER.load("/assets/textures/diamond_boots/side_0.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
				new THREE.MeshBasicMaterial({ map: TEXTURE_LOADER.load("/assets/textures/diamond_boots/side_1.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
				new THREE.MeshBasicMaterial({ map: TEXTURE_LOADER.load("/assets/textures/diamond_boots/bottom.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
				new THREE.MeshBasicMaterial({ map: TEXTURE_LOADER.load("/assets/textures/diamond_boots/side_2.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
				new THREE.MeshBasicMaterial({ map: TEXTURE_LOADER.load("/assets/textures/diamond_boots/side_3.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
				new THREE.MeshBasicMaterial({ map: TEXTURE_LOADER.load("/assets/textures/diamond_boots/bottom.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
		];
		const bootL = new THREE.Mesh(geometryB, materials);
		const bootR = new THREE.Mesh(geometryB, materials);
		bootL.position.set(-48, this.num * 1000 - 26, -114);
		bootL.rotation.set(0, Math.PI / 4, 0);
		bootL.translateX(-2.5);
		bootR.position.set(-48, this.num * 1000 - 26, -114);
		bootR.rotation.set(0, Math.PI / 4, 0);
		bootR.translateX(2.5);
		scene.add(bootL, bootR);
	
		return { ocean, oakFloor, fishingRod, string, holder, armorStand, bootL, bootR };
	}

	despawn(scene: THREE.Scene) {
		super.despawn(scene);
		if (this.textureUpdater) clearInterval(this.textureUpdater);
	}

	handleWheel(scroll: number) {
		const cam = camera();
		if (cam.position.y != this.num * 1000) cam.position.y = this.num * 1000;
		const maxDist = 70;
		var maxed = false;
		if (!(cam.position.z == 0 && scroll < 0)) {
			cam.translateZ(-scroll);
			if (cam.position.z > 0) {
				cam.position.z = 0;
				maxed = true;
			}
			else if (cam.position.z < -maxDist) {
				cam.position.z = -maxDist;
				maxed = true;
			}
		}
		if (cam.position.x != 0) cam.position.x = 0;

		return maxed;
	}

	private async toggleModInfo(page: ModPage) {
		toggleContent({ html: await MOD_CONTENTS.get(page)!.get() });
	}

	clickRaycast(raycaster: THREE.Raycaster) {
		if (this.meshes) {
			if (raycaster.intersectObjects([<THREE.Mesh>this.meshes.fishingRod, <THREE.Mesh>this.meshes.string, <THREE.Mesh>this.meshes.holder]).length) this.toggleModInfo(ModPage.AUTO_FISH);
			else if (raycaster.intersectObjects([<THREE.Group>this.meshes.armorStand, <THREE.Mesh>this.meshes.bootL, <THREE.Mesh>this.meshes.bootR]).length) this.toggleModInfo(ModPage.MORE_BOOTS);
		}
	}

	moveCheck() {
		if (this.meshes) return [this.meshes.fishingRod, this.meshes.string, this.meshes.holder, this.meshes.armorStand, this.meshes.bootL, this.meshes.bootR];
		else return super.moveCheck();
	}
}
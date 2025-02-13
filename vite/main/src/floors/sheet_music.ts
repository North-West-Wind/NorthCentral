import * as THREE from "three";
import Floor, { Generated } from "../types/floor";
import { GLTF_LOADED } from "../loaders";
import { camera, rotatedY, started } from "../states";
import { toggleContent } from "../helpers/html";
import { fetchText } from "../helpers/reader";
import { LazyLoader } from "../types/misc";

const SHEETS = 12;

export const SHEETMUSIC_CONTENTS: LazyLoader<string>[] = [];

for (let i = 0; i < SHEETS; i++) {
	const loader = new LazyLoader(() => fetchText(`/contents/sheetmusic/info-${i}.html`));
	SHEETMUSIC_CONTENTS.push(loader);
}

export default class SheetMusicFloor extends Floor {
	sheets?: THREE.Mesh[];

	constructor() {
		super("sheet-music", 5);
		this.listenClick = true;
		this.listenMove = true;
	}

	private sheetTexture(index: number) {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d")!;
		canvas.width = 3508;
		canvas.height = 2480;
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		const img = new Image();
		return new Promise<THREE.Texture>(resolve => {
			img.onload = () => {
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
				const texture = new THREE.Texture(canvas);
				texture.generateMipmaps = false;
				texture.minFilter = THREE.LinearFilter;
				texture.needsUpdate = true;
				resolve(texture);
			}
			img.src = `/assets/sheets/sheet-${index}.svg`;
		});
	}

	async spawn(scene: THREE.Scene) {
		const piano = await GLTF_LOADED.piano.get();
		piano.position.set(0, 4956, -215);
		piano.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 6 - Math.random() * Math.PI * 2 / 3);
		piano.scale.set(15, 15, 15);
		scene.add(piano);

		const geometry = new THREE.BoxGeometry(500, 2, 500);
		const material = new THREE.MeshStandardMaterial({ color: 0x733410 });
		const floor0 = new THREE.Mesh(geometry, material);
		floor0.position.set(0, 4965, -200);
		scene.add(floor0);

		const spotLight = new THREE.SpotLight(0xffffff, 15000, 300, Math.PI / 2, 1, 2);
		spotLight.position.set(0, 5006, -215);
		scene.add(spotLight);

		const objects: Generated = { piano, floor0, spotLight };

		const geometryS = new THREE.BoxGeometry(5, 0.1, 5 * Math.SQRT2);
		const materialS = new THREE.MeshStandardMaterial({ color: 0x777777 });
		this.sheets = [];
		for (let ii = 0; ii < SHEETS; ii++) {
			const xm = new THREE.MeshStandardMaterial({ map: await this.sheetTexture(ii), transparent: true });
			const sheet = new THREE.Mesh(geometryS, [materialS, materialS, xm, materialS, materialS, materialS]);
			sheet.position.set(THREE.MathUtils.randFloatSpread(40), 4965.9875 + THREE.MathUtils.randFloatSpread(0.001), THREE.MathUtils.randFloatSpread(20) - 195);
			sheet.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.randFloatSpread(Math.PI * 2));
			this.sheets.push(sheet);
			objects[`sheet${ii}`] = sheet;
		}
		scene.add(...this.sheets);


		return objects;
	}

	handleWheel(scroll: number) {
		const cam = camera();
		const rotateAngle = -1.2;
		const maxDist = 175;
		let maxed = false;
		if (!(cam.position.z == 0 && scroll < 0)) {
			cam.translateZ(-scroll);
			if (cam.position.z > 0) {
				cam.position.z = 0;
				maxed = true;
			} else if (cam.position.z < -maxDist) {
				cam.position.z = -maxDist;
				maxed = true;
			}
		}
		if (cam.position.x != 0) cam.position.x = 0;
		cam.position.y = this.num * 1000 + cam.position.z / 10;
		rotatedY(rotateAngle * Math.abs(cam.position.z) / maxDist);
		return maxed;
	}

	private async openOrCloseSheetInfo(index: number) {
		toggleContent({ html: await SHEETMUSIC_CONTENTS[index].get() });
	}

	clickRaycast(raycaster: THREE.Raycaster): void {
		if (this.sheets && started()) {
			for (let i = 0; i < this.sheets.length; i++)
				if (raycaster.intersectObject(this.sheets[i]).length > 0) {
					this.openOrCloseSheetInfo(i);
					break;
				}
		}
	}

	moveCheck() {
		return this.sheets || super.moveCheck();
	}
}
import * as THREE from "three";
import Floor from "../types/floor";
import { GLTF_LOADED } from "../loaders";
import { getCamera, getStarted, setRotatedY } from "../states";
import { hideOrUnhideInfo, setInnerHTML } from "../helpers/html";
import { readPageGenerator } from "../helpers/reader";

export const SHEETMUSIC_CONTENTS: (() => Promise<string> | string)[] = [];
export const SHEETMUSIC_TITLES: string[] = [];

const div = document.getElementById("info")!;
export default class SheetMusicFloor extends Floor {
	static readonly SHEETS = 12;
	sheets?: THREE.Mesh[];

	static {
		for (let i = 0; i < SheetMusicFloor.SHEETS; i++) readPageGenerator(`/contents/sheetmusic/info-${i}.html`, SHEETMUSIC_CONTENTS, /\<h1\>(?<name>.+)\<\/h1\>/, SHEETMUSIC_TITLES);
	}

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

	async generate(scene: THREE.Scene) {
		const piano = GLTF_LOADED.piano;
		piano.position.set(0, 4956, -215);
		piano.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 6 - Math.random() * Math.PI * 2 / 3);
		piano.scale.set(15, 15, 15);
		scene.add(piano);

		const geometry = new THREE.BoxGeometry(500, 2, 500);
		const material = new THREE.MeshStandardMaterial({ color: 0x733410 });
		const floor0 = new THREE.Mesh(geometry, material);
		floor0.position.set(0, 4965, -200);
		scene.add(floor0);

		const geometryS = new THREE.BoxGeometry(5, 0.1, 5 * Math.SQRT2);
		const materialS = new THREE.MeshStandardMaterial({ color: 0x777777 });
		this.sheets = [];
		for (let i = 0; i < SheetMusicFloor.SHEETS; i++) {
			const xm = new THREE.MeshStandardMaterial({ map: await this.sheetTexture(i), transparent: true });
			const sheet = new THREE.Mesh(geometryS, [materialS, materialS, xm, materialS, materialS, materialS]);
			sheet.position.set(THREE.MathUtils.randFloatSpread(40), 4965.9875 + THREE.MathUtils.randFloatSpread(0.001), THREE.MathUtils.randFloatSpread(20) - 195);
			sheet.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.randFloatSpread(Math.PI * 2));
			this.sheets.push(sheet);
		}
		scene.add(...this.sheets);

		const spotLight = new THREE.SpotLight(0xffffff, 2, 300, Math.PI / 2, 1, 2);
		spotLight.position.set(0, 5006, -215);
		scene.add(spotLight);
		return { floor0, sheets: this.sheets };
	}

	handleWheel(scroll: number) {
		const camera = getCamera();
		const rotateAngle = -1.2;
		const maxDist = 175;
		let maxed = false;
		if (!(camera.position.z == 0 && scroll < 0)) {
			camera.translateZ(-scroll);
			if (camera.position.z > 0) {
				camera.position.z = 0;
				maxed = true;
			} else if (camera.position.z < -maxDist) {
				camera.position.z = -maxDist;
				maxed = true;
			}
		}
		if (camera.position.x != 0) camera.position.x = 0;
		camera.position.y = this.num * 1000 + camera.position.z / 10;
		setRotatedY(rotateAngle * Math.abs(camera.position.z) / maxDist);
		return maxed;
	}

	private openOrCloseSheetInfo(index: number) {
		hideOrUnhideInfo(async hidden => {
			if (hidden) setInnerHTML(div, "");
			else setInnerHTML(div, await SHEETMUSIC_CONTENTS[index]());
		});
	}

	clickRaycast(raycaster: THREE.Raycaster): void {
		if (this.sheets && getStarted()) {
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
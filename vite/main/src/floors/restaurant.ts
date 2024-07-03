import * as THREE from "three";
import Floor from "../types/floor";
import { camera } from "../states";
import { toggleContent } from "../helpers/html";
import { readPage } from "../helpers/reader";
import { LazyLoader } from "../types/misc";
import { getConfig, toggleMusic, wait, writeConfig } from "../helpers/control";
import { SVG, Svg } from "@svgdotjs/svg.js";

type FireEntry = {
	mesh: THREE.Mesh;
	direction: THREE.Vector3;
}

const FIRE_COLOR = [
	0xffc003,
	0xff5500,
	0xff5917
];

enum Phase {
	INITIAL,
	TRANSITION,
	DATING,
	DATING_BACK
}

type SummatiaData = {
	[key: string]: {
		message: string;
		emotion: string | number;
		delay: number;
		responses?: { message: string, next: string }[];
		next?: string;
	}
} & { emotions: { [key: string]: number } }

let summatiaData: SummatiaData;

fetch("/data/summatia.json").then(async res => {
	if (res.ok) summatiaData = await res.json();
});

function validKeyOrElse(key: string, fallback: string) {
	return summatiaData && Object.keys(summatiaData).includes(key) ? key : fallback;
}

export default class RestaurantFloor extends Floor {
	phase: Phase;
	allFires: FireEntry[] = [];
	candleLightPos: THREE.Vector3;
	covered = true;
	updateCanvas = true;
	covers?: THREE.Mesh[];
	chair?: THREE.Group;
	// canvas for texture
	canvas: HTMLCanvasElement;
	handsHoldCanvas: HTMLCanvasElement;
	handsTableCanvas: HTMLCanvasElement;
	// textures for summatia
	texture: THREE.CanvasTexture;
	handsHoldTexture: THREE.CanvasTexture;
	handsTableTexture: THREE.CanvasTexture;
	// summatia svg
	summatiaSvg: LazyLoader<string>;
	handsHoldSvg: LazyLoader<string>;
	handsTableSvg: LazyLoader<string>;
	// summatia state
	emotion = 17;
	resets = 0;

	constructor() {
		super("restaurant", 4);
		this.listenUpdate = true;
		this.phase = Phase.INITIAL;
		this.candleLightPos = new THREE.Vector3(0, this.num * 1000 - 4, -100);
		this.canvas = document.createElement("canvas");
		this.handsHoldCanvas = document.createElement("canvas");
		this.handsTableCanvas = document.createElement("canvas");
		// hardcoded currently, can be dynamic from svg
		this.canvas.width = this.handsHoldCanvas.width = this.handsTableCanvas.width = 443;
		this.canvas.height = this.handsHoldCanvas.height = this.handsTableCanvas.height = 618;
		this.texture = new THREE.CanvasTexture(this.canvas);
		this.handsHoldTexture = new THREE.CanvasTexture(this.handsHoldCanvas);
		this.handsTableTexture = new THREE.CanvasTexture(this.handsTableCanvas);
		this.texture.colorSpace = this.handsHoldTexture.colorSpace = this.handsTableTexture.colorSpace = THREE.SRGBColorSpace;
		// svgs
		this.summatiaSvg = new LazyLoader(() => readPage(`/assets/images/summatia/summatia.svg`));
		this.handsHoldSvg = new LazyLoader(() => readPage(`/assets/images/summatia/hands-hold.svg`));
		this.handsTableSvg = new LazyLoader(() => readPage(`/assets/images/summatia/hands-table.svg`));
		// preload
		this.summatiaSvg.get();
		this.handsHoldSvg.get().then(svg => {
			const img = document.createElement("img");
			img.onload = () => {
				this.handsHoldCanvas.getContext("2d")!.drawImage(img, 0, 0);
				this.handsHoldTexture.needsUpdate = true;
			}
			img.src = 'data:image/svg+xml;base64,' + btoa(svg);
		});
		this.handsTableSvg.get().then(svg => {
			const img = document.createElement("img");
			img.onload = () => {
				this.handsTableCanvas.getContext("2d")!.drawImage(img, 0, 0);
				this.handsTableTexture.needsUpdate = true;
			}
			img.src = 'data:image/svg+xml;base64,' + btoa(svg);
		});
	}

	spawn(scene: THREE.Scene) {
		const floor = new THREE.Mesh(new THREE.BoxGeometry(400, 2, 1000), new THREE.MeshStandardMaterial({ color: 0x120d35 }));
		floor.position.set(0, this.num * 1000 - 40, -100);
		scene.add(floor);

		const table = new THREE.Group();
		const tableMat = new THREE.MeshStandardMaterial({ color: 0x824100 });

		const tableTopGeo = new THREE.CylinderGeometry(20, 18, 2, 32);
		const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
		tableTop.position.set(0, this.num * 1000 - 8, -100);
		table.add(tableTop);

		const tableLeg0Geo = new THREE.CylinderGeometry(4, 2, 6, 8);
		const tableLeg0 = new THREE.Mesh(tableLeg0Geo, tableMat);
		tableLeg0.position.set(0, this.num * 1000 - 11, -100);
		table.add(tableLeg0);

		const tableLeg1Geo = new THREE.CylinderGeometry(2, 2, 20, 8);
		const tableLeg1 = new THREE.Mesh(tableLeg1Geo, tableMat);
		tableLeg1.position.set(0, this.num * 1000 - 24, -100);
		table.add(tableLeg1);

		const tableLeg2Geo = new THREE.CylinderGeometry(2, 4, 2, 16);
		const tableLeg2 = new THREE.Mesh(tableLeg2Geo, tableMat);
		tableLeg2.position.set(0, this.num * 1000 - 35, -100);
		table.add(tableLeg2);

		const tableBottomGeo = new THREE.CylinderGeometry(6, 6, 1, 16);
		const tableBottom = new THREE.Mesh(tableBottomGeo, tableMat);
		tableBottom.position.set(0, this.num * 1000 - 36.5, -100);
		table.add(tableBottom);

		const candle = new THREE.Group();

		const candleWaxGeo = new THREE.CylinderGeometry(0.4, 0.4, 3, 8);
		const candleWaxMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
		const candleWax = new THREE.Mesh(candleWaxGeo, candleWaxMat);
		candleWax.position.set(0, this.num * 1000 - 5.5, -100);
		candle.add(candleWax);

		const candleHandleMat = new THREE.MeshStandardMaterial({ color: 0x9d8300 });

		const candleHandleTopGeo = new THREE.CylinderGeometry(0.75, 0.5, 0.5, 8);
		const candleHandleTop = new THREE.Mesh(candleHandleTopGeo, candleHandleMat);
		candleHandleTop.position.set(0, this.num * 1000 - 7.25, -100);
		candle.add(candleHandleTop);

		const candleHandleLegGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
		const candleHandleLeg = new THREE.Mesh(candleHandleLegGeo, candleHandleMat);
		candleHandleLeg.position.set(0, this.num * 1000 - 8, -100);
		candle.add(candleHandleLeg);

		const candleHandleBottomGeo = new THREE.CylinderGeometry(0.5, 0.75, 0.5, 8);
		const candleHandleBottom = new THREE.Mesh(candleHandleBottomGeo, candleHandleMat);
		candleHandleBottom.position.set(0, this.num * 1000 - 8.75, -100);
		candle.add(candleHandleBottom);

		candle.translateY(2);
		table.add(candle);
	
		const pointLight = new THREE.PointLight(0xfff8be, 1, 50, 2);
		pointLight.position.set(0, this.num * 1000 - 0.5, -100);
		table.add(pointLight);

		table.translateY(-2);
		scene.add(table);

		const summatia = new THREE.Mesh(new THREE.PlaneGeometry(this.canvas.width / 15, this.canvas.height / 15), new THREE.MeshBasicMaterial({ map: this.texture, transparent: true }));
		summatia.position.set(0, this.num * 1000 - 4, -124);
		scene.add(summatia);

		const handsHold = new THREE.Mesh(new THREE.PlaneGeometry(this.canvas.width / 15, this.canvas.height / 15), new THREE.MeshBasicMaterial({ map: this.handsHoldTexture, transparent: true }));
		handsHold.position.set(0, this.num * 1000 - 2, -110);
		handsHold.scale.set(0.8, 0.8, 0.8);
		handsHold.visible = false;
		scene.add(handsHold);

		const handsTable = new THREE.Mesh(new THREE.PlaneGeometry(this.canvas.width / 15, this.canvas.height / 15), new THREE.MeshBasicMaterial({ map: this.handsTableTexture, transparent: true }));
		handsTable.position.set(0, this.num * 1000 - 2, -115);
		handsTable.scale.set(0.9, 0.9, 0.9);
		handsTable.visible = false;
		scene.add(handsTable);

		this.chair = new THREE.Group();
		const chairMat = new THREE.MeshStandardMaterial({ color: 0x4d0000 });
		const chairBack = new THREE.Mesh(new THREE.BoxGeometry(12, 18, 2), chairMat);
		chairBack.position.set(0, this.num * 1000 - 12, -70);
		this.chair.add(chairBack);

		const chairLegGeo = new THREE.BoxGeometry(1, 15, 1);
		const chairLegLB = new THREE.Mesh(chairLegGeo, chairMat);
		chairLegLB.position.set(-5.5, this.num * 1000 - 26, -70);
		this.chair.add(chairLegLB);

		const chairLegRB = new THREE.Mesh(chairLegGeo, chairMat);
		chairLegRB.position.set(5.5, this.num * 1000 - 26, -70);
		this.chair.add(chairLegRB);

		const chairLegLF = new THREE.Mesh(chairLegGeo, chairMat);
		chairLegLF.position.set(-5.5, this.num * 1000 - 26, -80);
		this.chair.add(chairLegLF);

		const chairLegRF = new THREE.Mesh(chairLegGeo, chairMat);
		chairLegRF.position.set(5.5, this.num * 1000 - 26, -80);
		this.chair.add(chairLegRF);

		if (this.phase <= Phase.TRANSITION) {
			const coverGeo = new THREE.PlaneGeometry(200, 200);
			const coverMat = new THREE.MeshBasicMaterial({ color: 0 });
			const cover1 = new THREE.Mesh(coverGeo, coverMat);
			cover1.position.set(0, this.num * 1000, -53);
			const cover2 = new THREE.Mesh(coverGeo, coverMat);
			cover2.position.set(0, this.num * 1000, -77);
			this.covers = [cover1, cover2];
			scene.add(cover1, cover2);
		}

		return { table, summatia, handsHold, handsTable, floor };
	}

	handleWheel(scroll: number) {
		const cam = camera();
		if (cam.position.y != this.num * 1000) cam.position.y = this.num * 1000;
		if (this.phase == Phase.TRANSITION) return true;
		let maxed = false;
		const maxDist = 76;
		if (this.phase == Phase.INITIAL) {
			cam.translateZ(-scroll);
			if (cam.position.z < -maxDist) {
				this.phase = Phase.TRANSITION;
				cam.position.z = -maxDist;
				maxed = true;
				if (getConfig().music) toggleMusic();
				setTimeout(() => {
					this.phase = Phase.DATING;
					setTimeout(() => toggleContent(), 1000);
				}, 3000);
			} else if (cam.position.z > 0) {
				cam.position.z = 0;
				maxed = true;
			}
		} else if (this.phase == Phase.DATING_BACK) {
			cam.translateZ(-scroll);
			if (cam.position.z < -maxDist) {
				this.phase = Phase.TRANSITION;
				cam.position.z = -maxDist;
				maxed = true;
				setTimeout(() => {
					this.phase = Phase.DATING;
					toggleContent();
				}, 1000);
			} else if (cam.position.z > 0) {
				cam.position.z = 0;
				maxed = true;
			}
		}

		cam.position.x = 0;
		cam.position.y = this.num * 1000;

		return maxed;
	}

	private createFire(scene: THREE.Scene, amount: number) {
		const fires: FireEntry[] = [];
		const zAxis = new THREE.Vector3(0, 0, 1);
		const yAxis = new THREE.Vector3(0, 1, 0);
		for (let ii = 0; ii < amount; ii++) {
			const geometryR = new THREE.SphereGeometry(THREE.MathUtils.randFloat(0.1, 0.2));
			const materialR = new THREE.MeshBasicMaterial({ color: FIRE_COLOR[Math.floor(Math.random() * FIRE_COLOR.length)], transparent: true });
			const fire = new THREE.Mesh(geometryR, materialR);
			fire.position.set(this.candleLightPos.x, this.candleLightPos.y, this.candleLightPos.z);
			fires.push({ mesh: fire, direction: new THREE.Vector3(0.1, 0, 0).applyAxisAngle(zAxis, THREE.MathUtils.randFloat(0.5, Math.PI * 0.5)).applyAxisAngle(yAxis, THREE.MathUtils.randFloat(0, Math.PI * 2)) });
			scene.add(fire);
		}
		return fires;
	}

	update(scene: THREE.Scene) {
		if (this.covered && this.phase == Phase.DATING) {
			scene.remove(...this.covers!);
			scene.add(this.chair!);
			this.meshes!.chair = this.chair!;
			this.covered = false;
		}

		const newFires: FireEntry[] = [];
		for (let i = 0; i < this.allFires.length; i++) {
			const r = this.allFires[i];
			const result = r.mesh.position.addScaledVector(r.direction, 0.1);
			r.mesh.position.set(result.x, result.y, result.z);
			const distSqr = r.mesh.position.distanceToSquared(this.candleLightPos);
			if (distSqr > 4) scene.remove(r.mesh);
			else {
				(r.mesh.material as THREE.Material).opacity = 1 - (distSqr / 4);
				newFires.push(r);
			}
		}
		if (this.allFires.length < 2 || Math.random() < 0.01) 
			newFires.push(...this.createFire(scene, 1));
		this.allFires = newFires;

		if (this.updateCanvas) {
			this.updateCanvas = false;
			this.summatiaSvg.get().then(svg => {
				const draw = SVG();
				draw.svg(svg);
				this.enableByEmotion(draw);
				const img = document.createElement("img");
				img.onload = () => {
					this.canvas.getContext("2d")!.clearRect(0, 0, this.canvas.width, this.canvas.height);
					this.canvas.getContext("2d")!.drawImage(img, 0, 0);
					this.texture.needsUpdate = true;
				}
				img.src = 'data:image/svg+xml;base64,' + btoa(draw.svg(false));
			});
			this.meshes!.handsTable.visible = !!(this.emotion & (4096));
			this.meshes!.handsHold.visible = !!(this.emotion & (8192));
		}
	}
	
	private enableByEmotion(draw: Svg) {
		draw.find("#eye").forEach(item => item.css({ display: this.emotion & (1 + 2) ? "inline" : "none" }));
		draw.find("#eye-half").forEach(item => item.css({ display: this.emotion & (4 + 8) ? "inline" : "none" }));
		draw.find(".eye-open").forEach(item => item.css({ display: this.emotion & (1 + 4) ? "inline" : "none" }));
		draw.find(".eye-close").forEach(item => item.css({ display: this.emotion & (2 + 8) ? "inline" : "none" }));

		draw.find("#mouth-smile").forEach(item => item.css({ display: this.emotion & (16) ? "inline" : "none" }));
		draw.find("#mouth-sad").forEach(item => item.css({ display: this.emotion & (32) ? "inline" : "none" }));
		draw.find("#mouth-laugh").forEach(item => item.css({ display: this.emotion & (64) ? "inline" : "none" }));
		draw.find("#mouth-mad").forEach(item => item.css({ display: this.emotion & (128) ? "inline" : "none" }));

		draw.find("#blush").forEach(item => item.css({ opacity: this.emotion & (256) ? "1" : "0" }));

		if (this.emotion & (512 + 1024)) {
			draw.find(".left-brow").forEach(item => item.css({ transform: `rotate(${this.emotion & 512 ? "-10" : "20"}deg)` }));
			draw.find(".right-brow").forEach(item => item.css({ transform: `rotate(${this.emotion & 512 ? "10" : "-20"}deg)` }));
		} else
			draw.find(".brow").forEach(item => item.css({ transform: "" }));

		/*
		if (this.emotion & (1024)) console.log("worried");
		draw.find("#brows-angry").forEach(item => item.css({ display: this.emotion & (512) ? "inline" : "none" }));
		draw.find("#brows-worried").forEach(item => item.css({ display: this.emotion & (1024) ? "inline" : "none" }));
		draw.find("#brows").forEach(item => item.css({ display: !(this.emotion & (512 + 1024)) ? "inline" : "none" }));
		*/

		draw.find(".summatia-head").forEach(item => item.css({ transform: `translateY(${this.emotion & 2048 ? "5" : "0"}px)` }));

		draw.find("#hands-face").forEach(item => item.css({ display: this.emotion & (16384) ? "inline" : "none" }));

		if (this.emotion & 32768)
			draw.find(".pupil").forEach(item => item.css({ transform: "translateY(18px)" }));
		else if (this.emotion & 131072) {
			draw.find(".left-pupil").forEach(item => item.css({ transform: "translate(-14px, 9px)" }));
			draw.find(".right-pupil").forEach(item => item.css({ transform: "translate(-24px, 9px)" }));
		} else if (this.emotion & 262144) {
			draw.find(".left-pupil").forEach(item => item.css({ transform: "translate(20px, 9px)" }));
			draw.find(".right-pupil").forEach(item => item.css({ transform: "translate(13px, 9px)" }));
		} else
			draw.find(".pupil").forEach(item => item.css({ transform: "" }));
	}

	loadContent(info: HTMLDivElement) {
		info.style.backgroundColor = "transparent";

		info.querySelector<HTMLDivElement>("#summatia-reset")!.onclick = () => {
			this.resets++;
			getConfig().summatia = "";
			this.next("first");
		}

		const auto = info.querySelector<HTMLDivElement>("#summatia-auto")!;
		auto.querySelector("span")!.innerHTML = "Auto: " + (getConfig().autoSummatia ? "On" : "Off");
		auto.onclick = () => {
			getConfig().autoSummatia = !getConfig().autoSummatia;
			writeConfig();
			auto.querySelector("span")!.innerHTML = "Auto: " + (getConfig().autoSummatia ? "On" : "Off");
		}

		this.next(getConfig().summatia ? "back" : "first");
	}

	unloadContent(info: HTMLDivElement) {
		info.style.backgroundColor = "";
		this.phase = Phase.DATING_BACK;
	}

	private async next(key: string) {
		const data = summatiaData[key];
		if (!data) return;
		let pid = this.resets;
		if (!key.startsWith("back")) {
			// avoid back looping
			getConfig().summatia = key;
			writeConfig();
		}

		this.emotion = typeof data.emotion == "string" ? summatiaData.emotions[data.emotion] : data.emotion;
		this.updateCanvas = true;

		const ans = document.querySelector<HTMLDivElement>("#summatia-ans")!;
		ans.style.opacity = "0";
		ans.innerHTML = "";

		const say = document.querySelector<HTMLDivElement>("#summatia-say")!;
		let message = "";
		for (const char of data.message) {
			message += char;
			say.innerHTML = message;
			await wait(50);
			if ("!,.:;?".includes(char)) await wait(500);
			if (pid != this.resets) return;
		}
		if (data.next) {
			const waitForClick = new Promise<void>((res) => window.addEventListener("click", () => res(), { once: true }));
			if (getConfig().autoSummatia) await Promise.race([wait(1000 + data.message.length * 100), waitForClick]);
			else await waitForClick;
		}
		if (pid != this.resets) return;

		if (data.responses) {
			for (const response of data.responses) {
				const div = document.createElement("div");
				div.innerHTML = response.message;
				div.onclick = () => this.next(response.next);
				ans.appendChild(div);
			}
			ans.style.opacity = "1";
		} else if (data.next) this.next(data.next);
		else this.next(validKeyOrElse(getConfig().summatia, "first"));
	}
}
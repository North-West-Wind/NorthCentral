import * as THREE from "three";
import Floor from "../types/floor";
import { GLTF_LOADED } from "../loaders";
import { camera, rotatedY, touched } from "../states";
import { toggleContent } from "../helpers/html";
import { readPage } from "../helpers/reader";
import { LazyLoader } from "../types/misc";
import { getConfig, toggleMusic } from "../helpers/control";

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

const N0RTHWESTW1ND_CONTENTS: LazyLoader<string>[] = [];

const div = document.getElementById("info")!;
export default class RestaurantFloor extends Floor {
	phase: Phase;
	allFires: FireEntry[] = [];
	candleLightPos: THREE.Vector3;
	covered = true;
	cover?: THREE.Mesh;

	constructor() {
		super("restaurant", 4);
		this.listenUpdate = true;
		this.phase = Phase.INITIAL;
		this.candleLightPos = new THREE.Vector3(0, this.num * 1000 - 2, -100);
	}

	static {
		for (let i = 0; i < 3; i++) N0RTHWESTW1ND_CONTENTS.push(new LazyLoader(() => readPage(`/contents/n0rthwestw1nd/info-${i}.html`)))
	}

	spawn(scene: THREE.Scene) {
		this.covered = true;
		const tableMat = new THREE.MeshStandardMaterial({ color: 0x824100 });

		const tableTopGeo = new THREE.CylinderGeometry(20, 18, 2, 32);
		const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
		tableTop.position.set(0, this.num * 1000 - 8, -100);
		scene.add(tableTop);

		const tableLeg0Geo = new THREE.CylinderGeometry(4, 2, 6, 8);
		const tableLeg0 = new THREE.Mesh(tableLeg0Geo, tableMat);
		tableLeg0.position.set(0, this.num * 1000 - 11, -100);
		scene.add(tableLeg0);

		const tableLeg1Geo = new THREE.CylinderGeometry(2, 2, 20, 8);
		const tableLeg1 = new THREE.Mesh(tableLeg1Geo, tableMat);
		tableLeg1.position.set(0, this.num * 1000 - 24, -100);
		scene.add(tableLeg1);

		const tableLeg2Geo = new THREE.CylinderGeometry(2, 4, 2, 16);
		const tableLeg2 = new THREE.Mesh(tableLeg2Geo, tableMat);
		tableLeg2.position.set(0, this.num * 1000 - 35, -100);
		scene.add(tableLeg2);

		const tableBottomGeo = new THREE.CylinderGeometry(6, 6, 1, 16);
		const tableBottom = new THREE.Mesh(tableBottomGeo, tableMat);
		tableBottom.position.set(0, this.num * 1000 - 36.5, -100);
		scene.add(tableBottom);

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
		scene.add(candle);
	
		const pointLight = new THREE.PointLight(0xfff8be, 1, 50, 2);
		pointLight.position.set(0, this.num * 1000 - 0.5, -100);
		scene.add(pointLight);

		const coverGeo = new THREE.BoxGeometry(100, 100, 1);
		const coverMat = new THREE.MeshBasicMaterial({ color: 0 });
		this.cover = new THREE.Mesh(coverGeo, coverMat);
		this.cover.position.set(0, this.num * 1000, -77);
		scene.add(this.cover);

		return { pointLight, tableLeg0, tableLeg1, tableLeg2, tableBottom, tableTop, candle };
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
				console.log("changing phase");
				this.phase = Phase.TRANSITION;
				cam.position.z = -maxDist;
				maxed = true;
				if (getConfig().music) toggleMusic();
				setTimeout(() => {
					this.phase = Phase.DATING;
				}, 3000);
			} else if (cam.position.z > 0) {
				cam.position.z = 0;
				maxed = true;
			}
		} else if (this.phase == Phase.DATING) {
			// dating state

		}

		if (cam.position.x != 0) cam.position.x = 0;

		return maxed;
	}

	unloadContent() {
		if (!this.phase) this.phase = 1;
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
			scene.remove(this.cover!);
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
	}
}
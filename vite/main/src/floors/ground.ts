import * as THREE from "three";
import Floor from "../types/floor";
import { camera } from "../states";

export default class GroundFloor extends Floor {
	allRains: THREE.Mesh[] = [];

	constructor() {
		super("ground", 0);
		this.listenUpdate = true;
	}

	spawn(scene: THREE.Scene) {
		const geometry = new THREE.BoxGeometry(55, 2, 500);
		const material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
		const floor = new THREE.Mesh(geometry, material);
		floor.position.set(0, -31, -300);
		scene.add(floor);
		return { floor };
	}

	handleWheel(scroll: number) {
		const cam = camera();
		if (cam.position.y != 0) cam.position.y = 0;
		const absoluted = Math.abs(scroll);
		if (cam.position.x != 0) {
			cam.translateX(cam.position.x > 0 ? -absoluted : absoluted);
			if (Math.abs(cam.position.x) <= absoluted) cam.position.x = 0;
		}
		if (cam.position.z != 0) {
			cam.translateZ(cam.position.z > 0 ? -absoluted : absoluted);
			if (Math.abs(cam.position.z) <= absoluted) cam.position.z = 0;
		}
		return true;
	}

	private createRain(scene: THREE.Scene, amount: number) {
		const rains = [];
		const geometryR = new THREE.SphereGeometry(0.25);
		const materialR = new THREE.MeshStandardMaterial({ color: 0x42a6e9 });
		for (let i = 0; i < amount; i++) {
			const rain = new THREE.Mesh(geometryR, materialR);
			rain.position.set(THREE.MathUtils.randFloatSpread(100), 100, -THREE.MathUtils.randFloatSpread(500) - 305);
			rains.push(rain);
			scene.add(rain);
		}
		return rains;
	}

	update(scene: THREE.Scene) {
		const newRains = [];
		for (let i = 0; i < this.allRains.length; i++) {
			const r = this.allRains[i];
			r.translateY(-Math.random() - 3);
			if (r.position.y <= -50) scene.remove(r);
			else newRains.push(r);
		}
		newRains.push(...this.createRain(scene, 10));
		this.allRains = newRains;
	}
}
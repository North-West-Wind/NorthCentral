import * as THREE from "three";
import Floor from "../types/floor";
import { GLTF_LOADED } from "../loaders";
import { getCamera, getTouched, setRotatedY } from "../states";
import { hideOrUnhideInfo, openOrCloseInfo, setInnerHTML } from "../helpers/html";
import { readPageGenerator } from "../helpers/reader";

const PARTICLE_DISTANCE = 200;
const SHRINK_PARTICLE_DISTANCE = 20;
const N0RTHWESTW1ND_CONTENTS: (() => Promise<string> | string)[] = [];

const div = document.getElementById("info")!;
export default class N0rthWestW1ndFloor extends Floor {
	allParticles: { particle: THREE.Mesh, angle: number, distance: number }[] = [];
	paper0?: THREE.Mesh;
	paper1?: THREE.Mesh;
	paper2?: THREE.Mesh;

	constructor() {
		super("n0rthwestw1nd", 4);
		this.listenClick = true;
		this.listenMove = true;
		this.listenUpdate = true;
	}

	static {
		for (let i = 0; i < 3; i++) readPageGenerator(`/contents/n0rthwestw1nd/info-${i}.html`, N0RTHWESTW1ND_CONTENTS);
	}

	generate(scene: THREE.Scene) {
		const desk = GLTF_LOADED.desk;
		desk.position.set(-0.25, 3993.5, -150);
		desk.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
		desk.scale.set(2, 2, 2);
		scene.add(desk);
	
		const geometry = new THREE.BoxGeometry(0.5, 0.1, 0.75);
		const material = new THREE.MeshStandardMaterial({ color: 0x777777 });
		this.paper0 = new THREE.Mesh(geometry, material);
		this.paper1 = new THREE.Mesh(geometry, material);
		this.paper2 = new THREE.Mesh(geometry, material);
		this.paper0.position.set(4, 3998.2, -150);
		this.paper0.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 6);
		this.paper1.position.set(2.5, 3998.2, -148.5);
		this.paper1.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 3);
		this.paper2.position.set(4.2, 3998.2, -148.75);
		this.paper2.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 4);
		scene.add(this.paper0, this.paper1, this.paper2);
	
		const pointLight = new THREE.PointLight(0xfff8be, 1, 50, 2);
		pointLight.position.set(3.5, 4001, -148.725);
		scene.add(pointLight);
		return { paper0: this.paper0, paper1: this.paper1, paper2: this.paper2 };
	}

	handleWheel(scroll: number) {
		const camera = getCamera();
		const rotateAngle = -3;
		const maxDist0 = 140;
		const maxDist1 = 148;
		const maxDist2 = 3;
		const touched = getTouched();
		var zoomLimitReached = false, maxed = false;
		if (camera.position.z <= -maxDist0) {
			if (div.classList.contains('hidden')) {
				if (scroll > 0 && !this.phase) {
					if (!touched) openOrCloseInfo(this.num);
					else zoomLimitReached = true;
					maxed = true;
				} else if (this.phase) {
					camera.translateZ(-scroll);
					if (camera.position.z < -maxDist1) {
						camera.position.z = -maxDist1;
						maxed = true;
					}
					camera.position.x = (Math.abs(camera.position.z) - maxDist0) * maxDist2 / (maxDist1 - maxDist0);
					setRotatedY(rotateAngle * (Math.abs(camera.position.z) - maxDist0) / (maxDist1 - maxDist0));
					if (camera.position.z > -maxDist0) {
						camera.position.x = 0;
						setRotatedY(0);
						this.phase = 0;
					}
				} else camera.translateZ(-scroll);
			}
		} else if (!(camera.position.z == 0 && scroll < 0)) {
			camera.translateZ(-scroll);
			if (camera.position.z > 0) {
				camera.position.z = 0;
				maxed = true;
			}
			else if (camera.position.z < -maxDist0) {
				camera.position.z = -maxDist0;
				maxed = true;
			}
			if (camera.position.z > -maxDist0) this.phase = 0;
			if (camera.position.x != 0) camera.position.x = 0;
		}
		if (camera.position.y != this.num * 1000) camera.position.y = this.num * 1000;

		if (zoomLimitReached) {
			openOrCloseInfo(this.num);
			if (div.classList.contains("visuallyhidden") && !this.phase) this.phase = 1;
		}
		return maxed;
	}

	private openOrCloseNWWInfo(index = 0) {
		hideOrUnhideInfo(async hidden => {
			if (hidden) setInnerHTML(div, "");
			else setInnerHTML(div, await N0RTHWESTW1ND_CONTENTS[index]());
		});
	}

	clickRaycast(raycaster: THREE.Raycaster) {
		if (this.phase && this.paper0 && this.paper1 && this.paper2) {
			if (raycaster.intersectObject(this.paper1).length > 0) this.openOrCloseNWWInfo(0);
			else if (raycaster.intersectObject(this.paper0).length > 0) this.openOrCloseNWWInfo(1);
			else if (raycaster.intersectObject(this.paper2).length > 0) this.openOrCloseNWWInfo(2);
		}
	}

	moveCheck() {
		if (this.paper0 && this.paper1 && this.paper2) return [this.paper0, this.paper1, this.paper2];
		return super.moveCheck();
	}

	private createParticle(scene: THREE.Scene, amount: number) {
		const particles = [];
		const geometryP = new THREE.SphereGeometry(0.25);
		const materialP = new THREE.MeshBasicMaterial({ color: 0x00ffff });
		for (let i = 0; i < amount; i++) {
				const particle = new THREE.Mesh(geometryP, materialP);
				const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);
				particle.position.set(Math.sin(angle) * PARTICLE_DISTANCE, this.num * 1000 + Math.cos(angle) * PARTICLE_DISTANCE, -151);
				particles.push({ particle, angle, distance: PARTICLE_DISTANCE });
				scene.add(particle);
		}
		return particles;
	}

	update(scene: THREE.Scene) {
		const newParticles: { particle: THREE.Mesh, angle: number, distance: number }[] = [];
		for (let i = 0; i < this.allParticles.length; i++) {
			const p = this.allParticles[i];
			const particle = p.particle;
			const angle = p.angle;
			p.distance -= Math.random() + 0.5;
			particle.position.set(Math.sin(angle) * p.distance, this.num * 1000 + Math.cos(angle) * p.distance, -151);
			if (p.distance < SHRINK_PARTICLE_DISTANCE) {
				const scale = p.distance / SHRINK_PARTICLE_DISTANCE;
				particle.scale.set(scale, scale, scale);
			}
			if (p.distance <= 0) scene.remove(particle);
			else newParticles.push(p);
		}
		newParticles.push(...this.createParticle(scene, 1));
		this.allParticles = newParticles;
	}
}
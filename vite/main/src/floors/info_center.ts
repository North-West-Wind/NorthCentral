import * as THREE from "three";
import Floor, { Generated } from "../types/floor";
import { camera } from "../states";
import { hideOrUnhideInfo, setInnerHTML } from "../helpers/html";
import { readPage } from "../helpers/reader";
import { LazyLoader } from "../types/misc";
import { CONTENTS } from "../constants";
import { wait } from "../helpers/control";
import { SVG_LOADER } from "../loaders";
import { clamp, createSVGCenteredGroup, createSVGGroupWithCenter, randomBetween } from "../helpers/math";
import { SVGResult } from "three/examples/jsm/loaders/SVGLoader.js";

const div = document.getElementById("info")!;
const audio = new Audio('/assets/sounds/ding.mp3');
const PAGES = new Map<string, LazyLoader<string>>();
fetch(`/api/config`).then(async res => {
	if (!res.ok) return;
	const files = <string[]>(await res.json()).info;
	for (const file of files)
		PAGES.set(file.split(".").slice(0, -1).join("."), new LazyLoader(() => readPage(`/contents/info-center/${file}`)));
});

const topLength = 120, bottomLength = 108, topDepth = 25;
const deskHeight = 30;
const integrelleScale = 0.3;

enum AnimationState {
	IDLE = 0,
	ARMS = 1,
	SWAP_HANDS = 2,
	INTEGRELLE = 3
}

export default class InfoCenterFloor extends Floor {
	dinged = false;
	svgLoaded = false;
	handsData?: SVGResult;
	armsData?: SVGResult;
	integrelleData?: SVGResult;
	integrelleCloseData?: SVGResult;
	animationState = AnimationState.IDLE;
	animationPos?: THREE.Vector3;
	animationStart?: number;

	constructor() {
		super("info-center", 1);
		this.listenClick = true;
		this.listenMove = true;
		this.listenUpdate = true;
	}

	spawn(scene: THREE.Scene) {
		const trapezium = new THREE.Shape([new THREE.Vector2(-topLength / 2, deskHeight / 2), new THREE.Vector2(topLength / 2, deskHeight / 2), new THREE.Vector2(bottomLength / 2, -deskHeight / 2), new THREE.Vector2(-bottomLength / 2, -deskHeight / 2)]);
		const geometryDeskBottom = new THREE.ExtrudeGeometry(trapezium, { bevelEnabled: false, depth: topDepth });
		const materialDeskBottom = new THREE.MeshStandardMaterial({ color: 0x7db4cb });
		const deskBottom = new THREE.Mesh(geometryDeskBottom, materialDeskBottom);
		deskBottom.position.set(0, this.num * 1000 - 30, -125);
		scene.add(deskBottom);

		const geometryDeskTop = new THREE.BoxGeometry(topLength, 2, topDepth + 1);
		const materialDeskTop = new THREE.MeshStandardMaterial({ color: 0xefefef });
		const deskTop = new THREE.Mesh(geometryDeskTop, materialDeskTop);
		deskTop.position.set(0, this.num * 1000 - 30 + deskHeight / 2, -125 + topDepth / 2);
		scene.add(deskTop);

		const geometryDeskTopRight = new THREE.BoxGeometry(topDepth, 2, topDepth);
		const materialDeskTopRight = new THREE.MeshStandardMaterial({ color: 0xefefef });
		const deskTopRight = new THREE.Mesh(geometryDeskTopRight, materialDeskTopRight);
		deskTopRight.position.set((topLength - topDepth) / 2, this.num * 1000 - 30 + deskHeight / 2, -125 - topDepth / 2);
		scene.add(deskTopRight);

		const geometryDeskBottomRight = new THREE.BoxGeometry(topDepth, deskHeight, topDepth);
		const materialDeskBottomRight = new THREE.MeshStandardMaterial({ color: 0x7db4cb });
		const deskBottomRight = new THREE.Mesh(geometryDeskBottomRight, materialDeskBottomRight);
		deskBottomRight.position.set((topLength - topDepth) / 2, this.num * 1000 - 31, -125 - topDepth / 2);
		scene.add(deskBottomRight);

		const geometryPillar = new THREE.BoxGeometry(topDepth * 1.2, 300, topDepth * 1.2);
		const materialPillar = new THREE.MeshStandardMaterial({ color: 0xcfcfcf });
		const pillarL = new THREE.Mesh(geometryPillar, materialPillar);
		const pillarR = new THREE.Mesh(geometryPillar, materialPillar);
		pillarR.position.set((topLength - topDepth) / 2, this.num * 1000, -125 - topDepth * 1.6);
		pillarL.position.set(-(topLength - topDepth) / 2, this.num * 1000, -125 - topDepth * 1.6);
		scene.add(pillarL, pillarR);

		const geometryF = new THREE.BoxGeometry(400, 2, 160);
		const materialF = new THREE.MeshStandardMaterial({ color: 0xefefef });
		const floor = new THREE.Mesh(geometryF, materialF);
		floor.position.set(0, this.num * 1000 - 40.5, -50 - 80);
		scene.add(floor);

		const geometryRailing = new THREE.CylinderGeometry(3, 3, 400, 12);
		const materialRailing = new THREE.MeshStandardMaterial({ color: 0x7f7f7f });
		const railing = new THREE.Mesh(geometryRailing, materialRailing);
		railing.position.set(0, this.num * 1000, -125 - topDepth * 1.6);
		railing.rotateZ(Math.PI / 2);
		scene.add(railing);

		const geometryGlass = new THREE.BoxGeometry(400, 40, 1);
		const materialGlass = new THREE.MeshStandardMaterial({ color: 0x527585, opacity: 0.5 });
		const glass = new THREE.Mesh(geometryGlass, materialGlass);
		glass.position.set(0, this.num * 1000 - 20, -125 - topDepth * 1.6);
		scene.add(glass);

		const bell = new THREE.Group();
		const geometryB = new THREE.CylinderGeometry(4, 4, 1, 12);
		const materialB = new THREE.MeshStandardMaterial({ color: 0x3f3f3f });
		const bellBase = new THREE.Mesh(geometryB, materialB);
		bellBase.position.set(0, this.num * 1000 - 30 + deskHeight / 2 + 1, -125 + topDepth / 2);
		bell.add(bellBase);

		const geometryDome = new THREE.SphereGeometry(3.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
		const materialDome = new THREE.MeshStandardMaterial({ color: 0x9f9f9f });
		const dome = new THREE.Mesh(geometryDome, materialDome);
		dome.position.set(0, this.num * 1000 - 30 + deskHeight / 2 + 2, -125 + topDepth / 2);
		bell.add(dome);

		const geometryTop = new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
		const materialTop = new THREE.MeshStandardMaterial({ color: 0xffffff });
		const bellTop = new THREE.Mesh(geometryTop, materialTop);
		bellTop.position.set(0, this.num * 1000 - 30 + deskHeight / 2 + 2 + 3.5, -125 + topDepth / 2);
		bell.add(bellTop);

		bell.translateX(25);
		scene.add(bell);

		const meshes: Generated = { floor, deskBottom, deskTop, deskTopRight, deskBottomRight, pillarL, pillarR, railing, glass, bell };

		if (!this.svgLoaded) {
			this.svgLoaded = true;
			SVG_LOADER.load(`/assets/images/integrelle/hands.svg`, data => {
				this.handsData = data;
				const group = this.setupHands();
				this.meshes!.hands = group;
				scene.add(group);
			});
			SVG_LOADER.load(`/assets/images/integrelle/arms.svg`, data => {
				this.armsData = data;
				const group = this.setupArms();
				this.meshes!.arms = group;
				scene.add(group);
			});
			SVG_LOADER.load(`/assets/images/integrelle/integrelle.svg`, data => {
				this.integrelleData = data;
				const { nextCenter, group } = this.setupIntegrelle();
				this.meshes!.integrelle = group;
				scene.add(group);

				// loading inside to use last group center
				SVG_LOADER.load(`/assets/images/integrelle/integrelle-close.svg`, data => {
					this.integrelleCloseData = data;
					const closeGroup = this.setupIntegrelleClose(nextCenter);
					this.meshes!.integrelleClose = closeGroup;
					scene.add(closeGroup);
				});
			});
		} else {
			const hands = this.setupHands();
			const arms = this.setupArms();
			const { nextCenter, group: integrelle } = this.setupIntegrelle();
			const integrelleClose = this.setupIntegrelleClose(nextCenter);
			scene.add(hands, integrelle, integrelleClose, arms);
			meshes.hands = hands;
			meshes.arms = arms;
			meshes.integrelle = integrelle;
			meshes.integrelleClose = integrelleClose;
		}

		return meshes;
	}

	private setupHands() {
		const group = createSVGCenteredGroup(this.handsData!, true);
		group.rotateZ(Math.PI);
		group.rotateX(Math.PI / 4);
		group.position.set(0, this.num * 1000 - 29 + deskHeight / 2 + 1.15, -124);
		group.scale.set(integrelleScale, integrelleScale, integrelleScale);
		group.visible = false;
		return group;
	}

	private setupArms() {
		const group = createSVGCenteredGroup(this.armsData!);
		group.rotateX(Math.PI);
		group.position.set(0, this.num * 1000 - 55 + deskHeight / 2 + 1, -126);
		group.scale.set(integrelleScale, integrelleScale, integrelleScale);
		return group;
	}

	private setupIntegrelle() {
		const group = createSVGCenteredGroup(this.integrelleData!);
		const nextCenter = group.position.clone();
		group.rotateX(Math.PI);
		group.position.set(0, this.num * 1000 - 55 + deskHeight / 2 + 1, -127);
		group.scale.set(integrelleScale, integrelleScale, integrelleScale);
		return { nextCenter, group };
	}

	private setupIntegrelleClose(nextCenter: THREE.Vector3) {
		const group = createSVGGroupWithCenter(this.integrelleCloseData!, nextCenter);
		group.rotateX(Math.PI);
		group.position.set(0, this.num * 1000 - 20 + deskHeight / 2 + 1, -127);
		group.scale.set(integrelleScale, integrelleScale, integrelleScale);
		group.visible = false;
		return group;
	}

	despawn(scene: THREE.Scene): void {
		super.despawn(scene);
		this.dinged = false;
	}

	handleWheel(scroll: number) {
		const cam = camera();
		if (cam.position.y != this.num * 1000) cam.position.y = this.num * 1000;
		const maxDist = 65;
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

		return maxed;
	}

	async blinker() {
		while (this.dinged) {
			await wait(randomBetween(8000, 12000));
			if (!this.dinged) return;
			this.meshes!.integrelle.visible = false;
			this.meshes!.integrelleClose.visible = true;
			await wait(200);
			this.meshes!.integrelleClose.visible = false;
			this.meshes!.integrelle.visible = true;
		}
	}

	private async loadConversation(next: string) {
		setInnerHTML(div, await (PAGES.has(next) ? PAGES.get(next) : CONTENTS.get(this.num))!.get());
		for (const li of div.querySelectorAll<HTMLLIElement>("li")) {
			if (li.hasAttribute("next"))
				li.onclick = () => this.loadConversation(li.getAttribute("next")!);
		}
	}

	private async ding() {
		audio.play();
		if (!this.dinged) {
			this.dinged = true;
			await wait(500);
			this.animationState = AnimationState.ARMS;
			await wait(1000);
			this.meshes!.arms.position.setY(this.animationPos!.y + 25);
			this.animationState = AnimationState.SWAP_HANDS;
			this.meshes!.arms.visible = false;
			this.meshes!.hands.visible = true;
			await wait(500);
			this.animationState = AnimationState.INTEGRELLE;
			await wait(1000);
			this.meshes!.integrelle.position.setY(this.animationPos!.y + 35);
			this.blinker();
			this.animationState = AnimationState.IDLE;
			await wait(500);
		}

		hideOrUnhideInfo(async hidden => {
			if (hidden) setInnerHTML(div, "");
			else this.loadConversation("");
		});
	}

	clickRaycast(raycaster: THREE.Raycaster) {
		if (this.meshes)
			if (raycaster.intersectObject(this.meshes.bell).length > 0) this.ding();
	}

	moveCheck() {
		if (this.meshes) return [this.meshes.bell];
		return super.moveCheck();
	}

	private interpolate(x: number) {
		x = clamp(x, 0, 1);
		return -2 * Math.pow(x, 3) + 3 * Math.pow(x, 2);
	}

	update() {
		const animationLength = 1000;
		switch (this.animationState) {
			case AnimationState.ARMS: {
				if (!this.meshes?.arms) break;
				if (!this.animationPos) this.animationPos = this.meshes!.arms.position.clone();
				if (!this.animationStart) this.animationStart = Date.now();
				const y = this.interpolate((Date.now() - this.animationStart) / animationLength);
				this.meshes.arms.position.setY(this.animationPos.y + 25 * y);
				break;
			}
			case AnimationState.INTEGRELLE: {
				if (!this.meshes?.integrelle) break;
				if (!this.animationPos) this.animationPos = this.meshes!.integrelle.position.clone();
				if (!this.animationStart) this.animationStart = Date.now();
				const y = this.interpolate((Date.now() - this.animationStart) / animationLength);
				this.meshes.integrelle.position.setY(this.animationPos.y + 35 * y);
				break;
			}
			default:
				if (this.animationPos) this.animationPos = undefined;
				if (this.animationStart) this.animationStart = undefined;
		}
	}
}

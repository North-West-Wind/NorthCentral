import * as THREE from "three";
import Floor from "../types/floor";
import { camera } from "../states";
import { GLTF_LOADED } from "../loaders";

export default class NotFoundFloor extends Floor {
	constructor() {
		super("not-found", 404); // 404 is completely for aesthetics lol
	}

	spawn(scene: THREE.Scene) {
		const campfire = GLTF_LOADED.campfire;
		campfire.position.set(0, -50 + 1000 * this.num, -200);
		campfire.scale.set(3, 3, 3);
		scene.add(campfire);
	
		const stick = GLTF_LOADED.stick;
		stick.position.set(40, -50 + 1000 * this.num, -150);
		stick.setRotationFromAxisAngle(new THREE.Vector3(1, 0, -1), -Math.PI / 6);
		stick.scale.set(1.5, 1.5, 1.5);
		scene.add(stick);
	
		const marshmallow = GLTF_LOADED.marshmallow;
		marshmallow.position.set(11.25, -7.25 + 1000 * this.num, -178);
		marshmallow.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 1), Math.PI / 4);
		marshmallow.scale.set(10, 10, 10);
		scene.add(marshmallow);
	
		const pointLight = new THREE.PointLight(0xffda82, 1.5, 300, 2);
		pointLight.position.set(0, -40 + 1000 * this.num, -200)
		pointLight.castShadow = true;
		scene.add(pointLight);
		const geometry = new THREE.BoxGeometry(75, 5, 2);
		const material = new THREE.MeshBasicMaterial({ color: 0 });
	
		const x = document.createElement("canvas");
		const xc = x.getContext("2d")!;
		x.width = 750;
		x.height = 50;
		xc.fillStyle = "white";
		xc.font = "36px 'Courier New'";
		xc.textAlign = "center";
		xc.textBaseline = "middle";
		xc.fillText("404 - Your page was not found", x.width / 2, x.height / 2);
		const xm = new THREE.MeshBasicMaterial({ map: new THREE.Texture(x), transparent: true });
		xm.map!.needsUpdate = true;
	
		const y = document.createElement("canvas");
		const yc = y.getContext("2d")!;
		y.width = 750;
		y.height = 50;
		yc.fillStyle = "white";
		yc.font = "36px 'Courier New'";
		yc.textAlign = "center";
		yc.textBaseline = "middle";
		yc.fillText("Here, have a marshmallow", y.width / 2, y.height / 2);
		const ym = new THREE.MeshBasicMaterial({ map: new THREE.Texture(y), transparent: true });
		ym.map!.needsUpdate = true;
	
		const notice0 = new THREE.Mesh(geometry, [material, material, material, material, xm, material]);
		const notice1 = new THREE.Mesh(geometry, [material, material, material, material, ym, material]);
		notice0.position.z = notice1.position.z = -100;
		notice0.position.y = 20 + 1000 * this.num;
		notice1.position.y = 15 + 1000 * this.num;
		scene.add(notice0, notice1);
		return { notice0, notice1 };
	}

	handleWheel(scroll: number) {
		const cam = camera();
		if (cam.position.y != 1000 * this.num) cam.position.y = 1000 * this.num;
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
}
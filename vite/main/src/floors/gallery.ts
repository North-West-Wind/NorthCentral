import * as THREE from "three";
import Floor from "../types/floor";
import { getCamera } from "../states";
import { LOADER } from "../loaders";

const PAINTINGS = 16;
const FLOOR_LENGTH = Math.ceil((PAINTINGS - 1) * 0.5) * 60;

export default class GalleryFloor extends Floor {
	constructor() {
		super("gallery", 6);
		this.listenClick = true;
	}

	generate(scene: THREE.Scene) {
		const objects: any = {};

		const geometryR = new THREE.BoxGeometry(50, 2, FLOOR_LENGTH - 40);
		const materialR = new THREE.MeshStandardMaterial({ color: 0xad0000 });
		const rug = new THREE.Mesh(geometryR, materialR);
		rug.position.set(0, this.num * 1000 - 32, -(FLOOR_LENGTH - 40) * 0.5 - 50);
		scene.add(rug);
		objects.rug = rug;

		const geometryF = new THREE.BoxGeometry(80, 2, FLOOR_LENGTH);
		const materialF = new THREE.MeshStandardMaterial({ color: 0xfef0bc });
		const floor = new THREE.Mesh(geometryF, materialF);
		floor.position.set(0, this.num * 1000 - 33, -FLOOR_LENGTH * 0.5 - 50);
		scene.add(floor);
		objects.floor = floor;

		for (let ii = 1; ii < Math.floor(FLOOR_LENGTH / 60); ii++) {
			const pointLight = new THREE.PointLight(0xffffff, 1.25, 110, 2);
			pointLight.position.set(0, this.num * 1000 + 30, -60 * ii - 65);
			pointLight.castShadow = true;
			scene.add(pointLight);
			objects["light"+ii] = pointLight;
		}

		const geometryS = new THREE.BoxGeometry(3, 80, FLOOR_LENGTH);
		const wallL = new THREE.Mesh(geometryS, materialF);
		const wallR = new THREE.Mesh(geometryS, materialF);
		wallL.position.set(-40, this.num * 1000 - 5, -FLOOR_LENGTH * 0.5 - 50);
		wallR.position.set(40, this.num * 1000 - 5, -FLOOR_LENGTH * 0.5 - 50);
		scene.add(wallL, wallR);
		objects.wallL = wallL;
		objects.wallR = wallR;

		const geometryC = new THREE.BoxGeometry(80, 2, FLOOR_LENGTH);
		const ceiling = new THREE.Mesh(geometryC, materialF);
		ceiling.position.set(0, this.num * 1000 + 36, -FLOOR_LENGTH * 0.5 - 50);
		scene.add(ceiling);
		objects.ceiling = ceiling;

		const geometryB = new THREE.BoxGeometry(80, 80, 2);
		const back = new THREE.Mesh(geometryB, materialF);
		back.position.set(0, this.num * 1000 - 5, -FLOOR_LENGTH - 50);
		scene.add(back);
		objects.back = back;

		for (let ii = 0; ii < PAINTINGS - 1; ii++) {
			const geometry = new THREE.BoxGeometry(2, 50, 50);
			const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
			const painting = new THREE.Mesh(geometry, material);
			if (ii % 2) {
				// Put to right
			} else {
				// Put to left
				painting
			}
			scene.add(painting);
			objects["painting"+ii] = painting;
		}

		return objects;
	}

	handleWheel(scroll: number) {
		const camera = getCamera();
		const maxDist = FLOOR_LENGTH + 10;
		if (camera.position.z >= -maxDist) camera.translateZ(-scroll);
		if (camera.position.z < -maxDist) camera.position.setZ(-maxDist);
		if (camera.position.z > 0) camera.position.setZ(0);
		camera.position.setX(0);
		camera.position.setY(this.num * 1000);
	}
}
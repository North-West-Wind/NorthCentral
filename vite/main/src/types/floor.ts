import * as THREE from "three";

type Generated = { [key: string]: THREE.Mesh | THREE.Mesh[] }

export default abstract class Floor {
	id: string;
	num: number;
	phase = 0;
	listenClick = false;
	listenMove = false;
	listenUpdate = false;

	constructor(id: string, num: number) {
		this.id = id;
		this.num = num;
	}

	abstract generate(scene: THREE.Scene): Generated | Promise<Generated>;

	abstract handleWheel(scroll: number): void;

	clickRaycast(_raycaster: THREE.Raycaster): void { }

	moveCheck(): THREE.Mesh[] { return []; }

	update(_scene: THREE.Scene): void { }
}
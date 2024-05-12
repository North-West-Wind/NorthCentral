import * as THREE from "three";

export type Generated = { [key: string]: THREE.Mesh | THREE.Mesh[] }

export default abstract class Floor {
	id: string;
	num: number;
	phase = 0;
	listenClick = false;
	listenMove = false;
	listenUpdate = false;
	special = false;
	private meshes?: Generated;

	constructor(id: string, num: number) {
		this.id = id;
		this.num = num;
	}

	abstract spawn(scene: THREE.Scene): Generated | Promise<Generated>;

	async spawnWrapper(scene: THREE.Scene) {
		return this.meshes = await this.spawn(scene);
	}
	
	despawn(scene: THREE.Scene) {
		if (!this.meshes) return;
		for (const ob of Object.values(this.meshes)) {
			if (Array.isArray(ob)) scene.remove(...ob);
			else if (ob) scene.remove(ob as THREE.Mesh);
		}
	}

	abstract handleWheel(scroll: number): boolean;

	clickRaycast(_raycaster: THREE.Raycaster): void { }

	moveCheck(): THREE.Mesh[] { return []; }

	update(_scene: THREE.Scene): void { }
}
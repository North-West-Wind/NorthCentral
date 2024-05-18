import * as THREE from "three";
import { LazyLoader } from "./misc";
import { readPage } from "../helpers/reader";

export type Generated = { [key: string]: THREE.Object3D }

export default abstract class Floor {
	id: string;
	num: number;
	content: LazyLoader<string>;
	phase = 0;
	listenClick = false;
	listenMove = false;
	listenUpdate = false;
	special = false;
	protected meshes?: Generated;

	constructor(id: string, num: number, loaders?: { content?: LazyLoader<string> }) {
		this.id = id;
		this.num = num;
		this.content = loaders?.content || new LazyLoader(() => readPage(`/contents/${num}-${id}.html`));
	}

	abstract spawn(scene: THREE.Scene): Generated | Promise<Generated>;

	async spawnWrapper(scene: THREE.Scene) {
		return this.meshes = await this.spawn(scene);
	}
	
	despawn(scene: THREE.Scene) {
		if (!this.meshes) return;
		for (const [key, ob] of Object.entries(this.meshes))
			if (ob)
				scene.remove(ob);
		this.meshes = undefined;
	}

	abstract handleWheel(scroll: number): boolean;

	clickRaycast(_raycaster: THREE.Raycaster): void { }

	moveCheck(): THREE.Object3D[] { return []; }

	update(_scene: THREE.Scene): void { }

	loadContent(_info: HTMLDivElement) { }
	unloadContent(_info: HTMLDivElement) { }
}
import { TextureLoader } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const MODELS = [
	"armor_stand",
	"desk",
	"piano"
];

export const LOADER = new TextureLoader();
const GLTF_LOADER = new GLTFLoader();

export const GLTF_LOADED: any = {};
function loadGltf(path: string) {
	GLTF_LOADER.load(`/assets/models/${path}/scene.gltf`, (gltf: any) => { GLTF_LOADED[path] = gltf.scene; });
}
for (const model of MODELS) {
	loadGltf(model);
}

export async function holdModelLoads() {
	return new Promise<void>(async resolve => {
		while (Object.keys(GLTF_LOADED).length != MODELS.length) {
			await new Promise(res => setTimeout(res, 50));
		}
		resolve();
	});
}
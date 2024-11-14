import { Group, TextureLoader } from "three";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

const MODELS = [
	"armor_stand",
	"desk",
	"piano",
	"campfire",
	"stick",
	"marshmallow"
];

export const TEXTURE_LOADER = new TextureLoader();
export const SVG_LOADER = new SVGLoader();
const GLTF_LOADER = new GLTFLoader();

export const GLTF_LOADED: { [key: string]: Group } = {};
function loadGltf(path: string) {
	GLTF_LOADER.load(`/assets/models/${path}/scene.gltf`, (gltf: GLTF) => { GLTF_LOADED[path] = gltf.scene; });
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
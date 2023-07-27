import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const MODELS = [
	"campfire",
	"stick",
	"marshmallow"
];

const GLTF_LOADER = new GLTFLoader();

export const GLTF_LOADED: any = {};
function loadGltf(path: string) {
	GLTF_LOADER.load(`/assets/models/${path}/scene.gltf`, (gltf: any) => { GLTF_LOADED[path] = gltf.scene; });
}
for (const model of MODELS) {
	loadGltf(model);
}
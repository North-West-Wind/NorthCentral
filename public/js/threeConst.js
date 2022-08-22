const MODELS = [
	"armor_stand",
	"desk",
	"piano",
	"campfire",
	"stick",
	"marshmallow"
];

const LOADER = new THREE.TextureLoader();
const GLTF_LOADER = new THREE.GLTFLoader();

const GLTF_LOADED = {};
/**
* @param {string} path 
*/
function loadGltf(path) {
	GLTF_LOADER.load(`/assets/models/${path}/scene.gltf`, (gltf) => { GLTF_LOADED[path] = gltf.scene; });
}
for (const model of MODELS) {
	loadGltf(model);
}
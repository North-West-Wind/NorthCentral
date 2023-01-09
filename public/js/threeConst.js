const PARTICLE_DISTANCE = 200;
const SHRINK_PARTICLE_DISTANCE = 20;

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

async function holdModelLoads() {
	return new Promise(async resolve => {
		while (Object.keys(GLTF_LOADED).length != MODELS.length) {
			await new Promise(res => setTimeout(res, 50));
		}
		resolve();
	});
}
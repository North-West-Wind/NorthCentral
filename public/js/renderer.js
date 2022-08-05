const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector(`#bg`)
});
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
var midX, midY;

const pointLight = new THREE.PointLight(0xfff8be, 1.5, 300, 2);
pointLight.position.y = camera.position.y = passedInFloor > 0 ? 1000 * passedInFloor : 0;
pointLight.castShadow = true;
scene.add(pointLight);
const obj = makeLift(scene);
const { doorL, doorR, buttonU, buttonD, sign, display } = obj;
var outside, ocean, paper0, paper1, paper2, sheets;
var spawned = false;
async function spawnOutside() {
    spawned = true;
    outside = await floorGenerators[currentFloor](scene);
    ocean = outside.ocean;
    paper0 = outside.paper0;
    paper1 = outside.paper1;
    paper2 = outside.paper2;
    sheets = outside.sheets;
}
function despawnOutside() {
    spawned = false;
    for (const ob of Object.values(outside)) {
        if (Array.isArray(ob)) scene.remove(...ob);
        else scene.remove(ob);
    }
    ocean = paper0 = paper1 = paper2 = sheets = undefined;
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.render(scene, camera);
    midX = window.innerWidth / 2;
    midY = window.innerHeight / 2;
    ratio = window.innerWidth / window.innerHeight;
    if (ratio < 1) {
        enableStylesheet(document.getElementById("vertical"));
        disableStylesheet(document.getElementById("horizontal"));
    } else {
        enableStylesheet(document.getElementById("horizontal"));
        disableStylesheet(document.getElementById("vertical"));
    }
}

function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}

resize();
animate();
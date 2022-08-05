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
pointLight.position.y = camera.position.y = 0;
pointLight.castShadow = true;
scene.add(pointLight);
const obj = makeLift(scene);
const { doorL, doorR, buttonU, buttonD, sign, display } = obj;
var spawned = false;
function spawnOutside() {
    spawned = true;
    makeCampfire(scene);
    makeNotice(scene);
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
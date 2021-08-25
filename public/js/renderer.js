const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector(`#bg`)
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
var midX, midY;

const pointLight = new THREE.PointLight(0xffffff, 1.75, 300, 2);
pointLight.position.set(0, 0, 0);
pointLight.castShadow = true;
scene.add(pointLight);
const { doorL, doorR, buttonU, buttonD, sign, display } = makeLift(scene);
const {} = makeOutside(scene);

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.render(scene, camera);
    midX = window.innerWidth / 2;
    midY = window.innerHeight / 2;
}

function animate() {
    requestAnimationFrame(animate);
    update();

    renderer.render(scene, camera);
}
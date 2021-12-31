const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector(`#bg`)
});
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
var midX, midY;
const pointLight = new THREE.PointLight(0xffffff, 1.5, 50, 2);
pointLight.castShadow = true;
pointLight.position.set(0, 10, -1.5);
scene.add(pointLight);
makeCake(scene);
makeSign(scene);

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

    renderer.render(scene, camera);
}

resize();
animate();
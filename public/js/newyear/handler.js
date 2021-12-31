window.addEventListener("resize", (e) => {
    resize();
}, true);

var rotatedX = 0;
var rotatedY = 0;
var touched = false, moved = false;
const offsets = { x: 0, y: 0 };
const touchPos = { x: 0, y: 0 };
window.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    touchPos.x = touch.clientX;
    touchPos.y = touch.clientY;
    touched = true;
});

function moveEventsCommon(e, mul) {
    const offsetX = -((e.clientY - midY) / midY) / 2 * mul;
    const offsetY = -((e.clientX - midX) / midX) / 2 * mul;
    offsets.x = offsetX;
    offsets.y = offsetY;
}
window.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    moveEventsCommon(touch, 5);
    const newY = touch.clientY;
    const wheelEvent = new WheelEvent("wheel", { deltaY: (touchPos.y - newY) || 0 });
    window.dispatchEvent(wheelEvent);
    touchPos.x = touch.clientX;
    touchPos.y = newY;
});
window.addEventListener("mousemove", (e) => {
    moveEventsCommon(e, 1);
    const mouse3D = new THREE.Vector3((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1, 0.5);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse3D, camera);
});

function update() {
    camera.setRotationFromAxisAngle(new THREE.Vector3(offsets.x + rotatedY, offsets.y + rotatedX, 0), Math.PI / 9);
}

var ticking = false;
setInterval(() => {
    if (!ticking) {
        ticking = true;
        update();
        ticking = false;
    }
}, 10);

setTimeout(() => {
    const point = new THREE.PointLight(0xfff8be, 1.5, 1000, 2);
    point.position.set(0, 10, -1.5)
    scene.add(point);

    const geoFire1 = new THREE.BoxGeometry(0.05, 0.15, 0.05);
    const geoFire2 = new THREE.BoxGeometry(0.05, 0.05, 0.05);
    const material = new THREE.MeshBasicMaterial({ color: 0xf59042 });
    const fire1 = new THREE.Mesh(geoFire1, material);
    const fire2 = new THREE.Mesh(geoFire2, material);
    fire1.position.set(0, 0.125, -3);
    fire2.position.set(0.025, 0.2, -3);
    scene.add(fire1, fire2);
}, 10000);
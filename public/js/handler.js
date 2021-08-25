window.addEventListener("resize", (e) => {
    resize();
}, true);

window.addEventListener("mousemove", (e) => {
    const offsetX = -((e.clientY - midY) / midY) / 2;
    const offsetY = -((e.clientX - midX) / midX) / 2;
    camera.setRotationFromAxisAngle(new THREE.Vector3(offsetX, offsetY, 0), Math.PI / 9);

    const mouse3D = new THREE.Vector3((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1, 0.5);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse3D, camera);
    const intersect = raycaster.intersectObjects([buttonU, buttonD, display, sign]);
    if (intersect.length > 0) document.body.style.cursor = "pointer";
    else document.body.style.cursor = "default";
});

window.addEventListener("mousedown", (e) => {
    const mouse3D = new THREE.Vector3((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1, 0.5);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse3D, camera);
    const oldGotoFloor = gotoFloor;
    var button;
    if (raycaster.intersectObject(buttonU).length > 0) { button = buttonU; if (currentFloor != -1) gotoFloor++; }
    else if (raycaster.intersectObject(buttonD).length > 0) { button = buttonD; if (currentFloor != -1 && gotoFloor > 0) gotoFloor--; }
    else if (raycaster.intersectObject(display).length > 0 && currentFloor != gotoFloor && currentFloor != -1) displayPressed = true;
    else if (raycaster.intersectObject(sign).length > 0) {
        const div = document.getElementById("info");
        const style = getComputedStyle(div);
        if (style.display == "none" || div.style.display == "none") {
            div.style.width = div.style.height = "100%";
            div.style.display = "block";
        } else if (style.display == "block" || div.style.display == "block") {
            div.style.width = div.style.height = 0;
            div.style.display = "none";
        }
    }
    if (button) {
        button.material.color.setHex(0xf7eb93);
        button.position.z = -48.5;
    }
    if (oldGotoFloor != gotoFloor) {
        const xm = new THREE.MeshStandardMaterial({ map: displayTexture(gotoFloor), transparent: true });
        xm.map.needsUpdate = true;
        display.material.splice(4, 1, xm);
    }
    if (!started) {
        time = Date.now();
        starting = true;
        started = true;
    }
});

window.addEventListener("mouseup", (e) => {
    if (buttonU.material.color.getHex() != 0xbbbbbb) { buttonU.material.color.setHex(0xbbbbbb); buttonU.position.z = -48.25 }
    if (buttonD.material.color.getHex() != 0xbbbbbb) { buttonD.material.color.setHex(0xbbbbbb); buttonD.position.z = -48.25 }
});

var displayPressed = false, opened = false, moving = false, started = false, starting = false;
var currentFloor = 0, gotoFloor = 0, time = 0;
var allRains = [];
function update() {
    if (displayPressed) {
        moving = true;
        displayPressed = false;
        currentFloor = -1;
    }
    if (starting && Date.now() - time >= 3000) {
        time = 0;
        starting = false;
        moving = true;
        const audio = new Audio('/assets/lift.mp3');
        audio.play();
    }
    if (moving) {
        if (opened && doorR.position.x <= 12.5) {
            doorL.position.x = -12.5;
            doorR.position.x = 12.5;
            moving = false;
            opened = false;
        } else if (opened) {
            doorL.translateX(0.2);
            doorR.translateX(-0.2);
        } else if (doorR.position.x >= 37.5) {
            doorL.position.x = -37.5;
            doorR.position.x = 37.5;
            moving = false;
            opened = true;
        } else {
            doorL.translateX(-0.2);
            doorR.translateX(0.2);
        }
    }
    const newRains = [];
    for (let i = 0; i < allRains.length; i++) {
        const r = allRains[i];
        r.translateY(-Math.random() - 3);
        if (r.position.y <= -50) scene.remove(r);
        else newRains.push(r);
    }
    if (currentFloor == 0 && (opened || moving)) newRains.push(...createRain(scene, 10));
    allRains = newRains;
}

resize();
animate();
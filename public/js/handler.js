window.addEventListener("resize", (e) => {
    resize();
}, true);

var rotatedX = 0;
const offsets = { x: 0, y: 0 }
window.addEventListener("mousemove", (e) => {
    const offsetX = -((e.clientY - midY) / midY) / 2;
    const offsetY = -((e.clientX - midX) / midX) / 2;
    offsets.x = offsetX;
    offsets.y = offsetY;

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
    var button, start = false;
    if (raycaster.intersectObject(buttonU).length > 0) { button = buttonU; if (currentFloor != -1 && gotoFloor < 7) gotoFloor++; }
    else if (raycaster.intersectObject(buttonD).length > 0) { button = buttonD; if (currentFloor != -1 && gotoFloor > 0) gotoFloor--; }
    else if (raycaster.intersectObject(display).length > 0 && currentFloor != gotoFloor && currentFloor != -1 && !moving) displayPressed = true;
    else if (raycaster.intersectObject(sign).length > 0) {
        openOrCloseInfo(0);
        start = true;
    } else start = true;
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
        started = true;
        if (start && !pendingMove) starting = true;
    }
});

window.addEventListener("mouseup", (e) => {
    if (buttonU.material.color.getHex() != 0xbbbbbb) { buttonU.material.color.setHex(0xbbbbbb); buttonU.position.z = -48.25 }
    if (buttonD.material.color.getHex() != 0xbbbbbb) { buttonD.material.color.setHex(0xbbbbbb); buttonD.position.z = -48.25 }
});

window.addEventListener("keydown", (e) => {
    if (e.key == " ") camera.translateZ(-50);//openOrCloseInfo(currentFloor);
});

window.addEventListener("wheel", handleWheel);

var displayPressed = false, opened = false, moving = false, started = false, starting = false, pendingMove = false, poppedState = false;
var currentFloor = 0, gotoFloor = 0, time = 0, diff = 0;
var allRains = [];
function update() {
    if (displayPressed) {
        poppedState = false;
        if (opened) moving = true;
        displayPressed = false;
        diff = gotoFloor - currentFloor;
        currentFloor = -1;
        var symbol;
        if (diff > 0) symbol = "▲";
        else symbol = "▼";
        const xm = new THREE.MeshStandardMaterial({ map: displayTexture(symbol), transparent: true });
        xm.map.needsUpdate = true;
        display.material.splice(4, 1, xm);
        pendingMove = true;
        started = true;
    }
    if (started && starting) {
        starting = false;
        if (!displayPressed) {
            moving = true;
            const audio = new Audio('/assets/lift.mp3');
            audio.play();
        }
    }
    if (moving) {
        if (opened && doorR.position.x <= 12.5) {
            doorL.position.x = -12.5;
            doorR.position.x = 12.5;
            moving = false;
            opened = false;
        } else if (opened) {
            doorL.translateX(0.4);
            doorR.translateX(-0.4);
        } else if (doorR.position.x >= 37.5) {
            doorL.position.x = -37.5;
            doorR.position.x = 37.5;
            moving = false;
            opened = true;
        } else {
            doorL.translateX(-0.4);
            doorR.translateX(0.4);
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
    if (pendingMove && !moving && started) {
        pendingMove = false;
        setTimeout(() => {
            if (!poppedState) history.pushState({ floor: gotoFloor }, null, "/" + (gotoFloor == 0 ? "" : PAGES[gotoFloor - 1]));
            currentFloor = gotoFloor;
            const xm = new THREE.MeshStandardMaterial({ map: displayTexture(currentFloor), transparent: true });
            xm.map.needsUpdate = true;
            display.material.splice(4, 1, xm);

            Object.values(obj).forEach(mesh => mesh.position.y += 1000 * diff);
            camera.position.y += 1000 * diff;
            pointLight.position.y += 1000 * diff;
            moving = true;
            const audio = new Audio('/assets/lift.mp3');
            audio.play();
        }, 1500 * Math.abs(diff));
    }
    camera.setRotationFromAxisAngle(new THREE.Vector3(offsets.x, offsets.y + rotatedX, 0), Math.PI / 9);
}

resize();
animate();

window.onpopstate = e => {
    gotoFloor = history.state?.floor ?? 0;
    displayPressed = true;
    poppedState = true;
};

var scrollStopped = 0, topped = false;
const div = document.getElementById("info");
div.addEventListener("scroll", (e) => {
    if (!div.scrollTop) topped = true;
    else topped = false;
});
div.addEventListener("wheel", (e) => {
    if (!div.scrollTop && e.deltaY < 0 && Date.now() - scrollStopped > 1000) openOrCloseInfo();
    else scrollStopped = Date.now();
});

function hideOrUnhideInfo(cb = () => { }) {
    if (div.classList.contains('hidden')) {
        div.classList.remove('hidden');
        setTimeout(function () {
            div.classList.remove('visuallyhidden');
        }, 20);
        cb(false);
    } else {
        div.classList.add('visuallyhidden');
        div.addEventListener('transitionend', function (e) {
            div.classList.add('hidden');
            cb(true);
        }, { capture: false, once: true, passive: false });
    }
}

function openOrCloseInfo(index = 0) {
    hideOrUnhideInfo(hidden => {
        if (hidden) div.innerHTML = "";
        else div.innerHTML = CONTENTS[index];
    });
}

function handleWheel(e) {
    const scroll = e.deltaY / 50;
    if (!div.classList.contains('hidden')) return;
    if (camera.position.y != currentFloor * 1000) camera.position.y = currentFloor * 1000;
    if (currentFloor <= 0) {
        const absoluted = Math.abs(scroll);
        if (camera.position.x != 0) {
            camera.translateX(camera.position.x > 0 ? -absoluted : absoluted);
            if (Math.abs(camera.position.x) <= absoluted) camera.position.x = 0;
        }
        if (camera.position.z != 0) {
            camera.translateZ(camera.position.z > 0 ? -absoluted : absoluted);
            if (Math.abs(camera.position.z) <= absoluted) camera.position.z = 0;
        }
    } else if (!opened) {} else if (currentFloor == 1) {
        const rotateAngle = -1 / 2;
        if (camera.position.z > 0) camera.position.z = 0;
        else if (camera.position.z < -70) camera.position.z = -70;
        else if (camera.position.z == -70 && scroll > 0) {
            if (div.classList.contains('hidden')) openOrCloseInfo(currentFloor);
        } else if (!(camera.position.z == 0 && scroll < 0)) camera.translateZ(-scroll);


        if (camera.position.x != 0) camera.position.x = 0;
        rotatedX = rotateAngle * Math.abs(camera.position.z) / 70;
    }
}
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
    if (!moved) moved = true;
});
window.addEventListener("mousemove", (e) => {
    moveEventsCommon(e, 1);
    const mouse3D = new THREE.Vector3((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1, 0.5);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse3D, camera);
    const intersect = raycaster.intersectObjects([buttonU, buttonD, display, sign, paper0, paper1, paper2]);
    if (intersect.length > 0) document.body.style.cursor = "pointer";
    else document.body.style.cursor = "default";
});

function clickEventsCommon(e) {
    const mouse3D = new THREE.Vector3((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1, 0.5);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse3D, camera);
    const oldGotoFloor = gotoFloor;
    var button, start = false;
    if (raycaster.intersectObject(buttonU).length > 0) { button = buttonU; if (currentFloor != -1 && gotoFloor < MAX_FLOOR) gotoFloor++; }
    else if (raycaster.intersectObject(buttonD).length > 0) { button = buttonD; if (currentFloor != -1 && gotoFloor > 0) gotoFloor--; }
    else if (raycaster.intersectObject(display).length > 0 && currentFloor != gotoFloor && currentFloor != -1 && !moving) displayPressed = true;
    else if (raycaster.intersectObject(sign).length > 0) {
        openOrCloseInfo(0);
        start = true;
    } else if (currentFloor == 4 && phase) {
        if (raycaster.intersectObject(paper1).length > 0) openOrCloseNWWInfo(0);
        else if (raycaster.intersectObject(paper0).length > 0) openOrCloseNWWInfo(1);
        else if (raycaster.intersectObject(paper2).length > 0) openOrCloseNWWInfo(2);
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
}
window.addEventListener("touchend", (e) => {
    if (touched && !moved) clickEventsCommon({ clientX: touchPos.x, clientY: touchPos.y });
    if (currentFloor == 4 && bottomed && !phase) {
        openOrCloseInfo();
        phase = 1;
    }
    touched = false;
    moved = false;
});
window.addEventListener("mousedown", clickEventsCommon);

window.addEventListener("mouseup", (e) => {
    if (buttonU.material.color.getHex() != 0xbbbbbb) { buttonU.material.color.setHex(0xbbbbbb); buttonU.position.z = -48.25 }
    if (buttonD.material.color.getHex() != 0xbbbbbb) { buttonD.material.color.setHex(0xbbbbbb); buttonD.position.z = -48.25 }
});

window.addEventListener("wheel", e => {
    if (div.classList.contains("hidden")) scrollDisplacement += e.deltaY;
});

window.addEventListener("keydown", e => {
    if (e.key == "Escape" && !div.classList.contains("hidden")) openOrCloseInfo();
    else if (e.key == " " && currentFloor == 4 && bottomed && !phase) {
        openOrCloseInfo();
        phase = 1;
    }
});

var displayPressed = false, opened = false, moving = false, started = false, starting = false, pendingMove = false, poppedState = false;
var currentFloor = 0, gotoFloor = 0, actualFloor = 0, time = 0, diff = 0, scrollDisplacement = 0, lastDisplacement = 0, scrollVelocity = 0;
var allRains = [];
var allParticles = [];
function update() {
    if (displayPressed) {
        poppedState = false;
        if (opened) moving = true;
        displayPressed = false;
        diff = gotoFloor - currentFloor;
        actualFloor = currentFloor;
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
    if (opened || moving) {
        switch (actualFloor) {
            case 0:
                const newRains = [];
                for (let i = 0; i < allRains.length; i++) {
                    const r = allRains[i];
                    r.translateY(-Math.random() - 3);
                    if (r.position.y <= -50) scene.remove(r);
                    else newRains.push(r);
                }
                newRains.push(...createRain(scene, 10));
                allRains = newRains;
                break;
            case 4:
                const newParticles = [];
                for (let i = 0; i < allParticles.length; i++) {
                    const p = allParticles[i];
                    const particle = p.particle;
                    const angle = p.angle;
                    p.distance -= Math.random() + 0.5;
                    particle.position.set(Math.sin(angle) * p.distance, currentFloor * 1000 + Math.cos(angle) * p.distance, -151);
                    if (p.distance < SHRINK_PARTICLE_DISTANCE) {
                        const scale = p.distance / SHRINK_PARTICLE_DISTANCE;
                        particle.scale.set(scale, scale, scale);
                    }
                    if (p.distance <= 0) scene.remove(particle);
                    else newParticles.push(p);
                }
                newParticles.push(...createParticle(scene, 1));
                allParticles = newParticles;
                break;
        }
    }
    if (pendingMove && !moving && started) {
        pendingMove = false;
        setTimeout(() => {
            if (!poppedState) history.pushState({ floor: gotoFloor }, null, "/" + (gotoFloor == 0 ? "" : PAGES[gotoFloor - 1]));
            currentFloor = gotoFloor;
            actualFloor = currentFloor;
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
    if (scrollDisplacement) {
        var tmpDisplacement = scrollDisplacement;
        scrollVelocity += (scrollDisplacement < 0 ? -1 : 1) * (Math.abs(scrollVelocity) > Math.abs(scrollDisplacement) ? -1 : 1);
        tmpDisplacement -= scrollVelocity;
        if ((scrollDisplacement > 0 && tmpDisplacement < 0) || (scrollDisplacement < 0 && tmpDisplacement > 0)) scrollVelocity = scrollDisplacement;
        scrollDisplacement -= scrollVelocity;
    } else if (scrollVelocity) {
        if (scrollVelocity < 0) {
            if (scrollVelocity > -1) scrollVelocity = 0;
            else scrollVelocity += 1;
        } else {
            if (scrollVelocity < 1) scrollVelocity = 0;
            else scrollVelocity -= 1;
        }
    }
    if (scrollVelocity) handleWheel(scrollVelocity);
    console.log("X: %s, Y: %s", offsets.x, offsets.y)
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

window.onpopstate = e => {
    gotoFloor = history.state?.floor ?? 0;
    displayPressed = true;
    poppedState = true;
};

var scrollStopped = 0, topped = false, bottomed = false, phase = 0;
const div = document.getElementById("info");
div.addEventListener("scroll", (e) => {
    topped = !div.scrollTop;
    bottomed = div.scrollTop === (div.scrollHeight - div.offsetHeight);
    scrollStopped = Date.now();
});
div.addEventListener("wheel", (e) => {
    //console.log("Top: %s, Height: %s, Offset: %s", div.scrollTop, div.scrollHeight, div.offsetHeight);
    //console.log("Topped: %s, Bottomed: %s", topped, bottomed);
    if (Date.now() - scrollStopped >= 500 && topped && e.deltaY < 0 && [1, 2, 3, 4].includes(currentFloor) && !phase) openOrCloseInfo();
    else scrollStopped = Date.now();
    //console.log("Scroll Stopped: %s", scrollStopped);
    scrollDisplacement = lastDisplacement = scrollVelocity = 0;
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
        if (hidden) {
            div.innerHTML = "";
            bottomed = topped = false;
        } else {
            topped = !div.scrollTop;
            bottomed = div.scrollTop === (div.scrollHeight - div.offsetHeight);
            div.innerHTML = CONTENTS[index];
        }
        scrollStopped = Date.now();
    });
}

function openOrCloseNWWInfo(index = 0) {
    hideOrUnhideInfo(hidden => {
        if (hidden) div.innerHTML = "";
        else div.innerHTML = N0RTHWESTW1ND_CONTENTS[index];
    });
}

function handleWheel(scroll) {
    scroll = scroll / 10;
    if (!div.classList.contains('hidden')) return;
    if (currentFloor <= 0) {
        if (camera.position.y != 0) camera.position.y = 0;
        const absoluted = Math.abs(scroll);
        if (camera.position.x != 0) {
            camera.translateX(camera.position.x > 0 ? -absoluted : absoluted);
            if (Math.abs(camera.position.x) <= absoluted) camera.position.x = 0;
        }
        if (camera.position.z != 0) {
            camera.translateZ(camera.position.z > 0 ? -absoluted : absoluted);
            if (Math.abs(camera.position.z) <= absoluted) camera.position.z = 0;
        }
    } else if (!opened) { } else if (currentFloor == 1) {
        if (camera.position.y != currentFloor * 1000) camera.position.y = currentFloor * 1000;
        const rotateAngle = -1 / 2;
        const maxDist = 70;
        if (camera.position.z == -maxDist && scroll > 0) {
            if (div.classList.contains('hidden')) openOrCloseInfo(currentFloor);
        } else if (!(camera.position.z == 0 && scroll < 0)) {
            camera.translateZ(-scroll);
            if (camera.position.z > 0) camera.position.z = 0;
            else if (camera.position.z < -maxDist) camera.position.z = -maxDist;
        }

        if (camera.position.x != 0) camera.position.x = 0;
        rotatedX = rotateAngle * Math.abs(camera.position.z) / maxDist;
    } else if (currentFloor == 2) {
        if (camera.position.y != currentFloor * 1000) camera.position.y = currentFloor * 1000;
        const rotateAngle = -1.2;
        const maxDist = 100;
        if (camera.position.z == -maxDist && scroll > 0) {
            if (div.classList.contains('hidden')) openOrCloseInfo(currentFloor);
        } else if (!(camera.position.z == 0 && scroll < 0)) {
            camera.translateZ(-scroll);
            if (camera.position.z > 0) camera.position.z = 0;
            else if (camera.position.z < -maxDist) camera.position.z = -maxDist;
        }
        if (camera.position.x != 0) camera.position.x = 0;
        rotatedY = rotateAngle * Math.abs(camera.position.z) / maxDist;
    } else if (currentFloor == 3) {
        const rotateAngle = -1;
        const maxDist0 = 100;
        const maxDist1 = 162;
        const maxDist2 = 8;
        const maxDist3 = 17.5;
        if (camera.position.z <= -maxDist0) {
            if (camera.position.z > -maxDist1 || scroll < 0) {
                camera.translateZ(-scroll);
                if (camera.position.z < -maxDist1) camera.position.z = -maxDist1;
                camera.position.x = -(Math.abs(camera.position.z) - maxDist0) * maxDist2 / (maxDist1 - maxDist0);
                camera.position.y = -(Math.abs(camera.position.z) - maxDist0) * maxDist3 / (maxDist1 - maxDist0) + currentFloor * 1000;
                rotatedX = rotateAngle * (Math.abs(camera.position.z) - maxDist0) / (maxDist1 - maxDist0);
            } else if (scroll > 0) {
                if (div.classList.contains('hidden')) openOrCloseInfo(currentFloor);
            }
        } else {
            camera.translateZ(-scroll);
            if (camera.position.z > 0) camera.position.z = 0;
            if (camera.position.x != 0) camera.position.x = 0;
            if (camera.position.y != currentFloor * 1000) camera.position.y = currentFloor * 1000;
            if (rotatedX != 0) rotatedX = 0;
        }
    } else if (currentFloor == 4) {
        const rotateAngle = -3;
        const maxDist0 = 140;
        const maxDist1 = 148;
        const maxDist2 = 3;
        if (camera.position.z <= -maxDist0) {
            if (div.classList.contains('hidden')) {
                if (scroll > 0 && !phase) openOrCloseInfo(currentFloor);
                else if (phase) {
                    camera.translateZ(-scroll);
                    if (camera.position.z < -maxDist1) camera.position.z = -maxDist1;
                    camera.position.x = (Math.abs(camera.position.z) - maxDist0) * maxDist2 / (maxDist1 - maxDist0);
                    rotatedY = rotateAngle * (Math.abs(camera.position.z) - maxDist0) / (maxDist1 - maxDist0);
                    if (camera.position.z > -maxDist0) {
                        camera.position.x = 0;
                        rotatedY = 0;
                        phase = 0;
                    }
                }
            }
        } else if (!(camera.position.z == 0 && scroll < 0)) {
            camera.translateZ(-scroll);
            if (camera.position.z > 0) camera.position.z = 0;
            else if (camera.position.z < -maxDist0) camera.position.z = -maxDist0;
            if (camera.position.z > -maxDist0) phase = 0;
            if (camera.position.x != 0) camera.position.x = 0;
        }
        if (camera.position.y != currentFloor * 1000) camera.position.y = currentFloor * 1000;
    }
}
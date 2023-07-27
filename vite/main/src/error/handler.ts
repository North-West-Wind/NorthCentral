import * as THREE from "three";
import { ERROR_CONTENTS } from "../constants";
import { setInnerHTML } from "../helper";
import { getCamera, getRatio, getSpawned } from "../states";
import { buttonD, buttonU, doorL, doorR, midX, midY, resize, sign, spawnOutside } from "./renderer";

window.addEventListener("resize", () => {
	resize();
}, true);

var rotatedX = 0;
var rotatedY = 0;
var touched = false, moved = false;
const offsets = { x: 0, y: 0 };
const touchPos = { ix: 0, iy: 0, x: 0, y: 0 };
var separation = 0;
window.addEventListener("touchstart", (e) => {
	var x, y;
	if (e.touches.length == 2) {
			separation = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
			x = (e.touches[0].clientX + e.touches[1].clientX) / 2;
			y = (e.touches[0].clientY + e.touches[1].clientY) / 2;
	} else {
			x = e.touches[0].clientX;
			y = e.touches[0].clientY;
	}
	touchPos.ix = touchPos.x = x;
	touchPos.iy = touchPos.y = y;
	touched = true;
});

window.addEventListener("touchmove", (e) => {
	var x, y, newSeparation = 0;
	if (e.touches.length == 2) {
			newSeparation = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
			x = (e.touches[0].clientX + e.touches[1].clientX) / 2;
			y = (e.touches[0].clientY + e.touches[1].clientY) / 2;
			if (newSeparation && div.classList.contains("hidden")) {
					scrollDisplacement += (newSeparation - separation) * 5;
					separation = newSeparation;
			}
	} else {
			x = e.touches[0].clientX;
			y = e.touches[0].clientY;
	}
	var shouldMove = false;
	const ratio = getRatio();
	if (ratio > 1) shouldMove = Math.abs(x - touchPos.ix) > window.innerWidth / 16 || Math.abs(y - touchPos.iy) > window.innerHeight / 12;
	else if (ratio < 1) shouldMove = Math.abs(y - touchPos.iy) > window.innerHeight / 16 || Math.abs(x - touchPos.ix) > window.innerWidth / 12;
	else shouldMove = Math.abs(x - touchPos.ix) > window.innerWidth / 12 || Math.abs(y - touchPos.iy) > window.innerHeight / 12;
	if (!moved && shouldMove) moved = true;
	if (moved && div.classList.contains("visuallyhidden")) {
			touchPos.ix = touchPos.x;
			touchPos.iy = touchPos.y;
			touchPos.x = x;
			touchPos.y = y;
			offsets.x += (touchPos.x - touchPos.ix) / midX * 2;
			offsets.y += (touchPos.y - touchPos.iy) / midY * 2;
			if (offsets.x > 2) offsets.x = 2;
			else if (offsets.x < -2) offsets.x = -2;
			if (offsets.y > 2) offsets.y = 2;
			else if (offsets.y < -2) offsets.y = -2;
	}
});

window.addEventListener("touchend", (e) => {
	if (!moved) {
			clickEventsCommon({ clientX: touchPos.x, clientY: touchPos.y });
			if (!div.classList.contains("visuallyhidden")) openOrCloseInfo();
	} else {
			moved = false;
			if (e.touches.length) {
					touchPos.ix = touchPos.x = e.touches[0].clientX;
					touchPos.iy = touchPos.y = e.touches[0].clientY;
			}
	}
	if (buttonU.material.color.getHex() != 0xbbbbbb) { buttonU.material.color.setHex(0xbbbbbb); buttonU.position.z = -48.25 }
	if (buttonD.material.color.getHex() != 0xbbbbbb) { buttonD.material.color.setHex(0xbbbbbb); buttonD.position.z = -48.25 }
});

window.addEventListener("mousedown", e => {
	if (touched) return;
	clickEventsCommon(e);
});

window.addEventListener("mousemove", (e) => {
	if (touched) return;
	offsets.x = -((e.clientX - midX) / midX) / 2;
	offsets.y = -((e.clientY - midY) / midY) / 2;
	const mouse2D = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
	const raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(mouse2D, getCamera());
	const check = [buttonU, buttonD, sign];
	const intersect = raycaster.intersectObjects(check);
	if (intersect.length > 0) document.body.style.cursor = "pointer";
	else document.body.style.cursor = "default";
});

window.addEventListener("mouseup", () => {
	if (touched) return touched = false;
	if (buttonU.material.color.getHex() != 0xbbbbbb) { buttonU.material.color.setHex(0xbbbbbb); buttonU.position.z = -48.25 }
	if (buttonD.material.color.getHex() != 0xbbbbbb) { buttonD.material.color.setHex(0xbbbbbb); buttonD.position.z = -48.25 }
});

function clickEventsCommon(e: { clientX: number, clientY: number }) {
	const mouse2D = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
	const raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(mouse2D, getCamera());
	var button, start = false;
	if (raycaster.intersectObject(buttonU).length > 0) button = buttonU;
	else if (raycaster.intersectObject(buttonD).length > 0) button = buttonD;
	else if (raycaster.intersectObject(sign).length > 0) {
			openOrCloseInfo();
			start = true;
	} else start = true;
	if (button) {
			button.material.color.setHex(0xf7eb93);
			button.position.z = -48.5;
	}
	if (!started) {
			started = true;
			if (start) starting = true;
	}
}

window.addEventListener("wheel", e => {
	if (div.classList.contains("hidden")) scrollDisplacement += e.deltaY;
});

window.addEventListener("keydown", e => {
	if (e.key == "Escape" && !div.classList.contains("hidden")) openOrCloseInfo();
});

var opened = false, moving = false, started = false, starting = false;
var scrollDisplacement = 0, scrollVelocity = 0;
function update() {
	if (started && starting) {
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
					if (!getSpawned()) spawnOutside();
			}
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
	const camera = getCamera();
	camera.lookAt(new THREE.Vector3(camera.position.x - (offsets.x + rotatedX) * 10, camera.position.y + (offsets.y + rotatedY) * 10, camera.position.z - 20));
}

var ticking = false;
setInterval(() => {
	if (!ticking) {
			ticking = true;
			update();
			ticking = false;
	}
}, 10);

var scrollStopped = 0, topped = false, bottomed = false;
const div = document.getElementById("info")!;
div.addEventListener("scroll", () => {
	topped = !div.scrollTop;
	bottomed = div.scrollTop === (div.scrollHeight - div.offsetHeight);
	scrollStopped = Date.now();
});
div.addEventListener("wheel", () => {
	scrollStopped = Date.now();
	scrollDisplacement = scrollVelocity = 0;
});

function hideOrUnhideInfo(cb = (_bool: boolean) => { }) {
	if (div.classList.contains('hidden')) {
			div.classList.remove('hidden');
			setTimeout(function () {
					div.classList.remove('visuallyhidden');
			}, 20);
			cb(false);
	} else {
			div.classList.add('visuallyhidden');
			div.addEventListener('transitionend', () => {
					div.classList.add('hidden');
					cb(true);
			}, { capture: false, once: true, passive: false });
	}
}

function openOrCloseInfo() {
	hideOrUnhideInfo(async hidden => {
			if (hidden) {
					setInnerHTML(div, "");
					bottomed = topped = false;
			} else {
					topped = !div.scrollTop;
					bottomed = div.scrollTop === (div.scrollHeight - div.offsetHeight);
					setInnerHTML(div, await ERROR_CONTENTS[0]());
			}
			scrollStopped = Date.now();
	});
}

function handleWheel(scroll: number) {
	scroll = scroll / 10;
	const camera = getCamera();
	if (!div.classList.contains('hidden')) return;
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
}
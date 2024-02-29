import * as THREE from "three";
import { resize, despawnOutside, spawnOutside, scene, buttonD, buttonU, display, doorL, doorR, midX, midY, sign, pointLight, obj } from ".";
import { openOrCloseInfo } from "./helpers/html";
import { FLOORS } from "./constants";
import { displayTexture } from "./generators";
import { getCamera, getCurrentFloor, getFloor, getGotoFloor, getRatio, getRotatedX, getRotatedY, getSpawned, getStarted, getTouched, setActualFloor, setCurrentFloor, setGotoFloor, setStarted, setTouched } from "./states";

window.addEventListener("resize", () => {
	resize();
}, true);

var moved = false;
const offsets = { x: 0, y: 0 };
const touchPos = { originX: 0, originY: 0, ix: 0, iy: 0, x: 0, y: 0 };
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
	touchPos.originX = touchPos.ix = touchPos.x = x;
	touchPos.originY = touchPos.iy = touchPos.y = y;
	setTouched(true);
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
		if (!div.classList.contains("visuallyhidden") && e.touches.length == 1 && touchPos.originX == touchPos.x && touchPos.originY == touchPos.y) openOrCloseInfo();
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
	if (getTouched() || e.button !== 0) return;
	clickEventsCommon(e);
});

window.addEventListener("mousemove", (e) => {
	if (getTouched()) return;
	offsets.x = -((e.clientX - midX) / midX) / 2;
	offsets.y = -((e.clientY - midY) / midY) / 2;
	const mouse2D = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
	const raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(mouse2D, getCamera());
	const check: THREE.Mesh[] = [buttonU, buttonD, display, sign];
	if (getFloor().listenMove) check.push(...getFloor().moveCheck());
	const intersect = raycaster.intersectObjects(check);
	if (intersect.length > 0) document.body.style.cursor = "pointer";
	else document.body.style.cursor = "default";
});

window.addEventListener("mouseup", () => {
	if (getTouched()) return setTouched(false);
	if (buttonU.material.color.getHex() != 0xbbbbbb) { buttonU.material.color.setHex(0xbbbbbb); buttonU.position.z = -48.25 }
	if (buttonD.material.color.getHex() != 0xbbbbbb) { buttonD.material.color.setHex(0xbbbbbb); buttonD.position.z = -48.25 }
});

function clickEventsCommon(e: { clientX: number, clientY: number }) {
	const mouse2D = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
	const raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(mouse2D, getCamera());
	var gotoFloor = getGotoFloor();
	const oldGotoFloor = gotoFloor;
	const currentFloor = getCurrentFloor();
	var button, start = false;
	if (raycaster.intersectObject(buttonU).length > 0) { button = buttonU; if (currentFloor != -1 && gotoFloor < FLOORS.size - 1) gotoFloor = setGotoFloor(gotoFloor + 1); }
	else if (raycaster.intersectObject(buttonD).length > 0) { button = buttonD; if (currentFloor != -1 && gotoFloor > 0) gotoFloor = setGotoFloor(gotoFloor - 1); }
	else if (raycaster.intersectObject(display).length > 0 && currentFloor != gotoFloor && currentFloor != -1 && !moving) displayPressed = true;
	else if (raycaster.intersectObject(sign).length > 0) {
		openOrCloseInfo(0);
		start = true;
	} else if (getFloor().listenClick) {
		getFloor().clickRaycast(raycaster);
		start = true;
	} else start = true;
	if (button) {
		button.material.color.setHex(0xf7eb93);
		button.position.z = -48.5;
	}
	if (gotoFloor != oldGotoFloor) {
		const xm = new THREE.MeshStandardMaterial({ map: displayTexture(gotoFloor), transparent: true });
		xm.map!.needsUpdate = true;
		display.material.splice(4, 1, xm);
	}
	if (!getStarted()) {
		setStarted(true);
		if (start && !pendingMove) starting = true;
	}
}

window.addEventListener("wheel", e => {
	if (div.classList.contains("hidden")) scrollDisplacement += e.deltaY;
});

window.addEventListener("keydown", e => {
	if (e.key == "Escape" && !div.classList.contains("hidden")) {
		openOrCloseInfo();
		const floor = getFloor();
		if (!floor.phase) floor.phase = 1;
	}
});

var displayPressed = false, opened = false, moving = false, starting = false, pendingMove = false, poppedState = false;
var diff = 0, scrollDisplacement = 0, scrollVelocity = 0;
function update() {
	if (displayPressed) {
		poppedState = false;
		if (opened) moving = true;
		displayPressed = false;
		diff = getGotoFloor() - getCurrentFloor();
		setActualFloor(getCurrentFloor());
		setCurrentFloor(-1);
		var symbol;
		if (diff > 0) symbol = "▲";
		else symbol = "▼";
		const xm = new THREE.MeshStandardMaterial({ map: displayTexture(symbol), transparent: true });
		xm.map!.needsUpdate = true;
		display.material.splice(4, 1, xm);
		pendingMove = true;
		setStarted(true);
	}
	if (getStarted() && starting) {
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
			despawnOutside();
			spawnOutside();
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
	if ((opened || moving) && getFloor().listenUpdate) getFloor().update(scene);
	const camera = getCamera();
	if (pendingMove && !moving && getStarted()) {
		pendingMove = false;
		setTimeout(() => {
			const gotoFloor = getGotoFloor();
			if (!poppedState) history.pushState({ floor: gotoFloor }, "", "/" + (gotoFloor == 0 ? "" : Array.from(FLOORS.keys())[gotoFloor]));
			setActualFloor(setCurrentFloor(gotoFloor));
			const xm = new THREE.MeshStandardMaterial({ map: displayTexture(getCurrentFloor()), transparent: true });
			xm.map!.needsUpdate = true;
			display.material.splice(4, 1, xm);

			Object.values(obj).forEach(mesh => mesh.position.y += 1000 * diff);
			camera.position.y = 1000 * getCurrentFloor();
			pointLight.position.y += 1000 * diff;
			moving = true;
			const audio = new Audio('/assets/lift.mp3');
			audio.play();
		}, 500 + 200 * Math.abs(diff));
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
	const point = new THREE.Vector3(camera.position.x - (offsets.x + getRotatedX()) * 10, camera.position.y + (offsets.y + getRotatedY()) * 10, camera.position.z - 20);
	camera.lookAt(point);
}

var ticking = false;
setInterval(() => {
	if (!ticking) {
		ticking = true;
		update();
		ticking = false;
	}
}, 10);

window.onpopstate = () => {
	setGotoFloor(history.state?.floor ?? 0);
	displayPressed = true;
	poppedState = true;
};

const div = document.getElementById("info")!;
div.addEventListener("wheel", (e) => {
	scrollDisplacement = scrollVelocity = 0;
});

function handleWheel(scroll: number) {
	scroll = scroll / 10;
	if (!div.classList.contains('hidden')) return;
	Array.from(FLOORS.values())[getCurrentFloor()].handleWheel(scroll);
}
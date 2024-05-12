import { FLOORS } from './constants';
import { wait } from './helpers/control';
import { getVar, setVar, toggleMusic } from './helpers/cookies';
import { disableStylesheet, enableStylesheet } from './helpers/css';
import { clamp } from './helpers/math';
import { floor } from './states';

let currentFloor = Array.from(FLOORS.keys()).indexOf(window.location.pathname.split("/").pop() || "ground"), targetFloor = currentFloor;
let moving = 0; // 1 means up, -1 means down, 0 means not moving
let state = 0; // 0 inside, 1 opening, 2 zooming, 3 htmling, 4 backing, 5 stay, 6 closing
let elevatorScale = 1; // scale for resizing

// setup element references
const background = document.querySelector<HTMLDivElement>("#background")!;
const elevator = document.querySelector<HTMLDivElement>("#elevator")!;
const info = document.querySelector<HTMLDivElement>("#info")!;
const closer = document.querySelector<HTMLDivElement>("#closer")!;
const upButton = document.querySelector<SVGTextPathElement>("#up-button")!;
const downButton = document.querySelector<SVGTextPathElement>("#down-button")!;
const floorButton = document.querySelector<SVGGElement>("#display")!;
const leftDoor = document.querySelector<SVGRectElement>("#left-door")!;
const rightDoor = document.querySelector<SVGRectElement>("#right-door")!;
const floorDisplay = document.querySelector<SVGTSpanElement>("#floor")!;

// update floor display
function updateDisplay() {
  if (moving > 0) floorDisplay.innerHTML = "▲";
  else if (moving < 0) floorDisplay.innerHTML = "▼";
  else if (targetFloor == 0) floorDisplay.innerHTML = "G";
  else floorDisplay.innerHTML = "" + targetFloor;
}

// load target floor and unload the last one
async function loadFloor() {
  floor().unloadSvg();
  const f = floor(FLOORS.get(Array.from(FLOORS.keys())[targetFloor]));
  currentFloor = targetFloor;
  background.innerHTML = await f.svg.get();
  f.loadSvg();
}

// initial load
loadFloor().then(updateDisplay);

// toggle the closing button for content
async function toggleCloser() {
  if (closer.classList.contains("hidden")) {
    closer.classList.remove("hidden");
    await wait(20);
    closer.classList.remove("visuallyhidden");
  } else {
		function onTransitionEnd() {
			closer.classList.add('hidden');
			closer.removeEventListener("transitionend", onTransitionEnd);
		}
    closer.addEventListener("transitionend", onTransitionEnd);
    closer.classList.add("visuallyhidden");
  }
}

// toggle html content of current floor
async function toggleContent() {
  if (info.classList.contains("hidden")) {
    info.innerHTML = await floor().content.get();
    floor().loadContent(info);
    info.classList.remove("hidden");
    await wait(20);
    info.classList.remove("visuallyhidden");
    toggleCloser();
  } else {
    toggleCloser();
    floor().unloadContent(info);
    info.innerHTML = "";
    threeToFive();
		function onTransitionEnd() {
			info.classList.add('hidden');
			info.removeEventListener("transitionend", onTransitionEnd);
		}
    info.addEventListener("transitionend", onTransitionEnd);
    info.classList.add("visuallyhidden");
  }
}

// transition from state 0 to 3
async function anyToThree() {
  if (state == 0) {
    const audio = new Audio('/assets/lift.mp3');
    audio.play();
    state = 1;
    leftDoor.style.transform = "translateX(-25%)";
    rightDoor.style.transform = "translateX(25%)";
    await wait(1500);
  }
  state = 2;
  // in case touch offset is happening
  elevator.style.transitionDuration = "";
  elevator.style.transitionTimingFunction = "";
  background.style.transitionDuration = "";
  background.style.transitionTimingFunction = "";
  const rect = leftDoor.getBoundingClientRect();
  const scale = Math.max(window.innerWidth / (rect.width * 2), window.innerHeight / rect.height);
  elevatorScale = scale;
  elevator.style.transform = `scale(${scale}, ${scale})`;
  background.style.transform = "scale(1.2, 1.2)";
  await wait(1500);
  state = 3;
  toggleContent();
}

// transition from state 3 to 4
async function threeToFive() {
  await wait(500);
  state = 4;
  elevator.style.transform = "";
  background.style.transform = "";
  elevatorScale = 1;
  await wait(1500);
  state = 5;
}

// transition from state 4 to 0
async function fiveToZero() {
  state = 6;
  leftDoor.style.transform = "";
  rightDoor.style.transform = "";
  await wait(1500);
  state = 0;
}

let clickOnButton = false;
const buttonPress = (button: SVGElement) => {
  clickOnButton = true;
  button.style.fill = "#f7eb93";
};
const buttonRelease = (button: SVGElement, deltaFloor: number) => {
  button.style.fill = "#bbbbbb";
  targetFloor = deltaFloor > 0 ? Math.min(FLOORS.size - 1, targetFloor + deltaFloor) : Math.max(0, targetFloor + deltaFloor);
  updateDisplay();
};
const buttonCancel = (button: SVGElement) => {
  clickOnButton = false;
  button.style.fill = "#bbbbbb";
};
// up button handlers
upButton.onmousedown = () => buttonPress(upButton);
upButton.ontouchstart = () => buttonPress(upButton);
upButton.onclick = () => buttonRelease(upButton, 1);
upButton.onmouseleave = () => buttonCancel(upButton);

// down button handlers
downButton.onmousedown = () => buttonPress(downButton);
downButton.ontouchstart = () => buttonPress(downButton);
downButton.onclick = () => buttonRelease(downButton, -1);
downButton.onmouseleave = () => buttonCancel(downButton);

// floor button handler
floorButton.onmousedown = () => {
  clickOnButton = true;
}
floorButton.onclick = async () => {
  if (moving) return;
  moving = targetFloor - currentFloor;
  updateDisplay();
  if (moving) {
    await fiveToZero();
    await loadFloor();
    await wait(500 + 200 * Math.abs(moving));
    history.pushState({ floor: targetFloor }, "", "/" + (targetFloor == 0 ? "" : Array.from(FLOORS.keys())[targetFloor]));
    moving = 0;
    updateDisplay();
    anyToThree();
  }
}

// touch handlers for mobile support
let touch = { ix: 0, x: 0, offset: 0 };
let canTouch = false;
window.ontouchstart = (evt) => {
  if (!canTouch) return;
  if (state == 2 || state == 4) {
    touch.offset = 0;
    return;
  }
  touch.x = touch.ix = Array.from(evt.touches).map(t => t.clientX).reduce((a, b) => a + b) / evt.touches.length;
  elevator.style.transitionDuration = "0s";
  elevator.style.transitionTimingFunction = "linear";
  background.style.transitionDuration = "0s";
  background.style.transitionTimingFunction = "linear";
}
window.ontouchend = (evt) => {
  if (!canTouch) return;
  if (state == 2 || state == 4) {
    touch.offset = 0;
    return;
  }
  if (evt.touches.length) touch.ix = Array.from(evt.touches).map(t => t.clientX).reduce((a, b) => a + b) / evt.touches.length;
  else {
    touch.offset = clamp((touch.x - touch.ix) * 100 / window.innerWidth + touch.offset, -35, 35);
    elevator.style.transitionDuration = "";
    elevator.style.transitionTimingFunction = "";
    background.style.transitionDuration = "";
    background.style.transitionTimingFunction = "";
  }
}
window.ontouchmove = (evt) => {
  if (!canTouch) return;
  if (state == 2 || state == 4) {
    touch.offset = 0;
    return;
  }
  touch.x = Array.from(evt.touches).map(t => t.clientX).reduce((a, b) => a + b) / evt.touches.length;
  const offset = clamp((touch.x - touch.ix) * 100 / window.innerWidth + touch.offset, -35, 35);
  if (state == 3) {
    elevator.style.transform = `scale(${elevatorScale}, ${elevatorScale})`;
    background.style.transform = `translateX(${offset}%) scale(1.2, 1.2)`;
  }
  else {
    elevator.style.transform = `translateX(${offset}%)`;
    background.style.transform = `translateX(${offset / 4}%)`;
  }
}

// initial click-starter
window.onclick = () => {
  if (clickOnButton) clickOnButton = false;
  else {
    if (state == 0 || state == 5) anyToThree();
  }
}

// resize handler
let resizeTimeout: NodeJS.Timeout | undefined = undefined;
function resize() {
  if (window.innerWidth / window.innerHeight < 1) {
    enableStylesheet(document.getElementById("vertical"));
    disableStylesheet(document.getElementById("horizontal"));
  } else {
    enableStylesheet(document.getElementById("horizontal"));
    disableStylesheet(document.getElementById("vertical"));
  }

  const newCanTouch = window.innerWidth / window.innerHeight < 1.25;
  const canTouchDiff = newCanTouch != canTouch;
  canTouch = newCanTouch;

  if (state == 3) {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const rect = leftDoor.getBoundingClientRect();
      const scale = Math.max(window.innerWidth / (rect.width * 2), window.innerHeight / rect.height) * elevatorScale;
      elevatorScale = scale;
      elevator.style.transform = `scale(${scale}, ${scale})`;
      resizeTimeout = undefined;
    }, 100);

    if (canTouchDiff && !canTouch) background.style.transform = "scale(1.2, 1.2)";
  } else if (canTouchDiff && !canTouch) {
    elevator.style.transform = "";
    background.style.transform = "";
  }
}

// initial resizing
resize();
window.onresize = resize;

// cookie reading
if (getVar("use_cookies")) {
  setVar("use_cookies", 1);
  setVar("answered", 1);
  for (const key of Object.keys(window.sessionStorage)) setVar(key, window.sessionStorage.getItem(key));
}
if (getVar("no_music") == "0") (document.getElementById("player") as HTMLAudioElement).play();
else if (!getVar("no_music")) toggleMusic();

// additional setup
closer.onclick = () => {
  toggleContent();
}
window.onkeydown = e => {
	if (e.key == "Escape" && !info.classList.contains("hidden")) toggleContent();
}

// pop history
window.onpopstate = async () => {
  targetFloor = history.state?.floor || 0;
  moving = targetFloor - currentFloor;
  updateDisplay();
  if (moving) {
    if (state == 3) {
      if (!info.classList.contains("hidden")) toggleContent();
      await threeToFive();
    }
    if (state == 5) await fiveToZero();
    await loadFloor();
    await wait(500 + 200 * Math.abs(moving));
    moving = 0;
    updateDisplay();
    anyToThree();
  }
}
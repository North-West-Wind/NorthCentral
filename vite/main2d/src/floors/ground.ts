import { getConfig, toggleMusic, toggleSmoothScroll, writeConfig } from "../helpers/control";
import Floor from "../types/floor";

const ID = "ground";

class RainDrop {
	node: HTMLDivElement;
	x: number;
	rot: number;
	finished = false;

	constructor() {
		this.node = document.createElement("div");
		this.node.classList.add("rain");
		this.x = Math.round(Math.random() * 100);
		this.rot = Math.floor(Math.random() * 360);
	}

	start() {
		document.body.append(this.node);
		this.node.style.transform = `translateX(${this.x}vw) rotate(${this.rot}deg)`;
		setTimeout(() => {
			this.node.style.transform = `translate(${this.x}vw, calc(100vh + 3vmin)) rotate(${this.rot}deg)`;
			setTimeout(() => {
				this.node.remove();
				this.finished = true;
			}, 250);
		}, 250);
	}
}

export default class GroundFloor extends Floor {
	rainDrops: RainDrop[] = [];
	spawnTimer?: NodeJS.Timer;

	constructor() {
		super(ID, 0);
	}

	loadSvg() {
		this.spawnTimer = setInterval(() => {
			this.rainDrops = this.rainDrops.filter(r => !r.finished);
			const drop = new RainDrop();
			drop.start();
			this.rainDrops.push(drop);
		}, 100);
	}

	unloadSvg() {
		if (this.spawnTimer) clearInterval(this.spawnTimer);
	}

	loadContent(info: HTMLDivElement) {
		if (getConfig().answerStorage) {
			const storageInfo = document.getElementById("storage-prompt")!;
			storageInfo.classList.add("hidden");
		}
		function accept() {
			getConfig().allowStorage = true;
			answer();
		}
		function answer() {
			getConfig().answerStorage = true;
			writeConfig();
			const storageInfo = document.getElementById("storage-prompt")!;
			storageInfo.classList.add("hidden");
		}

		(<HTMLAnchorElement>document.getElementsByClassName("storage-button accept")[0]).onclick = () => accept();
		(<HTMLAnchorElement>document.getElementsByClassName("storage-button deny")[0]).onclick = () => answer();

		const setButtonText = (button: HTMLDivElement, prefix: string, key: string) => {
			if ((getConfig() as any)[key]) {
				button.innerHTML = prefix + ": On";
				button.classList.add("on");
				button.classList.remove("off");
			} else {
				button.innerHTML = prefix + ": Off";
				button.classList.add("off");
				button.classList.remove("on");
			}
		};
		const musicButton = document.getElementById("toggle-music") as HTMLDivElement;
		musicButton.onclick = () => {
			toggleMusic();
			setButtonText(musicButton, "Music", "music");
		}
		setButtonText(musicButton, "Music", "music");
	
		const smoothScrollButton = document.getElementById("smooth-scroll") as HTMLDivElement;
		smoothScrollButton.onclick = () => {
			toggleSmoothScroll();
			setButtonText(smoothScrollButton, "Smooth Scroll (3D-Only)", "smoothScroll");
		}
		setButtonText(smoothScrollButton, "Smooth Scroll (3D-Only)", "smoothScroll");

		// on-the-fly content patching
		info.querySelector<HTMLHeadingElement>("h1")!.innerHTML = "North's Elevator (2D Edition)";
		info.removeChild(info.querySelectorAll("p")[1]);
	}
}
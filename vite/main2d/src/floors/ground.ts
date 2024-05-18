import { getConfig, toggleMusic, writeConfig } from "../helpers/control";
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
		if (getConfig().answeredCookies) {
			const cookieInfo = document.getElementById("cookies")!;
			cookieInfo.classList.add("hidden");
		}
		function accept() {
			getConfig().useCookies = true;
			answer();
		}
		function answer() {
			getConfig().answeredCookies = true;
			writeConfig();
			const cookieInfo = document.getElementById("cookies")!;
			cookieInfo.classList.add("hidden");
		}

		(<HTMLAnchorElement>document.getElementsByClassName("cookie-button accept")[0]).onclick = () => accept();
		(<HTMLAnchorElement>document.getElementsByClassName("cookie-button deny")[0]).onclick = () => answer();

		document.getElementById("toggleMusic")!.onclick = () => toggleMusic();

		// on-the-fly content patching
		info.querySelector<HTMLHeadingElement>("h1")!.innerHTML = "North's Elevator (2D Edition)";
		info.removeChild(info.querySelectorAll("p")[1]);
	}
}
import { wait } from "../helpers/control";
import { randomBetween } from "../helpers/math";
import { toggleContent } from "../main";
import Floor from "../types/floor";

const audio = new Audio('/assets/sounds/ding.mp3');

export default class InfoCenterFloor extends Floor {
	dinged = false;

	constructor() {
		super("info-center", 1);
		this.disableContent = true;
	}

	async blinker() {
		while (this.dinged) {
			await wait(randomBetween(10000, 20000));
			document.querySelector<SVGGElement>("#eye-open")?.classList.add("hidden");
			document.querySelector<SVGGElement>("#eye-close")?.classList.remove("hidden");
			await wait(200);
			document.querySelector<SVGGElement>("#eye-close")?.classList.add("hidden");
			document.querySelector<SVGGElement>("#eye-open")?.classList.remove("hidden");
		}
	}

	loadSvg() {
		const integrelle = document.querySelector<SVGGElement>("#integrelle")!;
		const eyeClose = document.querySelector<SVGGElement>("#eye-close")!;
		const arms = document.querySelector<SVGGElement>("#arms")!;
		const hands = document.querySelector<SVGGElement>("#hands")!;
		const bell = document.querySelector<SVGGElement>("#bell")!;

		integrelle.classList.add("hidden");
		eyeClose.classList.add("hidden");
		arms.classList.add("hidden");
		hands.classList.add("hidden");
		bell.classList.add("link-like");

		integrelle.style.transform = "translateY(50vh)";
		arms.style.transform = "translateY(50vh)";

		bell.onclick = async () => {
			audio.play();
			if (this.dinged) return;
			this.dinged = true;
			await wait(500);
			arms.classList.remove("hidden");
			await wait(10);
			arms.style.transform = "";
			await wait(1000);
			arms.classList.add("hidden");
			hands.classList.remove("hidden");
			await wait(500);
			integrelle.classList.remove("hidden");
			await wait(10);
			integrelle.style.transform = "";

			this.blinker();
			await wait(1500);
			toggleContent();
			this.disableContent = false;
		}
	}

	unloadSvg() {
		this.dinged = false;
		this.disableContent = true;
	}

	loadContent(info: HTMLDivElement) {
		
	}
}
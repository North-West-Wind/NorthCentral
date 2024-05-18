import { wait } from "../helpers/control";
import { randomBetween } from "../helpers/math";
import { readPage } from "../helpers/reader";
import { toggleContent } from "../main";
import Floor from "../types/floor";
import { LazyLoader } from "../types/misc";

const PAGES = new Map<string, LazyLoader<string>>();
fetch(`/api/config`).then(async res => {
	if (!res.ok) return;
	const files = <string[]>(await res.json()).info;
	for (const file of files)
		PAGES.set(file.split(".").slice(0, -1).join("."), new LazyLoader(() => readPage(`/contents/info-center/${file}`)));
});

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
			const audio = new Audio('/assets/sounds/ding.mp3');
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
	
	async loadConversation(info: HTMLDivElement, next: string) {
		const page = PAGES.get(next);
		if (page) info.innerHTML = await page.get();
		else info.innerHTML = await this.content.get();
		
		this.loadContent(info);
	}

	async loadContent(info: HTMLDivElement) {
		for (const li of info.querySelectorAll<HTMLLIElement>("li")) {
			if (li.hasAttribute("next"))
				li.onclick = () => this.loadConversation(info, li.getAttribute("next")!);
		}
	}
}
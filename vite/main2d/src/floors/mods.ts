import { readPage } from "../helpers/reader";
import { toggleContent } from "../main";
import Floor from "../types/floor";
import { LazyLoader } from "../types/misc";

enum ModPage {
	AUTO_FISH = "auto-fish",
	MORE_BOOTS = "more-boots"
};

const MOD_CONTENTS = new Map<string, LazyLoader<string>>();
for (const page of Object.values(ModPage)) MOD_CONTENTS.set(page, new LazyLoader(() => readPage(`/contents/mods/${page}.html`)));

export default class MoreBootsFloor extends Floor {
	constructor() {
		super("mods", 2);
		this.disableContent = true;
	}

	private async toggleModInfo(page: ModPage) {
		toggleContent(await MOD_CONTENTS.get(page)!.get());
	}

	loadSvg() {
		const rod = document.querySelector<SVGGElement>("#rod")!;
		const boots = document.querySelector<SVGGElement>("#boots")!;

		rod.classList.add("link-like");
		boots.classList.add("link-like");

		rod.onclick = () => this.toggleModInfo(ModPage.AUTO_FISH);
		boots.onclick = () => this.toggleModInfo(ModPage.MORE_BOOTS);
	}
}
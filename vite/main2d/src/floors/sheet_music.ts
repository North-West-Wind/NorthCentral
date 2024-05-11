import { readPage } from "../helpers/reader";
import Floor from "../types/floor";
import { LazyLoader } from "../types/misc";

const SHEETS = 12;

export const SHEETMUSIC_CONTENTS: LazyLoader<string>[] = [];
export const SHEETMUSIC_TITLES: string[] = [];

(async () => {
	for (let i = 0; i < SHEETS; i++) {
		const loader = new LazyLoader(() => readPage(`/contents/sheetmusic/info-${i}.html`));
		SHEETMUSIC_CONTENTS.push(loader);
		// be not lazy
		const content = await loader.get();
		SHEETMUSIC_TITLES.push(content.match(/\<h1\>(?<name>.+)\<\/h1\>/)![1]);
	}
})();

export default class SheetMusicFloor extends Floor {
	constructor() {
		super("sheet-music", 5);
	}

	async loadSheetContent(info: HTMLDivElement, index: number) {
		info.innerHTML = await SHEETMUSIC_CONTENTS[index].get();

		const h1 = info.querySelector<HTMLHeadingElement>("h1")!;
		h1.classList.add("sheet-back");
		h1.innerHTML = "<- " + h1.innerText;
		h1.onclick = () => this.loadContent(info);
	}

	async loadContent(info: HTMLDivElement) {
		info.innerHTML = await this.content.get();

		const ul = info.querySelector<HTMLUListElement>("ul")!;
		for (let ii = 0; ii < SHEETMUSIC_TITLES.length; ii++) {
			const title = SHEETMUSIC_TITLES[ii];
			const li = document.createElement("li");
			li.innerHTML = title;
			li.onclick = () => this.loadSheetContent(info, ii);

			ul.appendChild(li);
		}
	}
}
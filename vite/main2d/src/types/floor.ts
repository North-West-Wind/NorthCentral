import { readPage } from "../helpers/reader";
import { LazyLoader } from "./misc";

export default abstract class Floor {
	id: string;
	num: number;
	svg: LazyLoader<string>;
	content: LazyLoader<string>;
	phase = 0;
	disableContent = false;

	constructor(id: string, num: number, loaders?: { svg?: LazyLoader<string>, content?: LazyLoader<string> }) {
		this.id = id;
		this.num = num;
		this.svg = loaders?.svg || new LazyLoader(() => readPage(`/assets/background/${num}-${id}.svg`));
		this.content = loaders?.content || new LazyLoader(() => readPage(`/contents/${num}-${id}.html`));
	}

	loadSvg() { }
	unloadSvg() { }

	loadContent(_info: HTMLDivElement) { }
	unloadContent(_info: HTMLDivElement) { }
}
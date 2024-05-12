import { readPage } from "../helpers/reader";
import Floor from "../types/floor";
import { LazyLoader } from "../types/misc";

const TEMPLATE = new LazyLoader(() => readPage("/contents/gallery/template.html"));
let FILES: string[] = [];

fetch(`/files/${encodeURIComponent("public/assets/pfps")}`).then(async res => {
	if (!res.ok) return;
	const files = <string[]>await res.json();
	FILES = files.sort();
});

export default class GalleryFloor extends Floor {
	constructor() {
		super("gallery", 6);
	}

	async loadPicture(info: HTMLDivElement, index: number) {
		const file = FILES[index];
		info.innerHTML = (await TEMPLATE.get()).replace("{title}", file.split(" ").slice(1).join(" ").split(".").slice(0, -1).join(".")).replace("{src}", `/assets/pfps/${file}`);

		const h1 = info.querySelector<HTMLHeadingElement>("h1")!;
		h1.classList.add("sheet-back");
		h1.innerHTML = "<- " + h1.innerText;
		h1.onclick = () => this.loadContent(info);
	}

	async loadContent(info: HTMLDivElement) {
		info.innerHTML = await this.content.get();

		let columnDiv: HTMLDivElement;
		for (let ii = 0; ii < FILES.length; ii++) {
			const file = FILES[ii];
			if (ii % 2 == 0) {
				columnDiv = document.createElement("div");
				columnDiv.classList.add("flex", "vcenter");
				info.appendChild(columnDiv);
			}
			const innerDiv = document.createElement("div");
			const h2 = document.createElement("h2");
			h2.innerHTML = file.split(" ").slice(1).join(" ").split(".").slice(0, -1).join(".");
			const img = document.createElement("img");
			img.src = `/assets/pfps/${file}`;
			innerDiv.appendChild(h2);
			innerDiv.appendChild(img);
			columnDiv!.appendChild(innerDiv);

			innerDiv.classList.add("link-like", "gallery-entry");
			innerDiv.onclick = () => this.loadPicture(info, ii);
		}
	}
}
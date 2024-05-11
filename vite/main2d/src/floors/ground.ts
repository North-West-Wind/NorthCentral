import { getVar, setVar, toggleMusic } from "../helpers/cookies";
import { readPage } from "../helpers/reader";
import Floor from "../types/floor";
import { LazyLoader } from "../types/misc";

const ID = "ground";

export default class GroundFloor extends Floor {
	constructor() {
		super(ID, 0, { content: new LazyLoader(() => readPage("/contents/information.html")) });
	}

	loadContent(info: HTMLDivElement) {
		if (getVar("answered")) {
			const cookieInfo = document.getElementById("cookies")!;
			cookieInfo.classList.add("hidden");
		}
		function accept() {
			window.sessionStorage.setItem("use_cookies", "1");
			setVar("use_cookies", 1);
			for (const key of Object.keys(window.sessionStorage)) setVar(key, window.sessionStorage.getItem(key));
			answer();
		}
		function answer() {
			setVar("answered", 1);
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
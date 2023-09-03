import { CONTENTS } from "../constants";
import { getVar, setVar, toggleMusic } from "./cookies";

export function gotoRoot() {
	document.location.href = "/";
}

export function setInnerHTML(elm: HTMLElement, html: string) {
	elm.innerHTML = html;
	Array.from(elm.querySelectorAll("script")).forEach(oldScript => {
		const newScript = document.createElement("script");
		Array.from(oldScript.attributes)
			.forEach(attr => newScript.setAttribute(attr.name, attr.value));
		newScript.appendChild(document.createTextNode(oldScript.innerHTML));
		oldScript.parentNode!.replaceChild(newScript, oldScript);
	});
}

const div = document.getElementById("info")!;
export function hideOrUnhideInfo(cb = (_bool: boolean) => { }) {
	if (div.classList.contains('hidden')) {
		div.classList.remove('hidden');
		setTimeout(function () {
			div.classList.remove('visuallyhidden');
		}, 20);
		cb(false);
	} else {
		div.classList.add('visuallyhidden');
		div.addEventListener('transitionend', function () {
			div.classList.add('hidden');
			cb(true);
		}, { capture: false, once: true, passive: false });
	}
}

export function openOrCloseInfo(index = 0) {
	hideOrUnhideInfo(async hidden => {
		if (hidden) setInnerHTML(div, "");
		else {
			setInnerHTML(div, await CONTENTS[index]());
			if (!index) {
				// Add buttons functionality
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
			}
		}
	});
}
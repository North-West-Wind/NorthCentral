import { CONTENTS } from "../constants";
import { getVar, setVar, toggleMusic } from "./control";

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
const closer = document.getElementById("closer")!;
closer.onclick = () => {
	if (!div.classList.contains('hidden')) openOrCloseInfo();
}

export function hideOrUnhideInfo(cb = (_bool: boolean) => { }) {
	if (div.classList.contains('hidden')) {
		div.classList.remove('hidden');
		closer.classList.remove('hidden');
		setTimeout(function () {
			div.classList.remove('visuallyhidden');
			closer.classList.remove('visuallyhidden');
		}, 20);
		cb(false);
	} else {
		closer.classList.add('visuallyhidden');
		div.classList.add('visuallyhidden');
		function onTransitionEnd() {
			div.classList.add('hidden');
			closer.classList.add('hidden');
			cb(true);
			div.removeEventListener("transitionend", onTransitionEnd);
		}
		div.addEventListener('transitionend', onTransitionEnd, { capture: false, once: true, passive: false });
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
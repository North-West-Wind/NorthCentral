import { CONTENTS } from "../constants";

export function gotoRoot() {
	document.location.href = "/";
}

export function setInnerHTML(elm: HTMLElement, html: string) {
	elm.innerHTML = html;
	Array.from(elm.querySelectorAll("script")).forEach( oldScript => {
		const newScript = document.createElement("script");
		Array.from(oldScript.attributes)
			.forEach( attr => newScript.setAttribute(attr.name, attr.value) );
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
		else setInnerHTML(div, await CONTENTS[index]());
	});
}
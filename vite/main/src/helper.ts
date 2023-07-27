export function enableStylesheet(node: any) { node.disabled = false; }
export function disableStylesheet(node: any) { node.disabled = true; }

export function useCookies() {
	return window.sessionStorage.getItem("use_cookies") || getVar("use_cookies", true);
}

export function setVar(cname: string, cvalue: any) {
	if (useCookies()) document.cookie = cname + "=" + cvalue + ";SameSite=Strict;expires=Tue, 19 Jan 2038 04:14:07 GMT;path=/";
	else window.sessionStorage.setItem(cname, cvalue);
}

export function getVar(cname: string, forceCookie = false) {
	if (forceCookie || useCookies()) {
			let name = cname + "=";
			let decodedCookie = decodeURIComponent(document.cookie);
			let ca = decodedCookie.split(';');
			for (let i = 0; i < ca.length; i++) {
					let c = ca[i];
					while (c.charAt(0) == ' ') {
							c = c.substring(1);
					}
					if (c.indexOf(name) == 0) {
							return c.substring(name.length, c.length);
					}
			}
			return "";
	} else return window.sessionStorage.getItem(cname);
}

export function toggleMusic() {
	const cookie = getVar("no_music");
	if (!cookie || cookie == "0") {
			setVar("no_music", 1);
			(document.getElementById("player") as HTMLAudioElement).pause();
	} else {
			setVar("no_music", 0);
			(document.getElementById("player") as HTMLAudioElement).play();
	}
}

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
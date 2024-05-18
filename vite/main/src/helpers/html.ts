import { FLOORS } from "../constants";
import { floor } from "../states";
import { wait } from "./control";

export function gotoRoot() {
	document.location.href = "/";
}

const div = document.getElementById("info") as HTMLDivElement;
const closer = document.getElementById("closer")!;
closer.onclick = () => {
	if (!div.classList.contains('hidden')) toggleContent();
}

// toggle the closing button for content
async function toggleCloser() {
  if (closer.classList.contains("hidden")) {
    closer.classList.remove("hidden");
    await wait(20);
    closer.classList.remove("visuallyhidden");
  } else {
		function onTransitionEnd() {
			closer.classList.add('hidden');
			closer.removeEventListener("transitionend", onTransitionEnd);
		}
    closer.addEventListener("transitionend", onTransitionEnd);
    closer.classList.add("visuallyhidden");
  }
}

export async function toggleContent(options?: { html?: string | (() => Promise<string>), index?: number }) {
  if (div.classList.contains("hidden")) {
    if (options?.html) {
			if (typeof options.html === "string") div.innerHTML = options.html;
			else div.innerHTML = await options.html();
		} else if (options?.index !== undefined) div.innerHTML = await Array.from(FLOORS.values())[options.index].content.get();
    else div.innerHTML = await floor()!.content.get();
    if (options?.index !== undefined) Array.from(FLOORS.values())[options.index].loadContent(div);
    else floor()!.loadContent(div);
    div.classList.remove("hidden");
    await wait(20);
    div.classList.remove("visuallyhidden");
    toggleCloser();
  } else {
    toggleCloser();
    floor()!.unloadContent(div);
    div.innerHTML = "";
		function onTransitionEnd() {
			div.classList.add('hidden');
			div.removeEventListener("transitionend", onTransitionEnd);
		}
    div.addEventListener("transitionend", onTransitionEnd);
    div.classList.add("visuallyhidden");
  }
}
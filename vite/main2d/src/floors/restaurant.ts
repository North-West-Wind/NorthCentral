import { getConfig, setMusic, wait, writeConfig } from "../helpers/control";
import { randomBetween } from "../helpers/math";
import { toggleContent } from "../main";
import Floor from "../types/floor";

type SummatiaData = {
	[key: string]: {
		message: string;
		emotion: string | number;
		delay: number;
		responses?: { message: string, next: string }[];
		next?: string;
	}
} & { emotions: { [key: string]: number } }

let summatiaData: SummatiaData;

fetch("/data/summatia.json").then(async res => {
	if (res.ok) summatiaData = await res.json();
});

function validKeyOrElse(key: string, fallback: string) {
	return summatiaData && Object.keys(summatiaData).includes(key) ? key : fallback;
}

const MUSICS = {
	jazz0: `Music by <a href="https://pixabay.com/users/denis-pavlov-music-35636692/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=168726">Denis Pavlov</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=168726">Pixabay</a>`,
	jazz1: `Music by <a href="https://pixabay.com/users/denis-pavlov-music-35636692/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=219314">Denis Pavlov</a> from <a href="https://pixabay.com/music//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=219314">Pixabay</a>`,
	jazz2: `Music by <a href="https://pixabay.com/users/denis-pavlov-music-35636692/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=219302">Denis Pavlov</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=219302">Pixabay</a>`
};

export default class RestaurantFloor extends Floor {
	emotion: number;
	resets: number;
	active = false;
	musicPlaying = false;
	audio!: HTMLAudioElement;

	constructor() {
		super("restaurant", 4);
		this.disableContent = true;
		this.emotion = 17;
		this.resets = 0;
		this.setupJazz();
	}

	private setupJazz() {
		const key = "jazz" + randomBetween(0, 2);
		this.audio = new Audio(`/assets/sounds/jazz/${key}.mp3`);
		this.audio.onplay = () => {
			const div = document.querySelector<HTMLDivElement>("div#summatia-credits")!;
			div.innerHTML = (MUSICS as any)[key];
			div.style.opacity = "1";
			setTimeout(() => div.style.opacity = "0", 5000);
		}
		this.audio.onended = () => this.setupJazz();
		if (this.active) this.audio.play();
	}

	private enableByEmotion() {
		const svg = document.querySelector<SVGElement>("#background svg")!;

		svg.querySelector<SVGGElement>("#eye")!.style.display = this.emotion & (1 + 2) ? "inline" : "none";
		svg.querySelector<SVGGElement>("#eye-half")!.style.display = this.emotion & (4 + 8) ? "inline" : "none";
		svg.querySelectorAll<SVGGElement>(".eye-open").forEach(item => item.style.display = this.emotion & (1 + 4) ? "inline" : "none");
		svg.querySelectorAll<SVGGElement>(".eye-close").forEach(item => item.style.display = this.emotion & (2 + 8) ? "inline" : "none");

		svg.querySelector<SVGPathElement>("#mouth-smile")!.style.display = this.emotion & (16) ? "inline" : "none";
		svg.querySelector<SVGPathElement>("#mouth-sad")!.style.display = this.emotion & (32) ? "inline" : "none";
		svg.querySelector<SVGGElement>("#mouth-laugh")!.style.display = this.emotion & (64) ? "inline" : "none";
		svg.querySelector<SVGGElement>("#mouth-mad")!.style.display = this.emotion & (128) ? "inline" : "none";

		svg.querySelector<SVGGElement>("#blush")!.style.opacity = this.emotion & (256) ? "1" : "0";

		if (this.emotion & (512 + 1024)) {
			svg.querySelector<SVGPathElement>(".left-brow")!.style.transform = `rotate(${this.emotion & 512 ? "-10" : "20"}deg)`;
			svg.querySelector<SVGPathElement>(".right-brow")!.style.transform = `rotate(${this.emotion & 512 ? "10" : "-20"}deg)`;
		} else
			svg.querySelectorAll<SVGPathElement>(".brow").forEach(item => item.style.transform = "");

		svg.querySelectorAll<SVGElement>(".summatia-head").forEach(item => item.style.transform = `translateY(${this.emotion & 2048 ? "5" : "0"}px)`);

		svg.querySelector<SVGGElement>("#hands-table")!.style.display = this.emotion & (4096) ? "inline" : "none";
		svg.querySelector<SVGGElement>("#hands-hold")!.style.display = this.emotion & (8192) ? "inline" : "none";
		svg.querySelector<SVGGElement>("#hands-face")!.style.display = this.emotion & (16384) ? "inline" : "none";

		if (this.emotion & 32768)
			svg.querySelectorAll<SVGPathElement>(".pupil").forEach(item => item.style.transform = "translateY(18px)");
		else if (this.emotion & 131072) {
			svg.querySelectorAll<SVGPathElement>(".left-pupil").forEach(item => item.style.transform = "translate(-14px, 9px)");
			svg.querySelectorAll<SVGPathElement>(".right-pupil").forEach(item => item.style.transform = "translate(-24px, 9px)");
		} else if (this.emotion & 262144) {
			svg.querySelectorAll<SVGPathElement>(".left-pupil").forEach(item => item.style.transform = "translate(20px, 9px)");
			svg.querySelectorAll<SVGPathElement>(".right-pupil").forEach(item => item.style.transform = "translate(13px, 9px)");
		} else
			svg.querySelectorAll<SVGPathElement>(".pupil").forEach(item => item.style.transform = "");
	}

	private async next(key: string) {
		const data = summatiaData[key];
		if (!data) return;
		let pid = this.resets;
		if (!key.startsWith("back")) {
			// avoid back looping
			getConfig().summatia = key;
			writeConfig();
		}

		this.emotion = typeof data.emotion == "string" ? summatiaData.emotions[data.emotion] : data.emotion;
		this.enableByEmotion();

		const ans = document.querySelector<HTMLDivElement>("#summatia-ans")!;
		ans.style.opacity = "0";
		ans.innerHTML = "";

		const say = document.querySelector<HTMLDivElement>("#summatia-say")!;
		let message = "";
		for (const char of data.message) {
			message += char;
			say.innerHTML = message;
			await wait(50);
			if ("!,.:;?".includes(char)) await wait(500);
			if (pid != this.resets) return;
		}
		if (data.next) {
			const waitForClick = new Promise<void>((res) => window.addEventListener("click", () => res(), { once: true }));
			if (getConfig().autoSummatia) await Promise.race([wait(1000 + data.message.length * 100), waitForClick]);
			else await waitForClick;
		}
		if (pid != this.resets) return;

		if (data.responses) {
			for (const response of data.responses) {
				const div = document.createElement("div");
				div.innerHTML = response.message;
				div.onclick = () => this.next(response.next);
				ans.appendChild(div);
			}
			ans.style.opacity = "1";
		} else if (data.next) this.next(data.next);
		else this.next(validKeyOrElse(getConfig().summatia, "first"));
	}

	loadContent(info: HTMLDivElement): void {
		info.style.backgroundColor = "transparent";

		info.querySelector<HTMLDivElement>("#summatia-reset")!.onclick = () => {
			this.resets++;
			getConfig().summatia = "";
			this.next("first");
		}

		const auto = info.querySelector<HTMLDivElement>("#summatia-auto")!;
		auto.querySelector("span")!.innerHTML = "Auto: " + (getConfig().autoSummatia ? "On" : "Off");
		auto.onclick = () => {
			getConfig().autoSummatia = !getConfig().autoSummatia;
			writeConfig();
			auto.querySelector("span")!.innerHTML = "Auto: " + (getConfig().autoSummatia ? "On" : "Off");
		}
		this.next(getConfig().summatia ? "back" : "first");
		setMusic(false, false);
		this.audio.play();
		this.active = true;
	}

	unloadContent(info: HTMLDivElement): void {
		info.style.backgroundColor = "";
		this.audio.pause();
		this.active = false;
		if (this.musicPlaying) setMusic(true, false);
	}

	loadSvg(bg: HTMLDivElement) {
		const cover = bg.querySelector<SVGRectElement>("svg rect#cover")!;
		cover.style.display = "inline";

		this.enableByEmotion();
	}

	async enter() {
		this.musicPlaying = getConfig().music;
		setMusic(false, true);
		await wait(3000);
		const cover = document.querySelector<SVGRectElement>("#background svg rect#cover")!;
		cover.style.display = "none";
		await wait(1000);
		toggleContent();
	}
}
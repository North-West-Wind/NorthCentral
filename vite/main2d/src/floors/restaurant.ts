import { getConfig, setMusic, wait, writeConfig } from "../helpers/control";
import { randomBetween } from "../helpers/math";
import { fetchJson } from "../helpers/reader";
import { toggleContent } from "../main";
import Floor from "../types/floor";
import { LazyLoader } from "../types/misc";

enum FaceComponent {
	EYES_NORMAL_OPEN = 1,
	EYES_NORMAL_CLOSE = 1 << 1,
	EYES_HALF_OPEN = 1 << 2,
	EYES_HALF_CLOSE = 1 << 3,
	MOUTH_SMILE_CLOSE = 1 << 4,
	MOUTH_SAD_CLOSE = 1 << 5,
	MOUTH_SMILE_OPEN = 1 << 6,
	MOUTH_SAD_OPEN = 1 << 7,
	FACE_BLUSH = 1 << 8,
	BROWS_ANGRY = 1 << 9,
	BROWS_WORRIED = 1 << 10,
	HEAD_LOWERED = 1 << 11,
	HANDS_TABLE = 1 << 12,
	HANDS_HEAD = 1 << 13,
	HANDS_FACE = 1 << 14,
	EYES_DOWN = 1 << 15,
	EYES_LEFT = 1 << 17,
	EYES_RIGHT = 1 << 18,
	FACE_TEARS = 1 << 19
};

type SummatiaData = {
	[key: string]: {
		message: string;
		emotion: string | number;
		responses?: { message: string, next: string }[];
		next?: string;
	}
} & { emotions: { [key: string]: number } }

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
	summatiaData: LazyLoader<SummatiaData>;

	constructor() {
		super("restaurant", 4);
		this.disableContent = true;
		this.emotion = 17;
		this.resets = 0;
		this.setupJazz();
		this.summatiaData = new LazyLoader(() => fetchJson("/data/summatia.json"));
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

		svg.querySelector<SVGGElement>("#eye")!.style.display = this.emotion & (FaceComponent.EYES_NORMAL_OPEN | FaceComponent.EYES_NORMAL_CLOSE) ? "inline" : "none";
		svg.querySelector<SVGGElement>("#eye-half")!.style.display = this.emotion & (FaceComponent.EYES_HALF_OPEN | FaceComponent.EYES_HALF_CLOSE) ? "inline" : "none";
		svg.querySelectorAll<SVGGElement>(".eye-open").forEach(item => item.style.display = this.emotion & (FaceComponent.EYES_NORMAL_OPEN | FaceComponent.EYES_HALF_OPEN) ? "inline" : "none");
		svg.querySelectorAll<SVGGElement>(".eye-close").forEach(item => item.style.display = this.emotion & (FaceComponent.EYES_NORMAL_CLOSE | FaceComponent.EYES_HALF_CLOSE) ? "inline" : "none");

		svg.querySelector<SVGPathElement>("#mouth-smile")!.style.display = this.emotion & FaceComponent.MOUTH_SMILE_CLOSE ? "inline" : "none";
		svg.querySelector<SVGPathElement>("#mouth-sad")!.style.display = this.emotion & FaceComponent.MOUTH_SAD_CLOSE ? "inline" : "none";
		svg.querySelector<SVGGElement>("#mouth-laugh")!.style.display = this.emotion & FaceComponent.MOUTH_SMILE_OPEN ? "inline" : "none";
		svg.querySelector<SVGGElement>("#mouth-mad")!.style.display = this.emotion & FaceComponent.MOUTH_SAD_OPEN ? "inline" : "none";

		svg.querySelector<SVGGElement>("#blush")!.style.opacity = this.emotion & FaceComponent.FACE_BLUSH ? "1" : "0";

		if (this.emotion & (FaceComponent.BROWS_ANGRY | FaceComponent.BROWS_WORRIED)) {
			svg.querySelector<SVGPathElement>(".left-brow")!.style.transform = `rotate(${this.emotion & FaceComponent.BROWS_ANGRY ? "-10" : "20"}deg)`;
			svg.querySelector<SVGPathElement>(".right-brow")!.style.transform = `rotate(${this.emotion & FaceComponent.BROWS_ANGRY ? "10" : "-20"}deg)`;
		} else
			svg.querySelectorAll<SVGPathElement>(".brow").forEach(item => item.style.transform = "");

		svg.querySelectorAll<SVGElement>(".summatia-head").forEach(item => item.style.transform = `translateY(${this.emotion & FaceComponent.HEAD_LOWERED ? "5" : "0"}px)`);

		svg.querySelector<SVGGElement>("#hands-table")!.style.display = this.emotion & FaceComponent.HANDS_TABLE ? "inline" : "none";
		svg.querySelector<SVGGElement>("#hands-hold")!.style.display = this.emotion & FaceComponent.HANDS_HEAD ? "inline" : "none";
		svg.querySelector<SVGGElement>("#hands-face")!.style.display = this.emotion & FaceComponent.HANDS_FACE ? "inline" : "none";

		if (this.emotion & FaceComponent.EYES_DOWN)
			svg.querySelectorAll<SVGPathElement>(".pupil").forEach(item => item.style.transform = "translateY(18px)");
		else if (this.emotion & FaceComponent.EYES_LEFT) {
			svg.querySelectorAll<SVGPathElement>(".left-pupil").forEach(item => item.style.transform = "translate(-14px, 9px)");
			svg.querySelectorAll<SVGPathElement>(".right-pupil").forEach(item => item.style.transform = "translate(-24px, 9px)");
		} else if (this.emotion & FaceComponent.EYES_RIGHT) {
			svg.querySelectorAll<SVGPathElement>(".left-pupil").forEach(item => item.style.transform = "translate(20px, 9px)");
			svg.querySelectorAll<SVGPathElement>(".right-pupil").forEach(item => item.style.transform = "translate(13px, 9px)");
		} else
			svg.querySelectorAll<SVGPathElement>(".pupil").forEach(item => item.style.transform = "");

		svg.querySelectorAll<SVGGElement>(".tears").forEach(item => item.style.opacity = this.emotion & FaceComponent.FACE_TEARS ? "1" : "0");
	}

	private async next(key: string) {
		const summatiaData = await this.summatiaData.get();
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
		let skipped = false;
		const skipClick = new Promise<boolean>((res) => window.addEventListener("click", () => res(skipped = true), { once: true }));
		for (const char of data.message) {
			if (skipped) {
				message = data.message;
				say.innerHTML = message;
				break;
			}
			message += char;
			say.innerHTML = message;
			await wait(50);
			if ("!,.:;?".includes(char)) await wait(500);
			if (pid != this.resets) return;
		}
		if (data.next) {
			let waitForClick: Promise<any>;
			if (skipped) waitForClick = new Promise<void>((res) => window.addEventListener("click", () => res(), { once: true }));
			else waitForClick = skipClick;
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
		else this.next(this.validKeyOrElse(getConfig().summatia, "first"));
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

	private validKeyOrElse(key: string, fallback: string) {
		const summatiaData = this.summatiaData.got();
		return summatiaData && Object.keys(summatiaData).includes(key) ? key : fallback;
	}
}
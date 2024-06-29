import { randomBetween } from "../helpers/math";
import { readPage } from "../helpers/reader";
import Floor from "../types/floor";
import { LazyLoader } from "../types/misc";

const SVG_NS = "http://www.w3.org/2000/svg";

const FIRE_COLOR = [
	"#ffc003",
	"#ff5500",
	"#ff5917"
];

class FireParticle {
	svg: SVGGElement;
	node: SVGEllipseElement;
	x: number;
	rot: number;
	finished = false;

	constructor(svg: SVGGElement) {
		this.svg = svg;
		this.node = document.createElementNS(SVG_NS, "ellipse");
		this.node.setAttribute("cx", "970");
		this.node.setAttribute("cy", "670");
		const radius = "" + randomBetween(10, 20);
		this.node.setAttribute("rx", radius);
		this.node.setAttribute("ry", radius);
		this.node.setAttribute("fill", FIRE_COLOR[Math.floor(Math.random() * FIRE_COLOR.length)]);
		this.node.classList.add("fire");
		this.x = Math.round(Math.random() * 100);
		this.rot = Math.floor(Math.random() * 360);
	}

	start() {
		this.svg.append(this.node);
		const angle = randomBetween(0.1, Math.PI - 0.1, false);
		setTimeout(() => {
			this.node.style.transform = `translate(${15 * Math.cos(angle)}vw, ${-15 * Math.sin(angle)}vh)`;
			this.node.style.opacity = "0";
			setTimeout(() => {
				this.node.remove();
				this.finished = true;
			}, 2000);
		}, 100);
	}
}

export default class NotFoundFloor extends Floor {
	fires: FireParticle[] = [];
	spawnTimer?: NodeJS.Timer;

	constructor() {
		super("not-found", 404, { content: new LazyLoader(() => readPage(`/contents/2d/${this.num}-${this.id}.html`)) });
	}

	loadSvg(background: HTMLDivElement) {
		const svg = background.querySelector<SVGGElement>("svg g#fires")!;
		this.spawnTimer = setInterval(() => {
			this.fires = this.fires.filter(r => !r.finished);
			const drop = new FireParticle(svg);
			drop.start();
			this.fires.push(drop);
		}, 250);
	}
}
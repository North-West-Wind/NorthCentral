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

let summatiaData;

fetch("/data/summatia.json").then(async res => {
	if (res.ok) summatiaData = await res.json();
});

export default class RestaurantFloor extends Floor {
	constructor() {
		super("restaurant", 4);
		this.disableContent = true;
	}
}
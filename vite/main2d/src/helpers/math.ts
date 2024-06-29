import { FLOORS, STATUS_FLOORS } from "../constants";

export function realOrNotFoundFloor(index: number) {
	if (index < 0 || index >= FLOORS.size) return STATUS_FLOORS.get("not-found")!;
	else return Array.from(FLOORS.values())[index];
}

export function clamp(val: number, min: number, max: number) {
	return Math.min(Math.max(val, min), max);
}

export function randomBetween(min: number, max: number, int = true) {
	if (int) return Math.round(Math.random() * (max - min)) + min;
	return Math.random() * (max - min) + min;
}
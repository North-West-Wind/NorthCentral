export function clamp(val: number, min: number, max: number) {
	return Math.min(Math.max(val, min), max);
}

export function randomBetween(min: number, max: number, int = true) {
	if (int) return Math.round(Math.random() * (max - min)) + min;
	return Math.random() * (max - min) + min;
}
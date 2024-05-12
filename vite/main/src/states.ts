import { Camera } from "three";
import Floor from "./types/floor";

const internal: { floor?: Floor, currentFloor: number, targetFloor: number, started: boolean, camera?: Camera, rotatedX: number, rotatedY: number, ratio: number, touched: boolean } = {
	currentFloor: 0,
	targetFloor: 0,
	started: false,
	rotatedX: 0,
	rotatedY: 0,
	ratio: window.innerWidth / window.innerHeight,
	touched: false,
};

export function ratio(r?: number) {
	if (r !== undefined) internal.ratio = r;
	return internal.ratio;
}

export function currentFloor(f?: number) {
	if (f !== undefined) internal.currentFloor = f;
	return internal.currentFloor;
}

export function targetFloor(f?: number) {
	if (f !== undefined) internal.targetFloor = f;
	return internal.targetFloor;
}

export function camera(c?: Camera) {
	if (c) internal.camera = c;
	return internal.camera!;
}

export function touched(t?: boolean) {
	if (t !== undefined) internal.touched = t;
	return internal.touched;
}

export function rotatedX(r?: number) {
	if (r !== undefined) internal.rotatedX = r;
	return internal.rotatedX;
}

export function rotatedY(r?: number) {
	if (r !== undefined) internal.rotatedY = r;
	return internal.rotatedY;
}

export function floor(f?: Floor) {
	if (f) internal.floor = f;
	return internal.floor;
}

export function started(s?: boolean) {
	if (s !== undefined) internal.started = s;
	return internal.started;
}
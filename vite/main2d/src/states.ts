import { FLOORS } from "./constants";
import Floor from "./types/floor";

const internal = {
	started: false,
	floor: FLOORS.get("ground")!
};
export function started(b?: boolean) {
	if (b !== undefined) {
		internal.started = b;
	}
	return internal.started;
}
export function floor(f?: Floor) {
	if (f !== undefined) {
		internal.floor = f;
	}
	return internal.floor;
}
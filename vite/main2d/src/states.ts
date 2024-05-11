import { FLOORS } from "./constants";
import Floor from "./types/floor";

const internal = {
	floor: FLOORS.get("ground")!
};
export function floor(f?: Floor) {
	if (f !== undefined) {
		internal.floor = f;
	}
	return internal.floor;
}
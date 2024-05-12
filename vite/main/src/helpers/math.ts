import { FLOORS, STATUS_FLOORS } from "../constants";

export function realOrNotFoundFloor(index: number) {
	if (index < 0 || index >= FLOORS.size) return STATUS_FLOORS.get(404)!;
	else return Array.from(FLOORS.values())[index];
}
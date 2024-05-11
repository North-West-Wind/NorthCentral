import AutoFishFloor from "./floors/auto_fish";
import GroundFloor from "./floors/ground";
import MoreBootsFloor from "./floors/more_boots";
import SkyFarmFloor from "./floors/sky_farm";
import Floor from "./types/floor";

// floor objects
export const FLOORS = new Map<string, Floor>();

function addFloor(floor: Floor) {
	FLOORS.set(floor.id, floor);
}

addFloor(new GroundFloor());
addFloor(new AutoFishFloor());
addFloor(new MoreBootsFloor());
addFloor(new SkyFarmFloor());
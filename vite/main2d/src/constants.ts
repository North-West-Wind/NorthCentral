import InfoCenterFloor from "./floors/info_center";
import GalleryFloor from "./floors/gallery";
import GroundFloor from "./floors/ground";
import MoreBootsFloor from "./floors/mods";
import N0rthWestW1ndFloor from "./floors/n0rthwestw1nd";
import SheetMusicFloor from "./floors/sheet_music";
import SkyFarmFloor from "./floors/sky_farm";
import Floor from "./types/floor";

// floor objects
export const FLOORS = new Map<string, Floor>();

function addFloor(floor: Floor) {
	FLOORS.set(floor.id, floor);
}

addFloor(new GroundFloor());
addFloor(new InfoCenterFloor());
addFloor(new MoreBootsFloor());
addFloor(new SkyFarmFloor());
addFloor(new N0rthWestW1ndFloor());
addFloor(new SheetMusicFloor());
addFloor(new GalleryFloor());
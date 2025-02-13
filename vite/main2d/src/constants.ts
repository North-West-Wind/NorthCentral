import InfoCenterFloor from "./floors/info_center";
import GalleryFloor from "./floors/gallery";
import GroundFloor from "./floors/ground";
import MoreBootsFloor from "./floors/mods";
import RestaurantFloor from "./floors/restaurant";
import SheetMusicFloor from "./floors/sheet_music";
import SkyFarmFloor from "./floors/sky_farm";
import Floor from "./types/floor";
import NotFoundFloor from "./floors/not-found";

// floor objects
export const FLOORS = new Map<string, Floor>();
export const STATUS_FLOORS = new Map<string, Floor>();

function addFloor(floor: Floor, map?: Map<string, Floor>) {
	(map || FLOORS).set(floor.id, floor);
}

addFloor(new GroundFloor());
addFloor(new InfoCenterFloor());
addFloor(new MoreBootsFloor());
addFloor(new SkyFarmFloor());
addFloor(new RestaurantFloor());
addFloor(new SheetMusicFloor());
addFloor(new GalleryFloor());

addFloor(new NotFoundFloor(), STATUS_FLOORS);
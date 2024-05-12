import AutoFishFloor from "./floors/auto_fish";
import GalleryFloor from "./floors/gallery";
import GroundFloor from "./floors/ground";
import MoreBootsFloor from "./floors/more_boots";
import N0rthWestW1ndFloor from "./floors/n0rthwestw1nd";
import NotFoundFloor from "./floors/not_found";
import SheetMusicFloor from "./floors/sheet_music";
import SkyFarmFloor from "./floors/sky_farm";
import { readPageGenerator } from "./helpers/reader";
import Floor from "./types/floor";

export const CONTENTS: (() => Promise<string> | string)[] = [];

readPageGenerator("/contents/information.html", CONTENTS);

export const FLOORS = new Map<string, Floor>();
export const STATUS_FLOORS = new Map<number, Floor>();

function addFloor(floor: Floor) {
	FLOORS.set(floor.id, floor);
}
function addStatusFloor(floor: Floor) {
	STATUS_FLOORS.set(floor.num, floor);
}

addFloor(new GroundFloor());
addFloor(new AutoFishFloor());
addFloor(new MoreBootsFloor());
addFloor(new SkyFarmFloor());
addFloor(new N0rthWestW1ndFloor());
addFloor(new SheetMusicFloor());
addFloor(new GalleryFloor());

addStatusFloor(new NotFoundFloor());

var skipFirst = true;
for (const page of FLOORS.keys()) {
	if (skipFirst) {
		skipFirst = false;
		continue;
	}
	readPageGenerator(`/contents/${page}.html`, CONTENTS);
}
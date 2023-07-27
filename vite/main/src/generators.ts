import * as THREE from "three";
import { GLTF_LOADED, LOADER } from "./loaders";
import { PARTICLE_DISTANCE, SHEETS } from "./constants";
import { getCamera, getCurrentFloor, getPassedInFloor, getRenderer } from "./states";

export function makeLift(scene: THREE.Scene) {
	const { rectL, rectR, rectT, rectB, doorL, doorR } = makeDoors(scene);
	const { floor } = makeFloor(scene);
	const { wallFL, wallFR, wallFT, wallL, wallR, ceiling } = makeWalls(scene);
	const { base, buttonU, buttonD, display } = makeButtons(scene);
	const { sign } = makeSign(scene);
	const obj = { rectL, rectR, rectT, rectB, doorL, doorR, floor, wallFL, wallFR, wallFT, wallL, wallR, ceiling, base, buttonU, buttonD, display, sign };
	const passedInFloor = getPassedInFloor();
	if (passedInFloor > 0) {
			Object.values(obj).forEach(mesh => mesh.position.y += 1000 * passedInFloor);
	}
	return obj;
}

function makeDoors(scene: THREE.Scene) {
	const geometryS = new THREE.BoxGeometry(5, 50, 5);
	const material = new THREE.MeshStandardMaterial({ color: 0x777777 });
	const rectL = new THREE.Mesh(geometryS, material);
	const rectR = new THREE.Mesh(geometryS, material);
	rectL.position.set(-25, -5, -50);
	rectR.position.set(25, -5, -50);
	scene.add(rectL, rectR);

	const geometryT = new THREE.BoxGeometry(55, 5, 5);
	const rectT = new THREE.Mesh(geometryT, material);
	const rectB = new THREE.Mesh(geometryT, material);
	rectT.position.set(0, 22.5, -50);
	rectB.position.set(0, -32.49, -50);
	scene.add(rectT, rectB);

	const geometry = new THREE.BoxGeometry(25, 50, 2);
	const materialD = new THREE.MeshStandardMaterial({ color: 0xcccccc });
	const doorL = new THREE.Mesh(geometry, materialD);
	const doorR = new THREE.Mesh(geometry, materialD);
	doorL.position.set(-12.5, -5, -50);
	doorR.position.set(12.5, -5, -50);
	scene.add(doorL, doorR);
	return { rectL, rectR, rectT, rectB, doorL, doorR };
}

function makeFloor(scene: THREE.Scene) {
	const geometry = new THREE.BoxGeometry(80, 2, 100);
	const material = new THREE.MeshStandardMaterial({ color: 0x98f5a8 });
	const floor = new THREE.Mesh(geometry, material);
	floor.position.set(0, -31, 0);
	scene.add(floor);
	return { floor };
}

function makeWalls(scene: THREE.Scene) {
	const geometryF = new THREE.BoxGeometry(12.5, 80, 3);
	const material = new THREE.MeshStandardMaterial({ color: 0xfef0bc });
	const wallFL = new THREE.Mesh(geometryF, material);
	const wallFR = new THREE.Mesh(geometryF, material);
	wallFL.position.set(-33.5, -5, -50);
	wallFR.position.set(33.5, -5, -50);
	scene.add(wallFL, wallFR);

	const geometryFT = new THREE.BoxGeometry(55, 10, 3);
	const wallFT = new THREE.Mesh(geometryFT, material);
	wallFT.position.set(0, 30, -50);
	scene.add(wallFT);

	const geometryS = new THREE.BoxGeometry(3, 80, 100);
	const wallL = new THREE.Mesh(geometryS, material);
	const wallR = new THREE.Mesh(geometryS, material);
	wallL.position.set(-40, -5, 0);
	wallR.position.set(40, -5, 0);
	scene.add(wallL, wallR);

	const geometryC = new THREE.BoxGeometry(80, 2, 100);
	const ceiling = new THREE.Mesh(geometryC, material);
	ceiling.position.set(0, 36, 0);
	scene.add(ceiling);
	return { wallFL, wallFR, wallFT, wallL, wallR, ceiling };
}

function makeButtons(scene: THREE.Scene) {
	const geometryB = new THREE.BoxGeometry(5, 10, 0.5);
	const materialB = new THREE.MeshStandardMaterial({ color: 0xb4eafe });
	const base = new THREE.Mesh(geometryB, materialB);
	base.position.set(33.5, -5, -48.25);
	scene.add(base);

	const A = new THREE.Vector2(-1.5, -1);
	const B = new THREE.Vector2(1.5, -1);
	const C = new THREE.Vector2(0, 1);

	const height = 1;
	const vertices = [A, B, C];
	var Shape = new THREE.Shape();
	(function f(ctx) {
		ctx.moveTo(vertices[0].x, vertices[0].y);
		for (var i = 1; i < vertices.length; i++) {
			ctx.lineTo(vertices[i].x, vertices[i].y);
		}
		ctx.lineTo(vertices[0].x, vertices[0].y);
	})(Shape);
	var settings: THREE.ExtrudeGeometryOptions = {};
	settings.depth = height;
	settings.bevelEnabled = false;
	const geometry = new THREE.ExtrudeGeometry(Shape, settings);
	const materialU = new THREE.MeshStandardMaterial({ color: 0xbbbbbb });
	const materialD = new THREE.MeshStandardMaterial({ color: 0xbbbbbb });
	const buttonU = new THREE.Mesh(geometry, materialU);
	const buttonD = new THREE.Mesh(geometry, materialD);
	buttonU.position.set(33.5, -2.5, -48.25);
	buttonD.position.set(33.5, -7.5, -48.25);
	buttonD.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);
	scene.add(buttonU, buttonD);

	const geometryD = new THREE.BoxGeometry(5, 5, 0.5);
	const xm = new THREE.MeshStandardMaterial({ map: displayTexture(0), transparent: true });
	const material = new THREE.MeshStandardMaterial({ color: 0x555555 });
	const materials = [
			material,
			material,
			material,
			material,
			xm,
			material
	];
	const display = new THREE.Mesh(geometryD, materials);
	display.position.set(33.5, 5, -48.25);
	scene.add(display);
	return { base, buttonU, buttonD, display };
}

function makeSign(scene: THREE.Scene) {
	var x = document.createElement("canvas");
	var xc = x.getContext("2d")!;
	x.width = 360;
	x.height = 600;
	const posX = x.width / 6;
	const posY = x.height / 12;
	xc.fillStyle = "#eeeeee";
	xc.fillRect(0, 0, x.width, x.height);
	xc.fillStyle = "#cccccc";
	for (let i = 1; i < 11; i++) xc.fillRect(posX, posY * i + 10, Math.round(Math.random() * 180) + 60, 30);

	const geometry = new THREE.BoxGeometry(2, 25, 15);
	var xm = new THREE.MeshStandardMaterial({ map: new THREE.Texture(x), transparent: true });
	xm.map!.needsUpdate = true;
	const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
	const materials = [
			material,
			xm,
			material,
			material,
			material,
			material
	];
	const sign = new THREE.Mesh(geometry, materials);
	sign.position.set(39, 0, -30);
	scene.add(sign);
	return { sign };
}

export async function makeOutside(scene: THREE.Scene) {
	const { floor } = makeGroundFloor(scene);
	const { ocean, oakFloor, fishingRod, string, holder } = makeAutoFishFloor(scene);
	const { corridor, platform, bootL, bootR } = makeMoreBootsFloor(scene);
	const { skyT, skyB, skyL, skyR, skyF, block, logs, leaves0, leaves1, leaves2, leaves3 } = makeSkyFarmFloor(scene);
	const { paper0, paper1, paper2 } = makeN0rthWestW1ndFloor(scene);
	const { floor0, sheets } = await makeSheetMusicFloor(scene);
	return { floor, ocean, oakFloor, fishingRod, string, holder, corridor, platform, bootL, bootR, skyT, skyB, skyL, skyR, skyF, block, logs, leaves0, leaves1, leaves2, leaves3, paper0, paper1, paper2, floor0, sheets };
}

export const floorGenerators = [
	makeGroundFloor,
	makeAutoFishFloor,
	makeMoreBootsFloor,
	makeSkyFarmFloor,
	makeN0rthWestW1ndFloor,
	makeSheetMusicFloor
];

export function createRain(scene: THREE.Scene, amount: number) {
	const rains = [];
	const geometryR = new THREE.SphereGeometry(0.25);
	const materialR = new THREE.MeshStandardMaterial({ color: 0x42a6e9 });
	for (let i = 0; i < amount; i++) {
			const rain = new THREE.Mesh(geometryR, materialR);
			rain.position.set(THREE.MathUtils.randFloatSpread(100), 100, -THREE.MathUtils.randFloatSpread(500) - 305);
			rains.push(rain);
			scene.add(rain);
	}
	return rains;
}

export function createParticle(scene: THREE.Scene, amount: number) {
	const particles = [];
	const geometryP = new THREE.SphereGeometry(0.25);
	const materialP = new THREE.MeshBasicMaterial({ color: 0x00ffff });
	for (let i = 0; i < amount; i++) {
			const particle = new THREE.Mesh(geometryP, materialP);
			const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);
			particle.position.set(Math.sin(angle) * PARTICLE_DISTANCE, getCurrentFloor() * 1000 + Math.cos(angle) * PARTICLE_DISTANCE, -151);
			particles.push({ particle, angle, distance: PARTICLE_DISTANCE });
			scene.add(particle);
	}
	return particles;
}

export function displayTexture(floor: string | number | null) {
	var x = document.createElement("canvas");
	var xc = x.getContext("2d")!;
	x.width = x.height = 400;
	xc.fillStyle = "#555555";
	xc.fillRect(0, 0, x.width, x.height);
	xc.fillStyle = "black";
	xc.fillRect(20, 20, x.width - 40, x.height - 40);
	xc.fillStyle = "red";
	xc.font = "256px 'Courier New'";
	xc.textAlign = "center";
	xc.textBaseline = "middle";
	if (floor !== 0 && !floor) xc.fillText("?", x.width / 2, x.height / 2);
	else if (typeof floor == "string") xc.fillText(floor, x.width / 2, x.height / 2);
	else xc.fillText(floor <= 0 ? "G" : floor.toString(), x.width / 2, x.height / 2);
	const texture = new THREE.Texture(x);
	texture.generateMipmaps = false;
	texture.minFilter = THREE.LinearFilter;
	texture.needsUpdate = true;
	return texture;
}

async function sheetTexture(index: number) {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d")!;
	canvas.width = 3508;
	canvas.height = 2480;
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	const img = new Image();
	return new Promise<THREE.Texture>(resolve => {
			img.onload = () => {
					ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
					const texture = new THREE.Texture(canvas);
					texture.generateMipmaps = false;
					texture.minFilter = THREE.LinearFilter;
					texture.needsUpdate = true;
					resolve(texture);
			}
			img.src = `/assets/sheets/sheet-${index}.svg`;
	});
}

function makeGroundFloor(scene: THREE.Scene) {
	const geometry = new THREE.BoxGeometry(55, 2, 500);
	const material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
	const floor = new THREE.Mesh(geometry, material);
	floor.position.set(0, -31, -300);
	scene.add(floor);
	return { floor };
}

const WATER_TEXTURES: THREE.Texture[] = [];
function makeAutoFishFloor(scene: THREE.Scene) {
	for (let i = 0; i < 32; i++) {
			const water = LOADER.load(`/assets/textures/water/water_still-00-${(i < 10 ? "0" : "") + i}.png`, texture => {
					texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
					texture.offset.set(0, 0);
					texture.repeat.set(100, 100);
					texture.magFilter = THREE.NearestFilter;
					texture.minFilter = THREE.LinearMipMapLinearFilter;
			});
			WATER_TEXTURES.push(water);
	}

	const geometryW = new THREE.BoxGeometry(1000, 10, 1000);
	const materialW = new THREE.MeshBasicMaterial({ map: WATER_TEXTURES[0], opacity: 0.4, transparent: true });
	materialW.map!.needsUpdate = true;
	const ocean = new THREE.Mesh(geometryW, materialW);
	ocean.position.set(0, 946.5, -550);
	scene.add(ocean);

	const geometryF = new THREE.BoxGeometry(128, 16, 80);
	const oakF = LOADER.load("/assets/textures/oak_planks.png", texture => {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			texture.offset.set(0, 0);
			texture.repeat.set(8, 5);
			texture.magFilter = THREE.NearestFilter;
			texture.minFilter = THREE.LinearMipMapLinearFilter;
	});
	const materialF = new THREE.MeshStandardMaterial({ map: oakF });
	const oakFloor = new THREE.Mesh(geometryF, materialF);
	oakFloor.position.set(0, 959.5, -90);
	scene.add(oakFloor);

	const geometryR = new THREE.BoxGeometry(3, 80, 3);
	const materialR = new THREE.MeshStandardMaterial({ color: 0xad7726 });
	const fishingRod = new THREE.Mesh(geometryR, materialR);
	fishingRod.position.set(56, 991.5, -122);
	fishingRod.setRotationFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI / 6);
	scene.add(fishingRod);

	const geometryS = new THREE.BoxGeometry(1, 80, 1);
	const materialS = new THREE.MeshStandardMaterial({ color: 0xffffff });
	const string = new THREE.Mesh(geometryS, materialS);
	string.position.set(56, 984, -140);
	scene.add(string);

	const geometryH = new THREE.BoxGeometry(8, 16, 8);
	const materialH = new THREE.MeshStandardMaterial({ color: 0x7d4700 });
	const holder = new THREE.Mesh(geometryH, materialH);
	holder.position.set(56, 975.5, -118);
	scene.add(holder);

	var oceanCounter = 0;
	setInterval(() => {
			if (!ocean) return;
			oceanCounter = ++oceanCounter % 32;
			const materialW = new THREE.MeshBasicMaterial({ map: WATER_TEXTURES[oceanCounter], opacity: 0.4, transparent: true });
			materialW.map!.needsUpdate = true;
			ocean.material = materialW;
			getRenderer().render(scene, getCamera());
	}, 250);
	return { ocean, oakFloor, fishingRod, string, holder };
}

function makeMoreBootsFloor(scene: THREE.Scene) {
	const armorStand = GLTF_LOADED.armor_stand;
	armorStand.position.set(0, 1969.5, -156.5);
	armorStand.scale.set(20, 20, 20);
	scene.add(armorStand);

	const geometryC = new THREE.BoxGeometry(16, 16, 80);
	const material = new THREE.MeshBasicMaterial({ color: 0xa0a6a7 });
	const corridor = new THREE.Mesh(geometryC, material);
	corridor.position.set(0, 1961.5, -92.5);
	scene.add(corridor);

	const geometryP = new THREE.BoxGeometry(48, 16, 48);
	const platform = new THREE.Mesh(geometryP, material);
	platform.position.set(0, 1961.5, -156.5);
	scene.add(platform);

	const geometryB = new THREE.BoxGeometry(5, 7.5, 5);
	const materials = [
			new THREE.MeshBasicMaterial({ map: LOADER.load("/assets/textures/diamond_boots/side_0.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
			new THREE.MeshBasicMaterial({ map: LOADER.load("/assets/textures/diamond_boots/side_1.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
			new THREE.MeshBasicMaterial({ map: LOADER.load("/assets/textures/diamond_boots/bottom.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
			new THREE.MeshBasicMaterial({ map: LOADER.load("/assets/textures/diamond_boots/side_2.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
			new THREE.MeshBasicMaterial({ map: LOADER.load("/assets/textures/diamond_boots/side_3.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
			new THREE.MeshBasicMaterial({ map: LOADER.load("/assets/textures/diamond_boots/bottom.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
	];
	const bootL = new THREE.Mesh(geometryB, materials);
	const bootR = new THREE.Mesh(geometryB, materials);
	bootL.position.set(-2.5, 1974, -156.5);
	bootR.position.set(2.5, 1974, -156.5);
	scene.add(bootL, bootR);

	return { corridor, platform, bootL, bootR };
}

function makeSkyFarmFloor(scene: THREE.Scene) {
	const geometryS = new THREE.BoxGeometry(250, 2, 250);
	const material = new THREE.MeshBasicMaterial({ color: 0x8da0ff });
	const skyT = new THREE.Mesh(geometryS, material);
	const skyB = new THREE.Mesh(geometryS, material);
	skyT.position.set(0, 3125, -175);
	skyB.position.set(0, 2875, -175);

	const geometryW = new THREE.BoxGeometry(2, 250, 250);
	const skyL = new THREE.Mesh(geometryW, material);
	const skyR = new THREE.Mesh(geometryW, material);
	skyL.position.set(-126, 3000, -175);
	skyR.position.set(126, 3000, -175);

	const geometryF = new THREE.BoxGeometry(250, 250, 2);
	const skyF = new THREE.Mesh(geometryF, material);
	skyF.position.set(0, 3000, -301);
	scene.add(skyT, skyB, skyL, skyR, skyF);

	const geometryB = new THREE.BoxGeometry(24, 8, 24);
	const matSide = new THREE.MeshBasicMaterial({ color: 0x888888, map: LOADER.load("/assets/textures/grass/side.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(3, 1); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) });
	const materials = [
			matSide,
			matSide,
			new THREE.MeshBasicMaterial({ color: 0x888888, map: LOADER.load("/assets/textures/grass/top.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(3, 3); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
			matSide,
			matSide,
			new THREE.MeshBasicMaterial({ color: 0x888888, map: LOADER.load("/assets/textures/grass/bottom.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(3, 3); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
	];
	const block = new THREE.Mesh(geometryB, materials);
	block.position.set(0, 2970, -175);
	scene.add(block);

	const geometryL = new THREE.BoxGeometry(8, 40, 8);
	const matSideL = new THREE.MeshBasicMaterial({ color: 0x888888, map: LOADER.load("/assets/textures/tree/side.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(1, 5); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) });
	const materialsL = [
			matSideL,
			matSideL,
			new THREE.MeshBasicMaterial({ color: 0x888888, map: LOADER.load("/assets/textures/tree/top.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) }),
			matSideL,
			matSideL,
			new THREE.MeshBasicMaterial({ color: 0x888888, map: LOADER.load("/assets/textures/tree/top.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) })
	];
	const logs = new THREE.Mesh(geometryL, materialsL);
	logs.position.set(0, 2994, -175);
	scene.add(logs);

	const geometryL0 = new THREE.BoxGeometry(40, 16, 40);
	const matSideL0 = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, map: LOADER.load("/assets/textures/tree/leaves.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(5, 2); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) });
	const matTopL0 = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, map: LOADER.load("/assets/textures/tree/leaves.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(5, 5); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) });
	const leaves0 = new THREE.Mesh(geometryL0, [matSideL0, matSideL0, matTopL0, matSideL0, matSideL0, matTopL0]);
	leaves0.position.set(0, 2998, -175);

	const geometryL1 = new THREE.BoxGeometry(24, 8, 24);
	const matSideL1 = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, map: LOADER.load("/assets/textures/tree/leaves.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(3, 1); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) });
	const matTopL1 = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, map: LOADER.load("/assets/textures/tree/leaves.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(3, 3); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) });
	const leaves1 = new THREE.Mesh(geometryL1, [matSideL1, matSideL1, matTopL1, matSideL1, matSideL1, matTopL1]);
	leaves1.position.set(0, 3010, -175);

	const geometryL2 = new THREE.BoxGeometry(24, 8, 8);
	const matSideL2 = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, map: LOADER.load("/assets/textures/tree/leaves.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(3, 1); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) });
	const matTopL2 = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, map: LOADER.load("/assets/textures/tree/leaves.png", tex => { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) });
	const leaves2 = new THREE.Mesh(geometryL2, [matTopL2, matSideL2, matSideL2, matTopL2, matSideL2, matSideL2]);
	leaves2.position.set(0, 3018, -175);

	const geometryL3 = new THREE.BoxGeometry(8, 8, 24);
	const matSideL3 = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, map: LOADER.load("/assets/textures/tree/leaves.png", tex => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.offset.set(0, 0); tex.repeat.set(1, 3); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipMapLinearFilter; }) });
	const leaves3 = new THREE.Mesh(geometryL3, [matSideL2, matTopL2, matSideL3, matSideL2, matTopL2, matSideL3]);
	leaves3.position.set(0, 3018, -175);
	scene.add(leaves0, leaves1, leaves2, leaves3);
	return { skyT, skyB, skyL, skyR, skyF, block, logs, leaves0, leaves1, leaves2, leaves3 };
}

function makeN0rthWestW1ndFloor(scene: THREE.Scene) {
	const desk = GLTF_LOADED.desk;
	desk.position.set(-0.25, 3993.5, -150);
	desk.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
	desk.scale.set(2, 2, 2);
	scene.add(desk);

	const geometry = new THREE.BoxGeometry(0.5, 0.1, 0.75);
	const material = new THREE.MeshStandardMaterial({ color: 0x777777 });
	const paper0 = new THREE.Mesh(geometry, material);
	const paper1 = new THREE.Mesh(geometry, material);
	const paper2 = new THREE.Mesh(geometry, material);
	paper0.position.set(4, 3998.2, -150);
	paper0.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 6);
	paper1.position.set(2.5, 3998.2, -148.5);
	paper1.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 3);
	paper2.position.set(4.2, 3998.2, -148.75);
	paper2.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 4);
	scene.add(paper0, paper1, paper2);

	const pointLight = new THREE.PointLight(0xfff8be, 1, 50, 2);
	pointLight.position.set(3.5, 4001, -148.725);
	scene.add(pointLight);
	return { paper0, paper1, paper2 };
}

async function makeSheetMusicFloor(scene: THREE.Scene) {
	const piano = GLTF_LOADED.piano;
	piano.position.set(0, 4956, -215);
	piano.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 6 - Math.random() * Math.PI *2/3);
	piano.scale.set(15, 15, 15);
	scene.add(piano);

	const geometry = new THREE.BoxGeometry(500, 2, 500);
	const material = new THREE.MeshStandardMaterial({ color: 0x733410 });
	const floor0 = new THREE.Mesh(geometry, material);
	floor0.position.set(0, 4965, -200);
	scene.add(floor0);

	const geometryS = new THREE.BoxGeometry(5, 0.1, 5 * Math.SQRT2);
	const materialS = new THREE.MeshStandardMaterial({ color: 0x777777 });
	const sheets = [];
	for (let i = 0; i < SHEETS; i++) {
			const xm = new THREE.MeshStandardMaterial({ map: await sheetTexture(i), transparent: true });
			const sheet = new THREE.Mesh(geometryS, [materialS, materialS, xm, materialS, materialS, materialS]);
			sheet.position.set(THREE.MathUtils.randFloatSpread(40), 4965.9875 + THREE.MathUtils.randFloatSpread(0.001), THREE.MathUtils.randFloatSpread(20) - 195);
			sheet.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.randFloatSpread(Math.PI * 2));
			sheets.push(sheet);
	}
	scene.add(...sheets);

	const spotLight = new THREE.SpotLight(0xffffff, 2, 300, Math.PI / 2, 1, 2);
	spotLight.position.set(0, 5006, -215);
	scene.add(spotLight);
	return { floor0, sheets };
}
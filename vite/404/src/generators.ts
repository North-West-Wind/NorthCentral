import * as THREE from "three";
import { GLTF_LOADED } from "./loaders";

export function makeLift(scene: THREE.Scene) {
	const { rectL, rectR, rectT, rectB, doorL, doorR } = makeDoors(scene);
	const { floor } = makeFloor(scene);
	const { wallFL, wallFR, wallFT, wallL, wallR, ceiling } = makeWalls(scene);
	const { base, buttonU, buttonD, display } = makeButtons(scene);
	const { sign } = makeSign(scene);
	return { rectL, rectR, rectT, rectB, doorL, doorR, floor, wallFL, wallFR, wallFT, wallL, wallR, ceiling, base, buttonU, buttonD, display, sign };
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

export function makeCampfire(scene: THREE.Scene) {
	const campfire = GLTF_LOADED.campfire;
	campfire.position.set(0, -50, -200);
	campfire.scale.set(3, 3, 3);
	scene.add(campfire);

	const stick = GLTF_LOADED.stick;
	stick.position.set(40, -50, -150);
	stick.setRotationFromAxisAngle(new THREE.Vector3(1, 0, -1), -Math.PI / 6);
	stick.scale.set(1.5, 1.5, 1.5);
	scene.add(stick);

	const marshmallow = GLTF_LOADED.marshmallow;
	marshmallow.position.set(11.25, -7.25, -178);
	marshmallow.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 1), Math.PI / 4);
	marshmallow.scale.set(10, 10, 10);
	scene.add(marshmallow);

	const pointLight = new THREE.PointLight(0xffda82, 1.5, 300, 2);
	pointLight.position.set(0, -40, -200)
	pointLight.castShadow = true;
	scene.add(pointLight);
}

export function makeNotice(scene: THREE.Scene) {
	const geometry = new THREE.BoxGeometry(75, 5, 2);
	const material = new THREE.MeshBasicMaterial({ color: 0 });

	const x = document.createElement("canvas");
	const xc = x.getContext("2d")!;
	x.width = 750;
	x.height = 50;
	xc.fillStyle = "white";
	xc.font = "36px 'Courier New'";
	xc.textAlign = "center";
	xc.textBaseline = "middle";
	xc.fillText("404 - Your page was not found", x.width / 2, x.height / 2);
	const xm = new THREE.MeshBasicMaterial({ map: new THREE.Texture(x), transparent: true });
	xm.map!.needsUpdate = true;

	const y = document.createElement("canvas");
	const yc = y.getContext("2d")!;
	y.width = 750;
	y.height = 50;
	yc.fillStyle = "white";
	yc.font = "36px 'Courier New'";
	yc.textAlign = "center";
	yc.textBaseline = "middle";
	yc.fillText("Here, have a marshmallow", y.width / 2, y.height / 2);
	const ym = new THREE.MeshBasicMaterial({ map: new THREE.Texture(y), transparent: true });
	ym.map!.needsUpdate = true;

	const notice0 = new THREE.Mesh(geometry, [material, material, material, material, xm, material]);
	const notice1 = new THREE.Mesh(geometry, [material, material, material, material, ym, material]);
	notice0.position.z = notice1.position.z = -100;
	notice0.position.y = 20;
	notice1.position.y = 15;
	scene.add(notice0, notice1);
	return { notice0, notice1 };
}
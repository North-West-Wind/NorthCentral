import { Camera, WebGLRenderer } from "three";
import Floor from "./types/floor";

var ratio: number;
export function getRatio() { return ratio; }
export function setRatio(r: number) { return ratio = r; }

var spawned = false;
export function getSpawned() { return spawned; }
export function setSpawned(s: boolean) { return spawned = s; }

var passedInFloor = 0;
export function getPassedInFloor() { return passedInFloor; }
export function setPassedInFloor(f: number) { return passedInFloor = f; }

var currentFloor = 0;
export function getCurrentFloor() { return currentFloor; }
export function setCurrentFloor(f: number) { return currentFloor = f; }

var actualFloor = 0;
export function getActualFloor() { return actualFloor; }
export function setActualFloor(f: number) { return actualFloor = f; }

var gotoFloor = 0;
export function getGotoFloor() { return gotoFloor; }
export function setGotoFloor(f: number) { return gotoFloor = f; }

var renderer: WebGLRenderer;
export function getRenderer() { return renderer; }
export function setRenderer(r: WebGLRenderer) { return renderer = r; }

var camera: Camera;
export function getCamera() { return camera; }
export function setCamera(c: Camera) { return camera = c; }

var touched = false;
export function getTouched() { return touched; }
export function setTouched(t: boolean) { return touched = t; }

var rotatedX = 0;
export function getRotatedX() { return rotatedX; }
export function setRotatedX(r: number) { return rotatedX = r; }

var rotatedY = 0;
export function getRotatedY() { return rotatedY; }
export function setRotatedY(r: number) { return rotatedY = r; }

var floor: Floor;
export function getFloor() { return floor; }
export function setFloor(f: Floor) { return floor = f; }

var started = false;
export function getStarted() { return started; }
export function setStarted(s: boolean) { return started = s; }
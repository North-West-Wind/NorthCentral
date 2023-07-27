import { Camera, WebGLRenderer } from "three";

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
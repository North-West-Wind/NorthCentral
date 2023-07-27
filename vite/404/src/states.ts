import { Camera, WebGLRenderer } from "three";

var ratio: number;
export function getRatio() { return ratio; }
export function setRatio(r: number) { return ratio = r; }

var spawned = false;
export function getSpawned() { return spawned; }
export function setSpawned(s: boolean) { return spawned = s; }

var renderer: WebGLRenderer;
export function getRenderer() { return renderer; }
export function setRenderer(r: WebGLRenderer) { return renderer = r; }

var camera: Camera;
export function getCamera() { return camera; }
export function setCamera(c: Camera) { return camera = c; }
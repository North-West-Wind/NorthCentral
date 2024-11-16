import * as THREE from "three";

export function configTexture(tex: THREE.Texture) {
	tex.magFilter = THREE.NearestFilter;
	tex.minFilter = THREE.LinearMipMapLinearFilter;
	tex.colorSpace = THREE.SRGBColorSpace;
}
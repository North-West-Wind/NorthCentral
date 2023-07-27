import * as THREE from "three";

export class PrismGeometry extends THREE.ExtrudeGeometry {
	constructor(vertices: THREE.Vec2[], height: number) {
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
		super(Shape, settings);
	}
}
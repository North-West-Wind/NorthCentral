/**
 * @param {THREE.Scene} scene
 */
async function makeCampfire(scene) {
    GLTF_LOADER.load("/assets/models/campfire/scene.gltf", (gltf) => {
        const campfire = gltf.scene;
        campfire.position.set(0, -50, -200);
        campfire.scale.set(3, 3, 3);
        scene.add(campfire);
    });
    GLTF_LOADER.load("/assets/models/stick/scene.gltf", (gltf) => {
        const stick = gltf.scene;
        stick.position.set(40, -50, -150);
        stick.setRotationFromAxisAngle(new THREE.Vector3(1, 0, -1), -Math.PI / 6);
        stick.scale.set(1.5, 1.5, 1.5);
        scene.add(stick);
    });
    GLTF_LOADER.load("/assets/models/marshmallow/scene.gltf", (gltf) => {
        const marshmallow = gltf.scene;
        marshmallow.position.set(11.25, -7.25, -178);
        marshmallow.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 1), Math.PI / 4);
        marshmallow.scale.set(10, 10, 10);
        scene.add(marshmallow);
    });

    const pointLight = new THREE.PointLight(0xffda82, 1.5, 300, 2);
    pointLight.position.set(0, -40, -200)
    pointLight.castShadow = true;
    scene.add(pointLight);
}

/**
 * @param {THREE.Scene} scene
 */
async function makeNotice(scene) {
    const geometry = new THREE.BoxGeometry(75, 5, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0 });

    const x = document.createElement("canvas");
    const xc = x.getContext("2d");
    x.width = 750;
    x.height = 50;
    xc.fillStyle = "white";
    xc.font = "36px 'Courier New'";
    xc.textAlign = "center";
    xc.textBaseline = "middle";
    xc.fillText("404 - Your page was not found", x.width / 2, x.height / 2);
    const xm = new THREE.MeshBasicMaterial({ map: new THREE.Texture(x), transparent: true });
    xm.map.needsUpdate = true;

    const y = document.createElement("canvas");
    const yc = y.getContext("2d");
    y.width = 750;
    y.height = 50;
    yc.fillStyle = "white";
    yc.font = "36px 'Courier New'";
    yc.textAlign = "center";
    yc.textBaseline = "middle";
    yc.fillText("Here, have a marshmallow", y.width / 2, y.height / 2);
    const ym = new THREE.MeshBasicMaterial({ map: new THREE.Texture(y), transparent: true });
    ym.map.needsUpdate = true;

    const notice0 = new THREE.Mesh(geometry, [material, material, material, material, xm, material]);
    const notice1 = new THREE.Mesh(geometry, [material, material, material, material, ym, material]);
    notice0.position.z = notice1.position.z = -100;
    notice0.position.y = 20;
    notice1.position.y = 15;
    scene.add(notice0, notice1);
    return { notice0, notice1 };
}
function makeCake(scene) {
    GLTF_LOADER.load("/assets/models/cake/scene.gltf", (gltf) => {
        const cake = gltf.scene;
        cake.position.set(0, -2.75, -3);
        cake.scale.set(150,150,150);
        scene.add(cake);
    });
    //const pointLight = new THREE.PointLight(0xfff8be, 1, 300, 2);
    //pointLight.position.set(0, 0, -50);
    //scene.add(pointLight);
}

function makeSign(scene) {
    const geometryD = new THREE.BoxGeometry(30, 5, 0.5);
    const xm = new THREE.MeshStandardMaterial({ map: displayTexture(), transparent: true });
    xm.map.needsUpdate = true;
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
    display.position.set(0, 20, -100);
    scene.add(display);

    // const geoCover = new THREE.BoxGeometry(30, 5, 0.5);
    // const cover = new THREE.Mesh(geoCover, new THREE.MeshBasicMaterial({ color: 0 }));
    // cover.position.set(0, 5, -19);
    // scene.add(cover);
    // return { cover };
}

function displayTexture() {
    var x = document.createElement("canvas");
    var xc = x.getContext("2d");
    x.width = 2400;
    x.height = 400;
    xc.fillStyle = "#555555";
    xc.fillRect(0, 0, x.width, x.height);
    xc.fillStyle = "black";
    xc.fillRect(20, 20, x.width - 40, x.height - 40);
    xc.fillStyle = "white";
    xc.font = "240px 'Courier New'";
    xc.textAlign = "center";
    xc.textBaseline = "middle";
    xc.fillText("Welcome to 2022!", x.width / 2, x.height / 2);
    return new THREE.Texture(x);
}
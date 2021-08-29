const PAGES = [
    "auto-fish",
    "more-boots",
    "sky-farm",
    "n0rthwestw1nd",
    "node-packages",
    "other-mods",
    "other-packages"
];

const CONTENTS = [];
const N0RTHWESTW1ND_CONTENTS = [];

function readPage(url, arr) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", url, false);
    rawFile.onreadystatechange = () => {
        if(rawFile.readyState === 4 && (rawFile.status === 200 || rawFile.status == 0)) arr.push(rawFile.responseText);
    };
    rawFile.send(null);
}

readPage("/contents/information.html", CONTENTS);
for (const page of PAGES) readPage(`/contents/${page}.html`, CONTENTS);
for (let i = 0; i < 3; i++) readPage(`/contents/n0rthwestw1nd/info-${i}.html`, N0RTHWESTW1ND_CONTENTS);

const LOADER = new THREE.TextureLoader();
const GLTF_LOADER = new GLTFLoader();

const PARTICLE_DISTANCE = 200;
const SHRINK_PARTICLE_DISTANCE = 20;

const MAX_FLOOR = 4;
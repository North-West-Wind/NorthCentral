const PAGES = [
    "auto-fish",
    "more-boots",
    "sky-farm",
    "n0rthwestw1nd",
    "node-packages",
    "other-mods",
    "other-packages"
];

const CONTENTS = [`<h1>North's Elevator</h1> <div class="help"> <h2>Usage</h2><br> <p> Use the arrow buttons to set the floor.<br> Click on the display to go to that floor.<br> Click on the sign again to close this. </p> <h2>Floors</h2> <table class="floors"> <tr><th>7/F</th><td>Other Projects</td></tr> <tr><th>6/F</th><td>Other Mods</td></tr> <tr><th>5/F</th><td>Node.js Packages</td></tr> <tr><th>4/F</th><td>N0rthWestW1nd</td></tr> <tr><th>3/F</th><td>Sky Farm</td></tr> <tr><th>2/F</th><td>More Boots</td></tr> <tr><th>1/F</th><td>Auto Fish</td></tr> </table> <br> <p>Scroll to move out at the floor.</p> </div>`];

for (const page of PAGES) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", `contents/${page}.html`, false);
    rawFile.onreadystatechange = () => {
        if(rawFile.readyState === 4 && (rawFile.status === 200 || rawFile.status == 0)) CONTENTS.push(rawFile.responseText);
    };
    rawFile.send(null);
}

const LOADER = new THREE.TextureLoader();
const GLTF_LOADER = new GLTFLoader();
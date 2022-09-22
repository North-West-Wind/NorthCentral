const MAX_FLOOR = 5;
const SHEETS = 8;

const PAGES = [
    "auto-fish",
    "more-boots",
    "sky-farm",
    "n0rthwestw1nd",
    "sheet-music",
    "other-projects"
];

const CONTENTS = [];
const ERROR_CONTENTS = [];
const N0RTHWESTW1ND_CONTENTS = [];
const SHEETMUSIC_CONTENTS = [];
const SHEETMUSIC_TITLES = [];

function readPageGenerator(url, arr, regex = undefined, otherarr = []) {
    const func = () => readPage(url, arr, arr.length, regex, otherarr);
    arr.push(func);
}

function readPage(url, arr, index, regex = undefined, otherarr = []) {
    return new Promise(resolve => {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", url, false);
        rawFile.onreadystatechange = () => {
            if (rawFile.readyState === 4 && (rawFile.status === 200 || rawFile.status == 0)) {
                const text = rawFile.responseText;
                if (regex) otherarr.push(text.match(regex)[1]);
                arr[index] = () => text;
                resolve(text);
            }
        };
        rawFile.send(null);
    });
}

readPageGenerator("/contents/information.html", CONTENTS);
for (const page of PAGES) readPageGenerator(`/contents/${page}.html`, CONTENTS);
for (let i = 0; i < 3; i++) readPageGenerator(`/contents/n0rthwestw1nd/info-${i}.html`, N0RTHWESTW1ND_CONTENTS);
for (let i = 0; i < SHEETS; i++) readPageGenerator(`/contents/sheetmusic/info-${i}.html`, SHEETMUSIC_CONTENTS, /\<h1\>(?<name>.+)\<\/h1\>/, SHEETMUSIC_TITLES);

readPageGenerator("/contents/error/information.html", ERROR_CONTENTS);
export const PARTICLE_DISTANCE = 200;
export const SHRINK_PARTICLE_DISTANCE = 20;

export const MAX_FLOOR = 5;
export const SHEETS = 8;

export const PAGES = [
	"auto-fish",
	"more-boots",
	"sky-farm",
	"n0rthwestw1nd",
	"sheet-music",
	"other-projects"
];

export const CONTENTS: (() => Promise<string> | string)[] = [];
export const ERROR_CONTENTS: (() => Promise<string> | string)[] = [];
export const N0RTHWESTW1ND_CONTENTS: (() => Promise<string> | string)[] = [];
export const SHEETMUSIC_CONTENTS: (() => Promise<string> | string)[] = [];
export const SHEETMUSIC_TITLES: string[] = [];

function readPageGenerator(url: string, arr: (() => Promise<string> | string)[], regex: RegExp | undefined = undefined, otherarr: string[] = []) {
	const func = () => readPage(url, arr, arr.length, regex, otherarr);
	arr.push(func);
}

function readPage(url: string, arr: (() => Promise<string> | string)[], index: number, regex: RegExp | undefined = undefined, otherarr: string[] = []) {
	return new Promise<string>(resolve => {
		var rawFile = new XMLHttpRequest();
		rawFile.open("GET", url, false);
		rawFile.onreadystatechange = () => {
			if (rawFile.readyState === 4 && (rawFile.status === 200 || rawFile.status == 0)) {
				const text = rawFile.responseText;
				if (regex) otherarr.push(text.match(regex)![1]);
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
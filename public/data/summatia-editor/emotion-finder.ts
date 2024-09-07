import * as fs from "fs";
import * as path from "path";

const summatiaData = JSON.parse(fs.readFileSync(path.join(__dirname, "../summatia.json"), { encoding: "utf8" }));

for (const key in summatiaData) {
	if (key == "emotions") continue;
	const data = summatiaData[key];
	if (data.emotion & (1 << 12)) console.log(key);
}
import * as fs from "fs";
import * as path from "path";

const summatiaData = JSON.parse(fs.readFileSync(path.join(__dirname, "../summatia.json"), { encoding: "utf8" }));

for (const key in summatiaData) {
	if (key == "emotions") continue;
	const data = summatiaData[key];
	if (!Array.isArray(data.responses)) continue;
	const informal = (data.responses as any[]).map((response: { message: string }) => response.message)
		.filter(message => !",.?!".includes(message.charAt(message.length - 1)));
	if (informal.length) {
		console.log(key);
		console.log(informal);
	}
}
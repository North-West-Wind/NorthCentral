import translate from "google-translate-api-x";
const isEnglish = require("is-english");

async function translateOnly(input: string, useDeepL = false): Promise<{ lang: string, out: string, input: string }> {
	if (isEnglish(input)) return { lang: "en", out: input, input };
	const result = await translate(input, { to: "en" });
	const send = { lang: result.from.language.iso, out: "", input };
	if (useDeepL) {
		const resp = await fetch("https://deeplx.vercel.app/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: input, source_lang: "auto", target_lang: "EN" }) });
		if (!resp.ok) send.out = result.text;
		else {
			const json = await resp.json();
			if (Math.floor(json.code / 100) != 2 || !isEnglish(json.data)) send.out = result.text;
			else send.out = json.data;
		}
	} else send.out = result.text;
	return send;
}

export async function translateToEng(input: string, useDeepL = false) {
	const send = await translateOnly(input, useDeepL);
	if (send.out == input) {
		// output is same as input. try to translate only words with non-english characters
		let newInput = input.match(/[^ ]*[^a-zA-Z ]+[^ ]*/g)?.join("");
		if (!newInput) return send;
		newInput = newInput.replace(/^\s+/g, "");
		const retry = await translateOnly(newInput, useDeepL);
		if (retry.out == newInput) {
			// if that still doesn't work, try to remove all english characters
			newInput = newInput.match(/[^a-zA-Z ]+/g)?.join("");
			if (!newInput) return retry;
			return await translateOnly(newInput, useDeepL);
		}
		return retry;
	}
	return send;
}
export function readPageGenerator(url: string, arr: (() => Promise<string> | string)[], regex: RegExp | undefined = undefined, otherarr: string[] = []) {
	const func = () => readPage(url, arr, arr.length, regex, otherarr);
	arr.push(func);
	return arr;
}

export function readPage(url: string, arr: (() => Promise<string> | string)[], index: number, regex: RegExp | undefined = undefined, otherarr: string[] = []) {
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

export async function fetchText(url: string) {
	const res = await fetch(url);
	return await res.text();
}

export async function fetchJson(url: string) {
	const res = await fetch(url);
	return await res.json();
}
export async function readPage(url: string) {
	const res = await fetch(url);
	return await res.text();
}

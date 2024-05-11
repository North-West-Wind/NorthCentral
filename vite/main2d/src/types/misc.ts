export class LazyLoader<T> {
	loader: () => (Promise<T> | T);
	value?: T;

	constructor(loader: () => (Promise<T> | T)) {
		this.loader = loader;
	}

	async get() {
		if (this.value === undefined) this.value = await this.loader();
		return this.value;
	}
}
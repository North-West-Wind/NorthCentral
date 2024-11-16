export class LazyLoader<T> {
	private loader: () => (Promise<T> | T);
	private value?: T;

	constructor(loader: () => (Promise<T> | T)) {
		this.loader = loader;
	}

	async get() {
		if (this.value === undefined) this.value = await this.loader();
		return this.value;
	}

	got() {
		return this.value;
	}
}
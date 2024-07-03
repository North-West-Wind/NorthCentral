const DEFAULT_CONFIG = {
	allowStorage: false,
	answerStorage: false,
	music: false,
	summatia: "",
	autoSummatia: false,
};
const CONFIG_COOKIE_NAME = "elevator_config";

let config = DEFAULT_CONFIG;
readConfig();

export function readConfig() {
	const configStr = window.localStorage.getItem(CONFIG_COOKIE_NAME) || window.sessionStorage.getItem(CONFIG_COOKIE_NAME);
	if (!configStr) config = DEFAULT_CONFIG;
	else {
		try {
			config = JSON.parse(configStr);
		} catch (err) {
			config = DEFAULT_CONFIG;
		}
	}
}

export function writeConfig() {
	if (config.allowStorage) window.localStorage.setItem(CONFIG_COOKIE_NAME, JSON.stringify(config));
	else window.sessionStorage.setItem(CONFIG_COOKIE_NAME, JSON.stringify(config));
}

export function getConfig() {
	return config;
}

export function toggleMusic() {
	const config = getConfig();
	if (config.music) {
		config.music = false;
		(document.getElementById("player") as HTMLAudioElement).pause();
	} else {
		config.music = true;
		(document.getElementById("player") as HTMLAudioElement).play();
	}
	writeConfig();
}

export function wait(ms: number) {
	return new Promise<void>(res => setTimeout(res, ms));
}
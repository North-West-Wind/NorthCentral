const DEFAULT_CONFIG = {
	allowStorage: false,
	answerStorage: false,
	music: false,
	summatia: ""
};
const CONFIG_COOKIE_NAME = "elevator_config";

let config = DEFAULT_CONFIG;
readConfig();

export function readConfig() {
	const configStr = window.sessionStorage.getItem(CONFIG_COOKIE_NAME) || window.localStorage.getItem(CONFIG_COOKIE_NAME);
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

export async function wait(ms: number) {
	await new Promise(res => setTimeout(res, ms));
}
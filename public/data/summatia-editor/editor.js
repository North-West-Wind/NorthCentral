const bgDiv = document.querySelector("div#background");
const summatiaSelector = document.querySelector("div#summatia-selector");
const checkboxes = summatiaSelector.querySelector("#checkboxes");
const presetSelector = document.querySelector("select#presets");
const logicSelector = document.querySelector("select#logic");
const deadends = document.querySelector("div#deadends");
const nonexist = document.querySelector("div#nonexist");
const logicDiv = document.querySelector("div#logic-editor");
const message = logicDiv.querySelector("textarea#message");
const choices = logicDiv.querySelector("div#choices");

let emotions = 17;
let emotionPresets = [];

let summatiaData;
let preset = "";
let logic = "";
let editPresetMode = false;

let stack = [];

function translateEmotionPreset(preset) {
	if (typeof preset === "number") return preset;
	else return summatiaData.emotions[preset];
}

function renderEmotion() {
	if (editPresetMode) summatiaData.emotions[preset] = emotions;
	else if (logic && summatiaData[logic]) summatiaData[logic].emotion = emotions;
	const svg = bgDiv.querySelector("#background svg");

	if (!svg) return; // ignore, it will eventually be called by svg fetch

	svg.querySelector("#eye").style.display = emotions & (1 + 2) ? "inline" : "none";
	svg.querySelector("#eye-half").style.display = emotions & (4 + 8) ? "inline" : "none";
	svg.querySelectorAll(".eye-open").forEach(item => item.style.display = emotions & (1 + 4) ? "inline" : "none");
	svg.querySelectorAll(".eye-close").forEach(item => item.style.display = emotions & (2 + 8) ? "inline" : "none");

	svg.querySelector("#mouth-smile").style.display = emotions & (16) ? "inline" : "none";
	svg.querySelector("#mouth-sad").style.display = emotions & (32) ? "inline" : "none";
	svg.querySelector("#mouth-laugh").style.display = emotions & (64) ? "inline" : "none";
	svg.querySelector("#mouth-mad").style.display = emotions & (128) ? "inline" : "none";

	svg.querySelector("#blush").style.opacity = emotions & (256) ? "1" : "0";

	if (emotions & (512 + 1024)) {
		svg.querySelector(".left-brow").style.transform = `rotate(${emotions & 512 ? "-10" : "20"}deg)`;
		svg.querySelector(".right-brow").style.transform = `rotate(${emotions & 512 ? "10" : "-20"}deg)`;
	} else
		svg.querySelectorAll(".brow").forEach(item => item.style.transform = "");

	svg.querySelectorAll(".summatia-head").forEach(item => item.style.transform = `translateY(${emotions & 2048 ? "5" : "0"}px)`);

	svg.querySelector("#hands-table").style.display = emotions & (4096) ? "inline" : "none";
	svg.querySelector("#hands-hold").style.display = emotions & (8192) ? "inline" : "none";
	svg.querySelector("#hands-face").style.display = emotions & (16384) ? "inline" : "none";

	if (emotions & 32768)
		svg.querySelectorAll(".pupil").forEach(item => item.style.transform = "translateY(18px)");
	else if (emotions & 131072) {
		svg.querySelectorAll(".left-pupil").forEach(item => item.style.transform = "translate(-14px, 9px)");
		svg.querySelectorAll(".right-pupil").forEach(item => item.style.transform = "translate(-24px, 9px)");
	} else if (emotions & 262144) {
		svg.querySelectorAll(".left-pupil").forEach(item => item.style.transform = "translate(20px, 9px)");
		svg.querySelectorAll(".right-pupil").forEach(item => item.style.transform = "translate(13px, 9px)");
	} else
		svg.querySelectorAll(".pupil").forEach(item => item.style.transform = "");

	svg.querySelectorAll(".tears").forEach(item => item.style.opacity = emotions & (1 << 19) ? "1" : "0")
}

function updateCheckboxes() {
	checkboxes.childNodes.forEach((node, ii) => {
		const checkbox = node.querySelector("input");
		if (emotions & (1 << ii)) checkbox.setAttribute("checked", "");
		else checkbox.removeAttribute("checked");
	})
}

function updatePresets() {
	presetSelector.innerHTML = "";

	const defaultOption = document.createElement("option");
	defaultOption.innerHTML = "(unselected)";
	presetSelector.appendChild(defaultOption);

	const newOption = document.createElement("option");
	newOption.setAttribute("value", "new");
	newOption.innerHTML = "New...";
	presetSelector.appendChild(newOption);

	for (const preset of emotionPresets) {
		const option = document.createElement("option");
		option.setAttribute("value", preset);
		option.innerHTML = preset;
		presetSelector.appendChild(option);
	}
	presetSelector.onchange = (evt) => {
		if (evt.target.value === "new") {
			preset = prompt("Preset name:");
			summatiaData.emotions[preset] = emotions;
			emotionPresets.push(preset);
			emotionPresets = emotionPresets.sort();
		} else if (evt.target.value) {
			preset = evt.target.value;
			emotions = summatiaData.emotions[evt.target.value];
			renderEmotion();
		}
		updateCheckboxes();
	}
}

function updateLogicSelector() {
	logicSelector.innerHTML = "";

	const defaultOption = document.createElement("option");
	defaultOption.innerHTML = "(unselected)";
	logicSelector.appendChild(defaultOption);

	const newOption = document.createElement("option");
	newOption.setAttribute("value", "new");
	newOption.innerHTML = "New...";
	logicSelector.appendChild(newOption);

	for (const key in summatiaData) {
		if (key == "emotions") continue;
		const option = document.createElement("option");
		option.setAttribute("value", key);
		if (key == logic) option.setAttribute("selected", "");
		option.innerHTML = key;
		logicSelector.appendChild(option);
	}
	logicSelector.onchange = (evt) => {
		if (evt.target.value === "new") {
			logic = prompt("Logic name:");
			summatiaData[preset] = {
				message: "",
				emotion: emotions
			};
		} else if (evt.target.value)
			logic = evt.target.value;
		updateLogic();
	}
}

function updateDeadendsNonExist() {
	deadends.innerHTML = "";
	nonexist.innerHTML = "";

	for (const key in summatiaData) {
		if (!Array.isArray(summatiaData[key].responses) && typeof summatiaData[key].next != "string" && key != "emotions") {
			const div = document.createElement("div");
			div.innerHTML = key;
			deadends.appendChild(div);
		} else if (key != "emotions") {
			if (Array.isArray(summatiaData[key].responses))
				for (const response of summatiaData[key].responses) {
					if (!summatiaData[response.next]) {
						const div = document.createElement("div");
						div.innerHTML = response.next;
						nonexist.appendChild(div);
					}
				}
			else if (summatiaData[key].next && !summatiaData[summatiaData[key].next]) {
				const div = document.createElement("div");
				div.innerHTML = summatiaData[key].next;
				nonexist.appendChild(div);
			}
		}
	}
}

function updateLogic() {
	stack.push(logic);
	let data = summatiaData[logic];
	if (!data) {
		data = {
			message: "",
			emotion: emotions
		};
		summatiaData[logic] = data;
	}
	emotions = translateEmotionPreset(data.emotion);
	renderEmotion();
	updateCheckboxes();
	updateLogicSelector();
	updateDeadendsNonExist();
	message.value = data.message;
	message.onchange = (evt) => {
		summatiaData[logic].message = evt.target.value;
	}

	choices.innerHTML = "";
	if (Array.isArray(data.responses)) {
		for (let ii = 0; ii < data.responses.length; ii++) {
			const response = data.responses[ii];
			const container = document.createElement("div");
			container.classList.add("logic-next-container");
			const msg = document.createElement("input");
			msg.value = response.message;
			msg.onchange = (evt) => {
				summatiaData[logic].responses[ii].message = evt.target.value;
			}
			const next = document.createElement("input");
			next.value = response.next;
			next.onchange = (evt) => {
				summatiaData[logic].responses[ii].next = evt.target.value;
			}
			const button = document.createElement("button");
			button.innerHTML = "Goto";
			button.onclick = () => {
				logic = next.value;
				updateLogic();
			}
			container.appendChild(msg);
			container.appendChild(next);
			container.appendChild(button);
			choices.appendChild(container);
		}
		const button = document.createElement("button");
		button.innerHTML = "Add";
		button.onclick = () => {
			summatiaData[logic].responses.push({ message: "", next: "" });
			updateLogic();
		}
		choices.appendChild(button);
	} else if (typeof data.next == "string") {
		const next = document.createElement("input");
		next.value = data.next;
		next.onchange = (evt) => {
			summatiaData[logic].next = evt.target.value;
		}
		const button = document.createElement("button");
		button.innerHTML = "Goto";
		button.onclick = () => {
			logic = next.value;
			updateLogic();
		}
		choices.appendChild(next);
		choices.appendChild(button);
	}
}

fetch("../../assets/background/4-restaurant.svg").then(async res => {
	if (res.ok) {
		bgDiv.innerHTML = await res.text();
		renderEmotion();
	}
});

if (window.localStorage.getItem("summatiaData") && confirm("Load data from local storage?")) {
	summatiaData = JSON.parse(window.localStorage.getItem("summatiaData"));
	afterDataObtained();
} else fetch("../summatia.json").then(async res => {
	if (res.ok) {
		summatiaData = await res.json();
		afterDataObtained();
	}
});

function afterDataObtained() {
	// remove delay attribute
	for (const key of Object.keys(summatiaData)) {
		if (key == "emotions") continue;
		if (summatiaData[key].delay !== undefined) delete summatiaData[key].delay;
	}

	// create checkboxes
	for (const bit of Object.keys(summatiaData.emotions.reference).map(x => parseInt(x))) {
		if (isNaN(bit)) continue;
		const container = document.createElement("div");
		const checkbox = document.createElement("input");
		checkbox.setAttribute("type", "checkbox");
		if (emotions & bit) checkbox.setAttribute("checked", "");
		checkbox.onchange = (evt) => {
			if (evt.target.checked) emotions |= bit;
			else emotions &= ~bit;
			renderEmotion();
		}
		const label = document.createElement("label");
		label.innerHTML = summatiaData.emotions.reference[bit.toString()];
		container.appendChild(checkbox);
		container.appendChild(label);
		checkboxes.appendChild(container);
	}

	// preset selector functionality
	emotionPresets = Object.keys(summatiaData.emotions).filter(x => x != "reference").sort();
	updatePresets();
	document.querySelector("input#edit-preset").onchange = (evt) => {
		editPresetMode = evt.target.checked;
	}
	document.querySelector("button#delete-preset").onclick = () => {
		if (!preset) return;
		if (confirm(`Are you sure you want to delete ${preset}?`)) {
			delete summatiaData.emotions[preset];
			preset = "";
			updatePresets();
		}
	}

	// logic back
	document.querySelector("button#parent-logic").onclick = () => {
		if (stack.length <= 1) return;
		stack.pop();
		logic = stack[stack.length - 1];
		updateLogic();
	}

	// logic editor
	logic = "first";
	updateLogic();
	// logic next step modifier
	logicDiv.querySelector("button#add-next").onclick = () => {
		if (!logic) return;
		delete summatiaData[logic].responses;
		if (!summatiaData[logic].next) summatiaData[logic].next = "";
		updateLogic();
	}
	logicDiv.querySelector("button#add-responses").onclick = () => {
		if (!logic) return;
		delete summatiaData[logic].next;
		if (!summatiaData[logic].responses) summatiaData[logic].responses = [];
		updateLogic();
	}
	logicDiv.querySelector("button#add-nothing").onclick = () => {
		if (!logic) return;
		delete summatiaData[logic].next;
		delete summatiaData[logic].responses;
		updateLogic();
	}
	updateLogicSelector();
}

window.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 's') {
		e.preventDefault();
		window.localStorage.setItem("summatiaData", JSON.stringify(summatiaData));
		alert("Saved!");
  } else if (e.ctrlKey && e.key === 'e') {
		// download file
		const element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(summatiaData)));
		element.setAttribute('download', "summatia.json");
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
		window.localStorage.setItem("summatiaData", JSON.stringify(summatiaData));
	}
});
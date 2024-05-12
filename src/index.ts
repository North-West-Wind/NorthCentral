import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import * as fs from "fs";
import translate from "google-translate-api-x";
import * as path from "path";
const isEnglish = require("is-english");

const PAGES = [
	"auto-fish",
	"more-boots",
	"sky-farm",
	"n0rthwestw1nd",
	"sheet-music",
	"gallery"
];

const root = path.resolve(__dirname, "../public");
const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('views', path.resolve(__dirname, "../views"));
app.set('view engine', 'ejs');

app.get("/", (_req, res) => {
	res.sendFile("main.html", { root });
});
app.get("/2d", (_req, res) => {
	res.sendFile("main2d.html", { root });
});
app.get("/api/ping", (_req, res) => res.sendStatus(200));

// discord bot stuff
app.get("/n0rthwestw1nd/manual", (req, res) => res.sendFile("assets/safe_manual.pdf", { root }));
app.get("/n0rthwestw1nd/manual/:ver", (req, res) => {
	if (req.params.ver === "unsafe") res.sendFile("assets/unsafe_manual.pdf", { root });
	else if (req.params.ver === "tradew1nd") res.sendFile("assets/tradew1nd_manual.pdf", { root });
	else res.sendFile("assets/safe_manual.pdf", { root });
});

// tradew1nd bot stuff
app.get("/api/download/:guild", async (req, res) => {
	const response = await fetch("http://localhost:3001/download/" + req.params.guild);
	if (!response.ok) res.sendStatus(response.status);
	else res.json(await response.json());
});

app.get("/tradew1nd/download/:guild", async (req, res) => {
	res.render("tradew1nd/downloads", { guild: req.params.guild });
});

app.get("/tradew1nd/invite", async (req, res) => {
	res.render("tradew1nd/invite");
});

app.get("/tradew1nd/invite/real", async (req, res) => {
	try {
		const response = await fetch(`http://localhost:3001/`);
		if (!response.ok) res.sendStatus(response.status);
		else {
			const data = <any>await response.json();
			for (const bot of data) {
				if (bot.size < 75) return res.redirect(301, `https://discord.com/api/oauth2/authorize?client_id=${bot.id}&permissions=2150755392&scope=bot%20applications.commands`);
			}
			res.send("All TradeW1nd derivatives are full!");
		}
	} catch (err) {
		if (!res.headersSent) res.sendStatus(500);
	}
});

app.get("/tradew1nd/privacy", (_req, res) => res.render("tradew1nd/privacy"));
app.get("/tradew1nd", (_req, res) => res.render("tradew1nd/index"));
// redirectors
app.get("/matrix", (_req, res) => res.redirect(301, "https://matrix.to/#/#northwestwind:matrix.northwestw.in"));
app.get("/portal", (_req, res) => res.render("portal"));

app.get("/files/:path", (req, res) => {
	const p = decodeURIComponent(req.params.path);
	if (p.includes("..")) return res.status(403);
	res.json(fs.readdirSync(path.join(".", p)));
});

// uop editor
app.get("/uop-editor", (req, res) => {
	res.sendFile("uop-editor.html", { root });
});

// translator
app.get("/translate", async (req, res) => {
	const input = <string> req.query.in;
	if (isEnglish(input)) return res.json({ lang: "en", out: input });
	try {
		const result = await translate(input, { to: "en" });
		const useDeepL = !!req.query.deepl;
		const send = { lang: result.from.language.iso, out: "" };
		if (useDeepL) {
			const resp = await fetch("https://deeplx.vercel.app/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: input, source_lang: "auto", target_lang: "EN" }) });
			if (!resp.ok) return res.sendStatus(resp.status);
			const json = await resp.json();
			if (Math.floor(json.code / 100) != 2) return res.sendStatus(json.code);
			if (isEnglish(json.data)) send.out = result.text;
			else send.out = json.data;
		} else send.out = result.text;
		res.json(send);
	} catch (err) {
		console.error(err);
		res.sendStatus(500);
	}
});

// elevator
app.get("/2d/:page", (req, res, next) => {
	if (!PAGES.includes(req.params.page)) next();
	else res.sendFile("main2d.html", { root });
});
app.get("/:page", (req, res, next) => {
	if (!PAGES.includes(req.params.page)) next();
	else res.sendFile("main.html", { root });
});

app.use(function (req, res, next) {
	res.status(404);
	res.sendFile("404.html", { root });
});

const server = app.listen(process.env.PORT || 3000, async () => {
	const info = <any>server.address();
	const port = info.port;
	console.log('North Central listening at port %s', port);
});

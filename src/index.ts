import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
const app = express();
import fetch from "node-fetch";
import * as path from "path";

const PAGES = [
	"auto-fish",
	"more-boots",
	"sky-farm",
	"n0rthwestw1nd",
	"sheet-music",
	"other-projects"
];

const root = path.resolve(__dirname, "../public");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('views', path.resolve(__dirname, "../views"));
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
	if (!parseInt(req.cookies.no_3d) && !req.query.no_3d) res.sendFile("index.html", { root });
	else res.render("plain", { page: 0 });
});
app.get("/n0rthwestw1nd/manual", (req, res) => res.sendFile("assets/safe_manual.pdf", { root }));
app.get("/n0rthwestw1nd/manual/:ver", (req, res) => {
	if (req.params.ver === "unsafe") res.sendFile("assets/unsafe_manual.pdf", { root });
	else if (req.params.ver === "tradew1nd") res.sendFile("assets/tradew1nd_manual.pdf", { root });
	else res.sendFile("assets/safe_manual.pdf", { root });
});
app.get("/api/ping", (_req, res) => {
	res.sendStatus(200);
});
app.get("/api/curseforge/mods/search", async (req, res) => {
	try {
		var url = `https://api.curseforge.com/v1/mods/search`;
		const queries = [];
		for (const query in req.query) queries.push(`${query}=${req.query[query]}`);
		if (queries.length) url += `?${queries.join("&")}`;
		const response = await fetch(url, { headers: <any>{ "x-api-key": process.env.CF_API } });
		if (!response.ok) res.sendStatus(response.status);
		else res.json((<any>await response.json()).data);
	} catch (err) {
		if (!res.headersSent) res.sendStatus(500);
	}
});
app.get("/api/curseforge/mods/:id", async (req, res) => {
	try {
		const response = await fetch(`https://api.curseforge.com/v1/mods/${req.params.id}`, { headers: <any>{ "x-api-key": process.env.CF_API } });
		if (!response.ok) res.sendStatus(response.status);
		else res.json((<any>await response.json()).data);
	} catch (err) {
		if (!res.headersSent) res.sendStatus(500);
	}
});
app.get("/api/curseforge/mods/:id/files", async (req, res) => {
	try {
		var url = `https://api.curseforge.com/v1/mods/${req.params.id}/files`;
		const queries = [];
		for (const query in req.query) queries.push(`${query}=${req.query[query]}`);
		if (queries.length) url += `?${queries.join("&")}`;
		const response = await fetch(url, { headers: <any>{ "x-api-key": process.env.CF_API } });
		if (!response.ok) res.sendStatus(response.status);
		else res.json((<any>await response.json()).data);
	} catch (err) {
		if (!res.headersSent) res.sendStatus(500);
	}
});
app.get("/api/curseforge/mods/:id/files/:fileId", async (req, res) => {
	try {
		const response = await fetch(`https://api.curseforge.com/v1/mods/${req.params.id}/files/${req.params.fileId}`, { headers: <any>{ "x-api-key": process.env.CF_API } });
		if (!response.ok) res.sendStatus(response.status);
		else res.json((<any>await response.json()).data);
	} catch (err) {
		if (!res.headersSent) res.sendStatus(500);
	}
});

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

app.get("/tradew1nd/privacy", async (req, res) => {
	res.render("tradew1nd/privacy");
});

app.get("/tradew1nd", async (req, res) => {
	res.render("tradew1nd/index");
});

app.get("/:page", (req, res, next) => {
	if (!PAGES.includes(req.params.page)) next();
	else {
		if (!parseInt(req.cookies.no_3d) && !req.query.no_3d) res.sendFile("index.html", { root });
		else res.render("plain", { page: req.params.page });
	}
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

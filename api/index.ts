import { config } from "dotenv";
config();
import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
const app = express();
import fetch from "node-fetch";

const PAGES = [
	"auto-fish",
	"more-boots",
	"sky-farm",
	"n0rthwestw1nd",
	"sheet-music",
	"other-projects"
];

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('views', process.env.OUTDIR + "views")
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
	if (!parseInt(req.cookies.no_3d) && !req.query.no_3d) res.render("index", { page: 0 });
	else res.render("plain", { page: 0 });
});
app.get("/n0rthwestw1nd/manual", (req, res) => res.sendFile("public/assets/safe_manual.pdf", { root: process.env.OUTDIR }));
app.get("/n0rthwestw1nd/manual/:ver", (req, res) => {
	if (req.params.ver === "unsafe") res.sendFile("public/assets/unsafe_manual.pdf", { root: process.env.OUTDIR });
	else if (req.params.ver === "tradew1nd") res.sendFile("public/assets/tradew1nd_manual.pdf", { root: process.env.OUTDIR });
	else res.sendFile("public/assets/safe_manual.pdf", { root: process.env.OUTDIR });
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
		const response = await fetch(url, { headers: { "x-api-key": process.env.CF_API } });
		if (!response.ok) res.sendStatus(response.status);
		else res.json((<any>await response.json()).data);
	} catch (err) {
		if (!res.headersSent) res.sendStatus(500);
	}
});
app.get("/api/curseforge/mods/:id", async (req, res) => {
	try {
		const response = await fetch(`https://api.curseforge.com/v1/mods/${req.params.id}`, { headers: { "x-api-key": process.env.CF_API } });
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
		const response = await fetch(url, { headers: { "x-api-key": process.env.CF_API } });
		if (!response.ok) res.sendStatus(response.status);
		else res.json((<any>await response.json()).data);
	} catch (err) {
		if (!res.headersSent) res.sendStatus(500);
	}
});
app.get("/api/curseforge/mods/:id/files/:fileId", async (req, res) => {
	try {
		const response = await fetch(`https://api.curseforge.com/v1/mods/${req.params.id}/files/${req.params.fileId}`, { headers: { "x-api-key": process.env.CF_API } });
		if (!response.ok) res.sendStatus(response.status);
		else res.json((<any>await response.json()).data);
	} catch (err) {
		if (!res.headersSent) res.sendStatus(500);
	}
});

app.get("/api/download/:guild", async(req, res) => {
 const response = await fetch("http://pi-api.ddns.net:3000/download/" + req.params.guild);
 if (!response.ok) res.sendStatus(response.status);
 else res.json(await response.json());
});

app.get("/api/download/file/:guild", async(req, res) => {
	res.redirect(303, "http://pi-api.ddns.net:3000/download/file/" + req.params.guild);
 });

app.get("/tradew1nd/download/:guild", async(req, res) => {
	res.render("downloads", { guild: req.params.guild });
});

app.get("/tradew1nd/invite", async(req, res) => {
	try {
		const response = await fetch(`http://pi-api.ddns.net:3000/`);
		if (!response.ok) res.sendStatus(response.status);
		else {
			const data = <any>await response.json();
			for (const bot of data) {
				if (bot.size < 100) return res.redirect(301, `https://discord.com/api/oauth2/authorize?client_id=${bot.id}&permissions=2150755392&scope=bot%20applications.commands`);
			}
			res.send("All TradeW1nd derivatives are full!");
		}
	} catch (err) {
		if (!res.headersSent) res.sendStatus(500);
	}
});

app.get("/:page", (req, res, next) => {
	if (!PAGES.includes(req.params.page)) next();
	else {
		if (!parseInt(req.cookies.no_3d) && !req.query.no_3d) res.render("index", { page: req.params.page });
		else res.render("plain", { page: req.params.page });
	}
});

app.use(function (req, res, next) {
	res.status(404);
	res.render("404");
});

const server = app.listen(process.env.PORT || 3000, async () => {
	const info = <any>server.address();
	const port = info.port;
	console.log('North Central listening at port %s', port);
});

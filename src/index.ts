import { config } from "dotenv";
config();
import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
const app = express();
import fetch from "node-fetch";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.set('views', 'views');
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
	const plain = parseInt(req.cookies.no_3d);
	if (!plain) res.render("index", { page: 0 });
});
app.get("/n0rthwestw1nd/manual", (req, res) => res.sendFile(__dirname + "/public/assets/safe_manual.pdf"));
app.get("/n0rthwestw1nd/manual/:ver", (req, res) => {
	if (req.params.ver === "unsafe") res.sendFile(__dirname + "/public/assets/unsafe_manual.pdf");
	else if (req.params.ver === "tradew1nd") res.sendFile(__dirname + "/public/assets/tradew1nd_manual.pdf");
	else res.sendFile(__dirname + "/public/assets/safe_manual.pdf");
});
app.get("/api/ping", (_req, res) => {
	res.sendStatus(200);
});
app.get("/api/curseforge/mods/search", async (req, res) => {
	var url = `https://api.curseforge.com/v1/mods/search`;
	const queries = [];
	for (const query in req.query) queries.push(`${query}=${req.query[query]}`);
	if (queries.length) url += `?${queries.join("&")}`;
	const response = await fetch(url, { headers: { "x-api-key": process.env.CF_API } });
	if (!response.ok) res.sendStatus(response.status);
	res.json((<any>await response.json()).data);
});
app.get("/api/curseforge/mods/:id", async (req, res) => {
	const response = await fetch(`https://api.curseforge.com/v1/mods/${req.params.id}`, { headers: { "x-api-key": process.env.CF_API } });
	if (!response.ok) res.sendStatus(response.status);
	res.json((<any>await response.json()).data);
});
app.get("/api/curseforge/mods/:id/files", async (req, res) => {
	var url = `https://api.curseforge.com/v1/mods/${req.params.id}/files`;
	const queries = [];
	for (const query in req.query) queries.push(`${query}=${req.query[query]}`);
	if (queries.length) url += `?${queries.join("&")}`;
	const response = await fetch(url, { headers: { "x-api-key": process.env.CF_API } });
	if (!response.ok) res.sendStatus(response.status);
	res.json((<any>await response.json()).data);
});
app.get("/api/curseforge/mods/:id/files/:fileId", async (req, res) => {
	const response = await fetch(`https://api.curseforge.com/v1/mods/${req.params.id}/files/${req.params.fileId}`, { headers: { "x-api-key": process.env.CF_API } });
	if (!response.ok) res.sendStatus(response.status);
	res.json((<any>await response.json()).data);
});

app.get("/:page", (req, res, next) => {
	if (req.params.page === "library") return res.render("communist-library/index");
	const plain = parseInt(req.cookies.no_3d);
	if (!plain) {
		if (req.params.page === "newyear") res.render("newyear");
		else if (PAGES.includes(req.params.page)) res.render("index", { page: req.params.page });
		else next();
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

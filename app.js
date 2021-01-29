const express = require('express');
const app = express();
const puppeteer = require("puppeteer");
var browser;
const options = { args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--single-process', '--disable-gpu', "--proxy-server='direct://'", '--proxy-bypass-list=*'], headless: true }

app.get('/', function (req, res) {
    if (!req.query.code) return res.json({ error: "No code input." });
    try {
        const result = await (Object.getPrototypeOf(async function () { }).constructor("browser", req.query.code))(browser);
        res.json({ result, error: null });
    } catch (err) {
        res.json({ error: err.message });
    }
});

app.listen(process.env.PORT || 3000, async () => {
    browser = await puppeteer.launch(options);
});
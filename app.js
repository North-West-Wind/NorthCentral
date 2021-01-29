const express = require('express');
const app = express();
const chromium = require("chrome-aws-lambda");
var browser;

app.get('/', async (req, res) => {
    if (!req.query.code) return res.json({ error: "No code input." });
    if (!browser) return res.json({ error: "Browser hasn't been initialized." });
    try {
        const result = await(Object.getPrototypeOf(async function () { }).constructor("browser", req.query.code))(browser);
        res.json({ result, error: null });
    } catch (err) {
        res.json({ error: err.message });
    }
});

app.listen(process.env.PORT || 3000, async () => {
    browser = await chromium.puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--single-process', '--disable-gpu', "--proxy-server='direct://'", '--proxy-bypass-list=*'],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
    });
    console.log("Browser Initialized!");
});
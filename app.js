const express = require('express');
const app = express();
const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
var browser;
async function launchBrowser() {
    browser = await puppeteer.launch({
        args: chrome.args.concat(['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--single-process', '--disable-gpu', "--proxy-server='direct://'", '--proxy-bypass-list=*']),
        executablePath: await chrome.executablePath,
        headless: false
    });
    console.log("Browser Initialized!");
}

app.get('/', async (req, res) => {
    if (!req.query.code) return res.json({ error: "No code input." });
    if (!browser) {
        await launchBrowser();
        return res.json({ error: "Browser hasn't been initialized." });
    }
    try {
        const page = await browser.newPage();
        const result = await(Object.getPrototypeOf(async function () { }).constructor("page", req.query.code))(page);
        res.json({ result, error: null });
        await page.close();
    } catch (err) {
        res.json({ error: err.message });
    }
});

app.listen(process.env.PORT || 3000);
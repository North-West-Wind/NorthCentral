const express = require('express');
const app = express();
const processing = {};
var ID = () => '_' + Math.random().toString(36).substr(2, 9);
var browser;
async function launchBrowser() {
    const chrome = require('chrome-aws-lambda');
    const puppeteer = require('puppeteer-core');
    browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--single-process', '--disable-gpu', "--proxy-server='direct://'", '--proxy-bypass-list=*'],
        headless: false,
        executablePath: await chrome.executablePath
    });
    console.log("Browser Initialized!");
}

app.get('/', async (req, res) => {
    if (!req.query.code) return res.json({ error: "No code input." });
    try {
        if (!browser) await launchBrowser();
        const id = ID();
        processing[id] = {
            running: true,
            result: null,
            error: null
        };
        async function runCode() {
            try {
                const page = await browser.newPage();
                const result = await(Object.getPrototypeOf(async function () { }).constructor("page", req.query.code))(page);
                await page.close();
                processing[id].result = result;
            } catch (err) {
                processing[id].error = err.message;
            }
            processing[id].running = false;
        }
        runCode();
        res.json({ id, error: null });
    } catch (err) {
        res.json({ error: err.message });
    }
});

app.get('/result', async (req, res) => {
    if (!req.query.id) return res.json({ error: "No ID received." });
    const process = processing[req.query.id];
    return res.json(process);
    if (!process) return res.json({ error: "ID not found." });
    if (process.running) return res.json({ error: "Run is not completed." });
    res.json(processing[req.query.id]);
    delete processing[req.query.id];
});

const server = app.listen(process.env.PORT || 3000, async () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log('REST Puppeteer listening at http://%s:%s', host, port);
    await launchBrowser();
});

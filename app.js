const express = require('express');
const app = express();
const processes = {};
const ID = () => "_" + Math.random().toString(36).substr(2, 9);
var browser;
async function launchBrowser() {
    const puppeteer = require('puppeteer');
    browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--single-process', '--disable-gpu', "--proxy-server='direct://'", '--proxy-bypass-list=*'],
        headless: true
    });
    console.log("Browser Initialized!");
}

app.get('/', async (req, res) => {
    if (!req.query.code) return res.json({ error: "No code input." });
    if (req.query.code.includes("browser.close()")) return res.json({ error: "Don't you dare closing my browser." });
    const id = ID();
    res.json({ id, error: null });
    processes[id] = {
        running: true,
        result: null,
        error: null
    };
    console.log("Code Received");
    try {
        if (!browser) await launchBrowser();
        const page = await browser.newPage();
        console.log("Running Code");
        const result = await (Object.getPrototypeOf(async function () { }).constructor("page", req.query.code))(page);
        await page.close();
        processes[id].result = result;
        console.log("Code Finished");
    } catch (err) {
        processes[id].error = err.message;
        console.log("Code Finished with Error");
    }
    processes[id].running = false;
});

app.get("/result", (req, res) => {
    if (!req.query.id) return res.json({ error: "Please send an ID." });
    const process = processes[req.query.id];
    if (!process) return res.json({ error: "ID not found." });
    if (process.running) return res.json({ error: "Process is running." });
    res.json(process);
});

const server = app.listen(process.env.PORT || 3000, async () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log('REST Puppeteer listening at http://%s:%s', host, port);
    await launchBrowser();
});

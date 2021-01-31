const express = require('express');
const app = express();
var browser;
async function launchBrowser() {
    const puppeteer = require('puppeteer');
    browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--single-process', '--disable-gpu', "--proxy-server='direct://'", '--proxy-bypass-list=*'],
        headless: false
    });
    console.log("Browser Initialized!");
}

app.get('/', async (req, res) => {
    if (!req.query.code) return res.json({ error: "No code input." });
    if (req.query.code.includes("browser.close()")) return res.json({ error: "Don't you dare closing my browser." });
    try {
        if (!browser) await launchBrowser();
        const page = await browser.newPage();
        const result = await (Object.getPrototypeOf(async function () { }).constructor("page", req.query.code))(page);
        await page.close();
        res.json({ result, error: null })
    } catch (err) {
        console.error(err);
        res.json({ error: err.message });
    }
});

const server = app.listen(process.env.PORT || 3000, async () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log('REST Puppeteer listening at http://%s:%s', host, port);
    await launchBrowser();
});

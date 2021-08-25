const puppeteer = require("puppeteer");

var browser;
async function getBrowser() {
    if (!browser) browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--single-process', '--disable-gpu', "--proxy-server='direct://'", '--proxy-bypass-list=*'],
        headless: true
    });
    return browser;
}

async function runCode(code) {
    const browser = await getBrowser();
    const page = await browser.newPage();
    console.log("Running Code");
    const result = await (Object.getPrototypeOf(async function () { }).constructor("page", code))(page);
    await page.close();
    return result;
}

module.exports = runCode;
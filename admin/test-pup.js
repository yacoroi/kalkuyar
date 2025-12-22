
const puppeteer = require('puppeteer');

(async () => {
    try {
        console.log('Launching browser...');
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        console.log('Browser launched. New page...');
        const page = await browser.newPage();
        console.log('Going to saadet.org.tr...');
        await page.goto('https://saadet.org.tr/gundem-ve-haberler', { waitUntil: 'domcontentloaded', timeout: 30000 });

        console.log('Page loaded. Waiting for content...');
        // Just grab title to prove it works
        const title = await page.title();
        console.log('Title:', title);

        await browser.close();
        console.log('Success!');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
})();

const puppeteer = require('puppeteer');

let browser = null;
let page = null;

/* Constants */
const BASE_URL = 'https://www.minerals.net/GemStoneMain.aspx';

const minerals = {

    initialize: async () => {
        console.log('Starting the scraper..');

        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: false,
        })
        
        page = await browser.newPage();
        await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

        console.log('Initialization completed..');
    },
    end: async () => {
        console.log('Stopping the scraper..');
        
        await browser.close();
    }

}

module.exports = minerals;
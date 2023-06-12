const puppeteer = require("puppeteer");

let browser = null;
let page = null;

/* Constants */
const BASE_URL = "https://www.minerals.net/GemStoneMain.aspx";

const minerals = {
  initialize: async () => {
    console.log("Starting the scraper..");
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: false,
    });
    page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: "networkidle2" });
    console.log("Initialization completed..");
  },
  getGemsData: async () => {
    console.log("Starting scrapper..");

    const gemLinks = await page.$$eval(
      "#ctl00_ContentPlaceHolder1_DataList1 td div > div > a.mineralimg",
      (group) => group.map((g) => ({ url: g.href }))
    );
    const gemsName = await page.$$eval(
      "#ctl00_ContentPlaceHolder1_DataList1 td div > div > a.bluelink",
      (group) => group.map((g, index) => ({ name: g.innerText }))
    );

    const nameWithUrl = gemLinks.map((g, index) => ({
      name: gemsName[index].name,
      url: g.url,
    }));
    console.log(nameWithUrl);
  },
  end: async () => {
    console.log("Stopping the scraper..");

    await browser.close();
  },
};

module.exports = minerals;

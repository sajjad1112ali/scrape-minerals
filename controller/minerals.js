const puppeteer = require("puppeteer");
const { Parser } = require("json2csv");
const fs = require("fs/promises");

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
  getGemsNameAndURL: async () => {
    console.log("Getting gems name and URL..");
    const gemLinks = await page.$$eval(
      "#ctl00_ContentPlaceHolder1_DataList1 td:nth-child(2) div > div > a.mineralimg",
      (group) => group.map((g) => ({ url: g.href }))
    );
    const gemsName = await page.$$eval(
      "#ctl00_ContentPlaceHolder1_DataList1 td:nth-child(2) div > div > a.bluelink",
      (group) => group.map((g) => ({ name: g.innerText }))
    );

    const nameWithUrl = gemLinks.map((g, index) => ({
      name: gemsName[index].name,
      url: g.url,
    }));
    return nameWithUrl;
  },
  getGemsData: async (gems) => {
    let sNo = 0;
    const csvData = [];
    console.log("Fetching Gems data..");
    for (let g of gems) {
      const name = g.name;
      console.log(`Fetching data for ${name}`);

      const page = await browser.newPage();
      page.goto(g.url);
      await page.waitForNavigation();
      let details = await page.evaluate(() => {
        const getInnertTextFor = (selector) => {
          return document.querySelector(selector)
            ? document.querySelector(selector).innerText
            : "NA";
        };

        let about = document.querySelector(".font-size-control").innerText;
        let formula = getInnertTextFor(
          "#ctl00_ContentPlaceHolder1_trChemicalFormula td:nth-child(2)"
        );
        let color = getInnertTextFor("#ctl00_ContentPlaceHolder1_trColor td:nth-child(2)");
        let hardness = getInnertTextFor(
          "#ctl00_ContentPlaceHolder1_trHardness td:nth-child(2)"
        );
        let crystalSystem = getInnertTextFor(
          "#ctl00_ContentPlaceHolder1_trCrystalSystem td:nth-child(2)"
        );
        let refractiveIndex = getInnertTextFor(
          "#ctl00_ContentPlaceHolder1_trRefractiveIndex td:nth-child(2)"
        );
        let sg = getInnertTextFor("#ctl00_ContentPlaceHolder1_trSG td:nth-child(2)");
        let transparency = getInnertTextFor(
          "#ctl00_ContentPlaceHolder1_trTransparency td:nth-child(2)"
        );
        let doubleRefraction = getInnertTextFor(
          "#ctl00_ContentPlaceHolder1_trDoubleRefraction td:nth-child(2)"
        );
        let luster = getInnertTextFor("#ctl00_ContentPlaceHolder1_trLuster td:nth-child(2)");
        let clevage = getInnertTextFor(
          "#ctl00_ContentPlaceHolder1_trCleavage td:nth-child(2)"
        );
        let mineralClass = getInnertTextFor(
          "#ctl00_ContentPlaceHolder1_trMineralClass td:nth-child(2)"
        );
        let allAbout = getInnertTextFor(
          "#ctl00_ContentPlaceHolder1_lblAllAbout"
        );
        let uses = getInnertTextFor(
          "#ctl00_ContentPlaceHolder1_lblUses"
        );
        let resources = getInnertTextFor(
          "#ctl00_ContentPlaceHolder1_lblSource"
        );

        return {
          about,
          formula,
          color,
          hardness,
          crystalSystem,
          refractiveIndex,
          sg,
          doubleRefraction,
          luster,
          clevage,
          mineralClass,
          allAbout,
          uses,
          resources,
        };
      });
      await page.close();
      details.name = name;
      details.sNo = ++sNo;
      console.log(details);
      csvData.push(details);
    }
    return csvData;
  },
  download: async (data) => {
    const parser = new Parser();
    const csv = parser.parse(data);
    await fs.writeFile(`./downloads/minerals.csv`, csv);
  },
  end: async () => {
    console.log("Stopping the scraper..");

    await browser.close();
  },
};

module.exports = minerals;

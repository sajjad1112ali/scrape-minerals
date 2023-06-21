const minerals = require("./controller/minerals");

(async () => {
  await minerals.initialize();
  const getNamesAndURL = await minerals.getGemsNameAndURL();
  const gemsData = await minerals.getGemsData([
    getNamesAndURL[1],
  ]);
  // const gemsData = await minerals.getGemsData(getNamesAndURL);
  await minerals.download(gemsData);
  await minerals.end();
})();

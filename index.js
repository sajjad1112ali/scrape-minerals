const minerals = require('./controller/minerals');

(async () => {
  
  await minerals.initialize();
  await minerals.getGemsData();
  await minerals.end();
  
})();
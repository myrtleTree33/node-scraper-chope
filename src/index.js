import { scrapeOffers, scrapeEntry } from './lib/fetcher';
import util from 'util';

(async () => {
  const results = await scrapeOffers({ page: 25 });
  //   console.dir(results);
  console.log(util.inspect(results, false, null, true /* enable colors */));
  console.log(results.length);
})();

const ChopeScraper = { scrapeOffers, scrapeEntry };

export default ChopeScraper;

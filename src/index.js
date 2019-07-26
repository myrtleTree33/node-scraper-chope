import util from 'util';
import { scrapeOffers } from './lib/fetcher';

// (async () => {
//   const results = await scrapeOffers({ page: 25 });
//   //   console.dir(results);
//   console.log(util.inspect(results, false, null, true /* enable colors */));
//   console.log(results.length);
// })();

const ChopeScraper = { scrapeOffers };

export default ChopeScraper;

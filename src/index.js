import { scrapeOffers, scrapeEntry } from './lib/fetcher';

(async () => {
  const results = await scrapeOffers({ page: 25 });
  console.log(results);
})();

const ChopeScraper = { scrapeOffers, scrapeEntry };

export default ChopeScraper;

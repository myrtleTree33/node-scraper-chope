import { scrapeOffers, scrapeEntry } from './lib/fetcher';

(async () => {
  const results = await scrapeOffers({ page: 1 });
  console.log(results);
})();

const ChopeScraper = { scrapeOffers, scrapeEntry };

export default ChopeScraper;

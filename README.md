# node-scraper-chope

- A scraper that extracts restaurant and offer data from https://chope.co .
- Unofficial API

## Usage

**Scrape a single offer page**

Use the following:

```
import ChopeScraper from 'node-scraper-chope';

(async () => {

    const entries = await ChopeScraper.scrapeOffers({
      page: 2
    });

})();
```

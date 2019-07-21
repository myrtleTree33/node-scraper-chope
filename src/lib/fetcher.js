import Axios from 'axios';
import Cheerio from 'cheerio';
import { isNull } from 'util';

const parseOffers = $ => {
  const offers = $(
    'body > section > div > div.product-variants.hide-mobile > ul > li > ul > li'
  )
    .map((i, elem) => {
      // str is used to resolve offers.
      const str = $(elem)
        .text()
        .replace(/\s+/g, ' ');

      const isAvailable = !str.includes('Sold Out');
      const usualPrice = str.match(/\$([0-9]+\.[0-9]{2}) -/)[1];
      const offerPrice = str.match(/\$([0-9]+\.[0-9]{2})\$/)[1];
      const percentOff = str.match(/-([0-9]+)%/)[1];

      const resolveDay = day => {
        if (!day) {
          return isNull;
        }

        const dayMap = {
          SUN: 0,
          MON: 1,
          TUE: 2,
          WED: 3,
          THU: 4,
          FRI: 5,
          SAT: 6
        };

        return dayMap[day[1]];
      };

      let dayStart = str.match(/([A-Z]{3})-/);
      dayStart = resolveDay(dayStart) || 0;

      let dayEnd = str.match(/-([A-Z]{3})/);
      dayEnd = resolveDay(dayEnd) || 6;

      let timeStart = str.match(/([0-9]{2}:[0-9]{2})(am|pm)-/);
      timeStart = timeStart ? timeStart[1] + timeStart[2] : null;

      let timeEnd = str.match(/-([0-9]{2}:[0-9]{2})(am|pm)/);
      timeEnd = timeEnd ? timeEnd[1] + timeEnd[2] : null;

      return {
        dayStart,
        dayEnd,
        timeStart,
        timeEnd,
        isAvailable,
        usualPrice,
        offerPrice,
        percentOff
      };
    })
    .get();
  return offers;
};

const scrapeDetails = async link => {
  const res = await Axios.get(link);
  const $ = Cheerio.load(res.data);

  let address = $('#about > div > ul > li:nth-child(2) > div > div > p').html();
  address = address.replace(/<br>/g, ', ');

  let tags = $('#about > div > ul > li:nth-child(1) > div > div').text();
  tags = tags.replace(/\s/g, '');
  tags = tags.split(',');

  let images =
    $('img')
      .map((i, elem) => {
        const src = $(elem).attr('src') || '';
        if (src.includes('highlights_image_')) {
          return src;
        }
        return null;
      })
      .get() || [];

  // Remove empty elements
  images = images.filter(Boolean);

  let tos = $('#tnc > div > ul > li > strong')
    .map((i, elem) => $(elem).text())
    .get();

  let daysExpiry = tos
    .map(t => {
      const matches = t.match(/valid for ([0-9]+) days/);
      if (matches && matches !== []) {
        return matches[1];
      }
      return null;
    })
    .filter(Boolean);
  daysExpiry =
    Array.isArray(daysExpiry) && daysExpiry.length > 0
      ? parseInt(daysExpiry[0], 10)
      : null;

  let maxPax = tos
    .map(t => {
      const matches = t.match(/([0-9]+) pax/);
      if (matches && matches !== []) {
        return matches[1];
      }
      return null;
    })
    .filter(Boolean);
  maxPax =
    Array.isArray(maxPax) && maxPax.length > 0 ? parseInt(maxPax[0], 10) : null;

  const offers = await parseOffers($);

  let loc = null;
  try {
    loc = $(
      'body > section > div > div.product-con-left.mt-10.tablet-mt-20.relative > script:nth-child(8)'
    ).get()[0].children[0].data;
    loc = loc.match(/LatLng\((.*)\)/)[1].split(', ');
    loc = [loc[1], loc[0]];
  } catch (e) {}

  return {
    address,
    tags,
    images,
    loc,
    minPax: maxPax,
    validityDays: daysExpiry,
    offers
  };
};

const processResult = async ($, elem) => {
  const titleTag = $(
    'div > div.cf.relative.product-each-top > div > div.details-inner > h4 > a',
    elem
  );

  const title = titleTag.text();
  let link = titleTag.attr('href');
  link = link ? `https://shop.chope.co${link}` : null;
  const details = await scrapeDetails(link);
  return { title, link, ...details };
};

export const scrapeOffers = async (
  opts = {
    page: 1,
    query: null,
    priceMin: 0,
    priceMax: 100
  }
) => {
  const { page, query, priceMin, priceMax } = opts;

  const url = `https://shop.chope.co/collections/all-vouchers?sort_by=null&page=${page}`;
  const res = await Axios.get(url);
  const $ = Cheerio.load(res.data);

  const results = $(
    'body > section.collection-con > div.collection-content.relative > div.container-full > div.cf.collection-content-div.with-padding > ul > li'
  )
    .map((i, elem) => processResult($, elem))
    .get();

  return Promise.all(results);
};

export const scrapeEntry = async (opts = { url: undefined }) => {
  const { url } = opts;
  const res = await Axios.get(url);
  const $ = Cheerio.load(res.data);
};

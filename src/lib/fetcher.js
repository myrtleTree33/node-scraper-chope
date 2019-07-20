import Axios from 'axios';
import Cheerio from 'cheerio';

const scrapeDetails = async link => {
  const res = await Axios.get(link);
  const $ = Cheerio.load(res.data);

  let address = $('#about > div > ul > li:nth-child(2) > div > div > p').html();
  address = address.replace(/<br>/g, ', ');

  let tags = $('#about > div > ul > li:nth-child(1) > div > div').text();
  tags = tags.replace(/\s/g, '');
  tags = tags.split(',');

  return { address, tags };
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

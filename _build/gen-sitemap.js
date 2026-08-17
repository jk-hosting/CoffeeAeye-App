#!/usr/bin/env node
const fs = require('fs');
const S = require('./summary.json');
const D = '2026-08-17';
const B = 'https://coffeeaeye.com';

const urls = [
  ['/', '1.0'],
  ['/grinders/', '0.9'],
  ['/tools/', '0.9'],
  ['/guides/', '0.9'],
  ['/tools/grinder-converter.html', '0.8'],
  ['/tools/brew-ratio-calculator.html', '0.8'],
  ['/tools/extraction-yield-calculator.html', '0.8'],
  ['/tools/four-six-calculator.html', '0.8'],
  ['/guides/v60-dial-in.html', '0.8'],
  ['/guides/four-six-method.html', '0.8'],
  ['/guides/reading-a-coffee-bag-label.html', '0.8'],
  ['/guides/washed-natural-honey-process.html', '0.7'],
  ['/guides/how-long-does-coffee-last.html', '0.7'],
  ['/guides/roast-date-vs-best-before.html', '0.7'],
  ['/scales.html', '0.7'],
  ...S.map((s) => ['/grinders/' + s.id + '.html', '0.7']),
  ['/support.html', '0.5'],
  ['/privacy.html', '0.3'],
];

const body = urls
  .map(
    ([loc, pri]) =>
      `  <url>\n    <loc>${B}${loc}</loc>\n    <lastmod>${D}</lastmod>\n    <priority>${pri}</priority>\n  </url>`
  )
  .join('\n');

fs.writeFileSync(
  __dirname + '/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
);
console.log(urls.length + ' urls');

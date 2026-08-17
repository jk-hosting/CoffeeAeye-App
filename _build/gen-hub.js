#!/usr/bin/env node
/* Generates grinders/index.html from the verified summary produced by gen-grinders.js */
const fs = require('fs');
const path = require('path');
const S = require('./summary.json');

const PLAY = (c) =>
  `https://play.google.com/store/apps/details?id=com.jkhosting.coffeeaeye&referrer=utm_source%3Dcoffeeaeye.com%26utm_medium%3Dweb%26utm_campaign%3D${c}`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const groups = [
  ['Hand grinders', (s) => s.kind.startsWith('Hand')],
  ['Electric — single dose', (s) => s.kind.includes('single dose')],
  ['Electric — hopper', (s) => s.kind.startsWith('Electric') && !s.kind.includes('single dose')],
];

const rows = S.map(
  (s) => `        <tr>
          <td><a href="${s.id}.html">${esc(s.name)}</a></td>
          <td>${esc(s.kind)}</td>
          <td>${esc(s.range)} ${esc(s.unit)}</td>
          <td class="num">${esc(s.aeropress)}</td>
          <td class="num">${esc(s.v60)}</td>
          <td class="num">${esc(s.fp)}</td>
          <td class="num">${s.reachesEspresso ? 'Yes' : 'No'}</td>
        </tr>`
).join('\n');

const cards = groups
  .map(
    ([label, fn]) => `    <h2>${esc(label)}</h2>
    <div class="hubgrid">
${S.filter(fn)
  .map(
    (s) => `      <a class="hubcard" href="${s.id}.html">
        <span class="hk">${esc(s.range)} ${esc(s.unit)}</span>
        <strong>${esc(s.name)}</strong>
        <span class="hd">V60 at ${esc(s.v60)} · French press at ${esc(s.fp)}</span>
      </a>`
  )
  .join('\n')}
    </div>`
  )
  .join('\n\n');

const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': 'https://coffeeaeye.com/grinders/',
      url: 'https://coffeeaeye.com/grinders/',
      name: 'Coffee grinder settings charts',
      description:
        'Grind setting charts for 18 coffee grinders, covering espresso through cold brew, built on a two-anchor mapping with an honest ± band.',
      isPartOf: { '@id': 'https://coffeeaeye.com/#website' },
    },
    {
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListUnordered',
      numberOfItems: S.length,
      itemListElement: S.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${s.name} grind settings`,
        url: `https://coffeeaeye.com/grinders/${s.id}.html`,
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Coffee Aeye', item: 'https://coffeeaeye.com/' },
        { '@type': 'ListItem', position: 2, name: 'Grinders' },
      ],
    },
  ],
};

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Coffee grinder settings charts — 18 grinders, every brew method | Coffee Aeye</title>
<meta name="description" content="Grind setting charts for 18 coffee grinders — Comandante, 1Zpresso, Baratza, Fellow, Niche, DF64, Timemore and more. Espresso to cold brew, with the ± band and calibration for your own unit.">
<link rel="canonical" href="https://coffeeaeye.com/grinders/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Coffee Aeye">
<meta property="og:url" content="https://coffeeaeye.com/grinders/">
<meta property="og:title" content="Coffee grinder settings charts — 18 grinders">
<meta property="og:description" content="Espresso to cold brew on 18 grinders, with an honest ± band and calibration for your own unit.">
<meta property="og:image" content="https://coffeeaeye.com/social-preview.png">
<meta property="og:image:width" content="1280">
<meta property="og:image:height" content="640">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://coffeeaeye.com/social-preview.png">
<meta name="theme-color" content="#0E0B0A">
<link rel="icon" type="image/png" href="../C1.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/site.css">
<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
</head>
<body>

<nav>
  <div class="wrap nav-in">
    <a class="brand" href="../index.html"><img src="../C1.png" alt=""> Coffee Aeye</a>
    <div class="nav-right">
      <a class="nav-link" href="../grinders/">Grinders</a>
      <a class="nav-link" href="../tools/">Tools</a>
      <a class="nav-link" href="../guides/">Guides</a>
      <a class="btn" href="${PLAY('grinders-hub')}">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 2.5v19l16-9.5-16-9.5z"/></svg>
        Get the app
      </a>
    </div>
  </div>
</nav>

<main>
  <div class="wrap">
    <div class="crumb"><a href="../index.html">Coffee Aeye</a> → Grinders</div>
    <div class="eyebrow">Grind charts</div>
    <h1>Grinder settings, ${S.length} grinders.</h1>
    <p class="lead">Every chart here is built the same way: two documented anchors — where espresso sits and where French press sits — with everything in between interpolated and quantised to what the dial can actually resolve. Starting points with an honest ± band, not targets.</p>

    <h2>All ${S.length} at a glance</h2>
    <div class="tablewrap">
      <table>
        <thead><tr><th>Grinder</th><th>Type</th><th>Range</th><th class="num">AeroPress</th><th class="num">V60</th><th class="num">French press</th><th class="num">Espresso?</th></tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>
    </div>
    <p class="note">One grinder in this list cannot reach an espresso grind at all. That is a property of the machine, not a gap in the data — the Fellow Ode is a brew-only grinder and its page says so plainly.</p>

${cards}

    <h2>Why settings never transfer between grinders</h2>
    <p>A click is not a unit. On a 1Zpresso JX-Pro one click moves the burrs about 12.5 µm; on a J-Max S it moves them 8.8 µm; on a Comandante it is different again, and on a stepless DF64 there are no clicks at all — just a reference scale whose zero point drifts from unit to unit. That is why a "20 clicks" recipe is meaningless without naming the grinder, and why the same coffee lands at 18 on a C40, 46 on a JX-Pro and 3.5 on a Fellow Ode.</p>
    <p>The <a href="../tools/grinder-converter.html">grinder converter</a> maps a setting from any grinder here onto any other through the shared universal scale these charts are built on.</p>

    <h2>Calibrate, then trust the chart</h2>
    <p>Published charts get the shape right — correct spacing between methods, correct direction of travel. What they cannot know is your unit's zero point, your burr wear, or whether the burrs are stock at all. Set your own espresso and French-press marks once and the whole chart re-derives around them, correcting both the offset and the slope in a single step.</p>

    <div class="callout">
      <div class="k">In the app</div>
      <p>Coffee Aeye carries all ${S.length} charts, plus a custom-grinder path for anything not on this list. Rate a brew and it turns the fault you tasted into a concrete move — how many clicks, which direction, on your dial. Modified burrs? It knows the published chart no longer applies and falls back to a descriptor rather than quoting you a false number. <a href="${PLAY('grinders-hub-body')}">Get it on Google Play</a> — €4.29, one-time, no subscription.</p>
    </div>

    <h2>Not on the list?</h2>
    <p>These ${S.length} are the grinders with well-documented community charts to anchor against. Anything else belongs in the app's custom-grinder path, where you enter your own dial range and your own two anchors and get the same mapping built around your machine. Guessing at a chart for an undocumented grinder would be inventing data, so this list stays short on purpose.</p>
  </div>
</main>

<footer>
  <div class="wrap">
    <span class="wordmark">Coffee Aeye</span>
    <div class="sub">The whole coffee journey, from bag label to golden cup.</div>
    <div class="flinks">
      <a href="../index.html">Home</a>
      <a href="../grinders/">Grinders</a>
      <a href="../tools/">Tools</a>
      <a href="../guides/">Guides</a>
      <a href="../scales.html">Scales</a>
      <a href="../support.html">Support</a>
      <a href="../privacy.html">Privacy</a>
    </div>
  </div>
</footer>

<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "0793fe8619e844cd85e90b7dcfdef5f3"}'></script>
</body>
</html>
`;

fs.mkdirSync(path.join(__dirname, 'out', 'grinders'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'out', 'grinders', 'index.html'), html);
console.log('hub written');

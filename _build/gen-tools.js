#!/usr/bin/env node
/* Builds tools/grinder-converter.html with specs injected from grinder_specs.dart's port. */
const fs = require('fs');
const path = require('path');
const SPECS = require('./specs.json');

const OUT = path.join(__dirname, 'out', 'tools');
fs.mkdirSync(OUT, { recursive: true });

const PLAY = (c) =>
  `https://play.google.com/store/apps/details?id=com.jkhosting.coffeeaeye&referrer=utm_source%3Dcoffeeaeye.com%26utm_medium%3Dweb%26utm_campaign%3D${c}`;

const NAV = (depth, campaign) => `<nav>
  <div class="wrap nav-in">
    <a class="brand" href="${depth}index.html"><img src="${depth}C1.png" alt=""> Coffee Aeye</a>
    <div class="nav-right">
      <a class="nav-link" href="${depth}grinders/">Grinders</a>
      <a class="nav-link" href="${depth}tools/">Tools</a>
      <a class="nav-link" href="${depth}guides/">Guides</a>
      <a class="btn" href="${PLAY(campaign)}">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 2.5v19l16-9.5-16-9.5z"/></svg>
        Get the app
      </a>
    </div>
  </div>
</nav>`;

const FOOT = (depth) => `<footer>
  <div class="wrap">
    <span class="wordmark">Coffee Aeye</span>
    <div class="sub">The whole coffee journey, from bag label to golden cup.</div>
    <div class="flinks">
      <a href="${depth}index.html">Home</a>
      <a href="${depth}grinders/">Grinders</a>
      <a href="${depth}tools/">Tools</a>
      <a href="${depth}guides/">Guides</a>
      <a href="${depth}scales.html">Scales</a>
      <a href="${depth}support.html">Support</a>
      <a href="${depth}privacy.html">Privacy</a>
    </div>
  </div>
</footer>`;

const HEAD = ({ title, desc, canon, ogtitle, ogdesc, depth, ld }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${canon}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Coffee Aeye">
<meta property="og:url" content="${canon}">
<meta property="og:title" content="${ogtitle}">
<meta property="og:description" content="${ogdesc}">
<meta property="og:image" content="https://coffeeaeye.com/social-preview.png">
<meta property="og:image:width" content="1280">
<meta property="og:image:height" content="640">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://coffeeaeye.com/social-preview.png">
<meta name="theme-color" content="#0E0B0A">
<link rel="icon" type="image/png" href="${depth}C1.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${depth}assets/site.css">
<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
</head>
<body>`;

const webApp = (name, url, desc) => ({
  '@type': 'WebApplication',
  name,
  url,
  description: desc,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  publisher: { '@id': 'https://coffeeaeye.com/#publisher' },
});
const crumbs = (leaf, leafUrl) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Coffee Aeye', item: 'https://coffeeaeye.com/' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://coffeeaeye.com/tools/' },
    { '@type': 'ListItem', position: 3, name: leaf },
  ],
});

// ---------------------------------------------------------------- converter
const converter = `${HEAD({
  title: 'Grinder setting converter — move a grind setting between 18 grinders | Coffee Aeye',
  desc: 'Convert a grind setting from one coffee grinder to another. Comandante to 1Zpresso, Baratza to Fellow, DF64 to Niche — 18 grinders mapped through one universal scale.',
  canon: 'https://coffeeaeye.com/tools/grinder-converter.html',
  ogtitle: 'Grinder setting converter — 18 grinders, one scale',
  ogdesc: 'Comandante to 1Zpresso, Baratza to Fellow, DF64 to Niche. Convert a grind setting between any two grinders.',
  depth: '../',
  ld: {
    '@context': 'https://schema.org',
    '@graph': [
      webApp(
        'Grinder setting converter',
        'https://coffeeaeye.com/tools/grinder-converter.html',
        'Converts a grind setting from one coffee grinder to another across 18 supported grinders using a two-anchor universal grind scale.'
      ),
      crumbs('Grinder converter'),
    ],
  },
})}

${NAV('../', 'tool-grinder-converter')}

<main>
  <div class="wrap">
    <div class="crumb"><a href="../index.html">Coffee Aeye</a> → <a href="../tools/">Tools</a> → Grinder converter</div>
    <div class="eyebrow">Free tool</div>
    <h1>Grinder setting converter.</h1>
    <p class="lead">You found a recipe written for a grinder you do not own. This maps that setting onto yours — through the same two-anchor universal scale the app uses, across all 18 supported grinders.</p>

    <div class="calc">
      <div class="calcgrid">
        <div class="field">
          <label for="from">From grinder</label>
          <select id="from"></select>
        </div>
        <div class="field">
          <label for="fromval">Its setting</label>
          <input id="fromval" type="number" inputmode="decimal" step="any" value="18">
          <span class="hint" id="fromhint"></span>
        </div>
        <div class="field">
          <label for="to">To grinder</label>
          <select id="to"></select>
        </div>
      </div>
      <div class="out">
        <div class="outrow">
          <div class="outbox">
            <div class="ok">Equivalent setting</div>
            <div class="ov" id="result">—</div>
            <div class="os" id="resultsub">—</div>
          </div>
          <div class="outbox">
            <div class="ok">Universal grind</div>
            <div class="ov" id="universal">—</div>
            <div class="os" id="descriptor">—</div>
          </div>
        </div>
        <div class="verdict" id="verdict"></div>
      </div>
    </div>

    <h2>How the conversion works</h2>
    <p>There is no direct formula between two grinders, because a click on one is not a click on the other. What there is, for each grinder, is two reasonably well-documented reference points: where espresso sits on its dial, and where French press sits. Fix those two and you have a line — a mapping between that grinder's dial and a shared 1–10 scale.</p>
    <p>Converting is then two steps. Read the source setting onto the universal scale, then read the universal value back down onto the target dial, quantised to the step the target can actually resolve. Every number this tool produces carries a ± band for the same reason the <a href="../grinders/">grind charts</a> do — one step of the target dial is the honest resolution of the answer.</p>

    <h2>What it cannot know</h2>
    <p>This is an interpolation between two documented points, not a measurement. It does not know your burr wear, your unit's zero point, or whether your burrs are stock. Three things break it outright:</p>
    <ul>
      <li><strong>Modified burrs.</strong> An SSP or third-party burr set changes the particle distribution at any given gap, so the published anchors no longer describe the machine. The number will be wrong and there is no correction factor that fixes it — you have to re-anchor from your own dial positions.</li>
      <li><strong>Accessories that change click size.</strong> A Comandante with Red Clix has roughly half the click size it left the factory with, which roughly doubles every number.</li>
      <li><strong>Stepless dials that have been reassembled.</strong> On a DF64 or Niche the zero point is set by hand. Two units genuinely disagree about what "20" means.</li>
    </ul>
    <p>Treat the output as a starting point, brew, and let taste move you from there. The <a href="../guides/v60-dial-in.html">dial-in guide</a> covers which direction to move and by how much.</p>

    <div class="callout">
      <div class="k">In the app</div>
      <p>Coffee Aeye does this conversion on every recipe automatically — every brew you open shows the grind in <em>your</em> grinder's numbers, not the recipe author's. Calibrate your own two anchors once and the whole library re-derives around your machine. Rate a brew and it tells you how many clicks to move, which direction, on your dial. <a href="${PLAY('tool-converter-body')}">Get it on Google Play</a> — €4.29, one-time.</p>
    </div>

    <h2>More tools</h2>
    <div class="hubgrid">
      <a class="hubcard" href="brew-ratio-calculator.html"><span class="hk">Calculator</span><strong>Brew ratio</strong><span class="hd">Dose, water and ratio — solve for any one</span></a>
      <a class="hubcard" href="extraction-yield-calculator.html"><span class="hk">Calculator</span><strong>Extraction yield</strong><span class="hd">TDS and beverage weight to EY%</span></a>
      <a class="hubcard" href="four-six-calculator.html"><span class="hk">Calculator</span><strong>4:6 method</strong><span class="hd">Six pours, weighed and timed</span></a>
    </div>
  </div>
</main>

${FOOT('../')}

<script>
(function(){
  var SPECS = ${JSON.stringify(SPECS)};
  var U_ESP = 2.0, U_FP = 8.5;
  var DESC = [[1,'extra fine'],[2,'fine'],[3.5,'medium-fine'],[5,'medium'],[6.5,'medium-coarse'],[8,'coarse'],[10,'extra coarse']];

  function dartRound(x){ return x < 0 ? -Math.round(-x) : Math.round(x); }
  function clamp(v,lo,hi){ return Math.min(Math.max(v,lo),hi); }
  function slope(s){ return (s.frenchPress - s.espresso) / (U_FP - U_ESP); }

  function universalFor(s, setting){
    return clamp(U_ESP + (setting - s.espresso) / slope(s), 1, 10);
  }
  function resolve(s, u){
    var raw = s.espresso + (u - U_ESP) * slope(s);
    var v = s.step > 0 ? dartRound(raw / s.step) * s.step : raw;
    return {
      setting: clamp(v, s.min, s.max),
      band: s.step > 0 ? s.step : 1,
      below: raw < s.min - 1e-9,
      above: raw > s.max + 1e-9
    };
  }
  function fmt(s, v){
    var whole = s.step > 0 && s.step % 1 === 0;
    return (whole || v % 1 === 0) ? String(dartRound(v)) : v.toFixed(1);
  }
  function descriptorFor(u){
    var best = DESC[0], bd = Math.abs(u - best[0]);
    for (var i=1;i<DESC.length;i++){
      var d = Math.abs(u - DESC[i][0]);
      if (d < bd){ best = DESC[i]; bd = d; }
    }
    return best[1];
  }

  var $ = function(id){ return document.getElementById(id); };
  var from = $('from'), to = $('to'), fromval = $('fromval');

  SPECS.forEach(function(s, i){
    from.add(new Option(s.name, String(i)));
    to.add(new Option(s.name, String(i)));
  });
  from.value = '0';                                  // Comandante C40
  to.value = String(SPECS.findIndex(function(s){ return s.id === '1zpresso-jx-pro'; }));

  function update(){
    var a = SPECS[+from.value], b = SPECS[+to.value];
    $('fromhint').textContent = a.min + '–' + a.max + ' ' + a.unit +
      ', step ' + (a.step % 1 === 0 ? a.step : a.step) + '';

    var raw = parseFloat(fromval.value);
    if (isNaN(raw)){
      $('result').textContent = '—'; $('resultsub').textContent = '—';
      $('universal').textContent = '—'; $('descriptor').textContent = '—';
      $('verdict').textContent = 'Enter a setting to convert.';
      return;
    }

    var clamped = clamp(raw, a.min, a.max);
    var u = universalFor(a, clamped);
    var r = resolve(b, u);

    $('universal').textContent = u.toFixed(1) + ' / 10';
    $('descriptor').textContent = descriptorFor(u);

    if (a.id === b.id){
      $('result').textContent = fmt(b, r.setting) + ' ' + b.unit;
      $('resultsub').textContent = 'same grinder';
      $('verdict').innerHTML = 'Same grinder in and out — pick a different target to convert.';
      return;
    }

    $('result').textContent = fmt(b, r.setting) + (r.below || r.above ? '' : ' ± ' + fmt(b, r.band));
    $('resultsub').textContent = b.short + ' ' + b.unit;

    var msg;
    if (r.below){
      msg = '<strong>Out of range.</strong> ' + a.short + ' ' + fmt(a, clamped) + ' is finer than the ' +
        b.name + ' physically reaches. ' + fmt(b, r.setting) + ' is as fine as it goes.';
    } else if (r.above){
      msg = '<strong>Out of range.</strong> ' + a.short + ' ' + fmt(a, clamped) + ' is coarser than the ' +
        b.name + ' physically reaches. ' + fmt(b, r.setting) + ' is as coarse as it goes.';
    } else {
      msg = '<strong>' + a.short + ' ' + fmt(a, clamped) + '</strong> lands at roughly a ' + descriptorFor(u) +
        ' grind — about <strong>' + fmt(b, r.setting) + ' ± ' + fmt(b, r.band) + ' ' + b.unit +
        '</strong> on the ' + b.name + '. Start there, brew, and adjust by taste.';
    }
    if (raw !== clamped){
      msg += ' <span class="edge">(Input clamped to the ' + a.short + " dial's " + a.min + '–' + a.max + ' range.)</span>';
    }
    $('verdict').innerHTML = msg;
  }

  from.addEventListener('change', update);
  to.addEventListener('change', update);
  fromval.addEventListener('input', update);
  update();
})();
</script>
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "0793fe8619e844cd85e90b7dcfdef5f3"}'></script>
</body>
</html>
`;

fs.writeFileSync(path.join(OUT, 'grinder-converter.html'), converter);
console.log('grinder-converter.html written');

#!/usr/bin/env node
/* Generates static grinder pages for coffeeaeye.com from a faithful port of
   lib/services/grinder_specs.dart (settingFor / resolve / formatBand). */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'out', 'grinders');
fs.mkdirSync(OUT, { recursive: true });

const U_ESP = 2.0, U_FP = 8.5;

// ---- exact port of GrinderSpec maths -------------------------------------
const dartRound = (x) => (x < 0 ? -Math.round(-x) : Math.round(x));
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

function resolve(spec, universal) {
  const slope = (spec.frenchPress - spec.espresso) / (U_FP - U_ESP);
  const raw = spec.espresso + (universal - U_ESP) * slope;
  let s = raw;
  if (spec.step > 0) s = dartRound(s / spec.step) * spec.step;
  return {
    setting: clamp(s, spec.min, spec.max),
    band: spec.step > 0 ? spec.step : 1,
    belowRange: raw < spec.min - 1e-9,
    aboveRange: raw > spec.max + 1e-9,
  };
}
function formatSetting(spec, s) {
  const wholeSteps = spec.step > 0 && spec.step % 1 === 0;
  return wholeSteps || s % 1 === 0 ? String(dartRound(s)) : s.toFixed(1);
}
function formatBand(spec, universal) {
  const r = resolve(spec, universal);
  if (r.belowRange) return `${formatSetting(spec, r.setting)} <span class="edge">(finest)</span>`;
  if (r.aboveRange) return `${formatSetting(spec, r.setting)} <span class="edge">(coarsest)</span>`;
  return `${formatSetting(spec, r.setting)} ± ${formatSetting(spec, r.band)}`;
}
function clicksPerUniversal(spec) {
  const slope = (spec.frenchPress - spec.espresso) / (U_FP - U_ESP);
  return slope;
}

// ---- method rows ----------------------------------------------------------
const METHODS = [
  { name: 'Espresso', u: 2.0, note: 'anchor' },
  { name: 'Moka pot', u: 3.0 },
  { name: 'AeroPress (short, fine)', u: 3.5 },
  { name: 'V60 / pour-over', u: 4.5 },
  { name: 'Kalita Wave', u: 5.0 },
  { name: 'Chemex / batch drip', u: 5.5 },
  { name: 'Clever / switch immersion', u: 6.5 },
  { name: 'French press', u: 8.5, note: 'anchor' },
  { name: 'Cold brew', u: 9.5 },
];

// ---- the 18 seeded specs, verbatim from grinder_specs.dart ----------------
// plus per-grinder editorial that makes each page genuinely distinct.
const SPECS = [
  {
    id: 'comandante-c40', name: 'Comandante C40', short: 'C40', unit: 'clicks',
    min: 0, max: 40, step: 1, espresso: 10, frenchPress: 32,
    kind: 'Hand grinder', burrs: '39 mm high-nitrogen steel conical',
    blurb: 'The reference hand grinder for filter coffee, and the dial most community charts are written against.',
    mechanics: `The adjustment knob sits under the burr assembly. Zero is burr contact — turn it fully closed until the burrs just touch, then count clicks outward. Every number on this page is a count from that closed position, so a C40 that has been reassembled needs re-zeroing before the chart means anything.`,
    quirks: [
      ['The Red Clix accessory changes every number on this page.', 'The RX35 axle roughly halves the size of one click, so the same grind lands at roughly double the click count. If you run Red Clix, do not use the table above — calibrate your own two anchors instead and the whole chart rescales itself.'],
      ['It does not really do espresso.', 'The chart puts espresso around 10 clicks and it will physically get there, but the C40 is a filter grinder with filter burr geometry. Treat anything under about 12 as a moka-pot floor rather than a genuine espresso range.'],
      ['Click feel degrades before grind quality does.', 'The detents soften with heavy use long before the burrs dull. If clicks start feeling vague, count carefully rather than by touch.'],
    ],
  },
  {
    id: 'timemore-c2-c3', name: 'Timemore Chestnut C2 / C3', short: 'C2', unit: 'clicks',
    min: 0, max: 36, step: 1, espresso: 10, frenchPress: 28,
    kind: 'Hand grinder', burrs: 'Stainless steel conical (S2C on the C3)',
    blurb: 'The budget hand grinder that made decent pour-over grinding cheap. C2 and C3 share a dial, so one chart covers both.',
    mechanics: `Adjustment is a click wheel below the burr, zeroed at burr contact like the Comandante. Close it fully, then count out. The C3 uses a revised burr set but the same click pitch, which is why both share a single chart here.`,
    quirks: [
      ['C2 and C3 map the same. The C3 ESP does not.', 'The espresso variant ships a finer click pitch specifically to give usable resolution under about 12 clicks. If you have the ESP, calibrate your own anchors rather than using this table.'],
      ['Usable range is narrower than the dial suggests.', 'Past roughly 30 clicks the burrs are far enough apart that the grind gets ragged. French press works; cold brew at the coarse end is where this grinder shows its price.'],
      ['Axle play affects repeatability.', 'There is more shaft flex here than in the Comandante or 1Zpresso. Grind with light, steady pressure rather than forcing it, and your settings will repeat better.'],
    ],
  },
  {
    id: 'timemore-sculptor-078', name: 'Timemore Sculptor 078', short: '078', unit: 'dial',
    min: 0, max: 10, step: 0.5, espresso: 2, frenchPress: 9.5,
    kind: 'Electric', burrs: '64 mm flat',
    blurb: 'Timemore\'s 64 mm flat-burr home grinder, dialled on a marked 0–10 collar in half-number steps.',
    mechanics: `A numbered collar reads 0 to 10 with printed graduations. The app quantises to half a number because that is the finest graduation you can reliably return to by eye. Finer resolution exists physically but you cannot repeat it, so the chart does not pretend you can.`,
    quirks: [
      ['Flat burrs want a running start.', 'Adjust while the motor is running, and always approach your target setting from the coarse side. Coming down from coarse loads the burrs consistently; coming up from fine leaves grounds packed in the gap and the setting reads differently next time.'],
      ['Half a number is a real step.', 'On a 0–10 collar spanning the whole brewing range, 0.5 covers a meaningful chunk of extraction. Expect one half-step to move the cup more than two or three clicks would on a hand grinder.'],
      ['Purge between coffees.', 'A 64 mm flat burr set holds enough retained grounds to muddy the first few grams of a new bag.'],
    ],
  },
  {
    id: 'timemore-sculptor-078s', name: 'Timemore Sculptor 078S', short: '078S', unit: 'dial',
    min: 0, max: 10, step: 0.5, espresso: 1.5, frenchPress: 9,
    kind: 'Electric', burrs: '64 mm flat, espresso-leaning geometry',
    blurb: 'The espresso-biased sibling of the 078. Same collar, shifted burr set — which is why its chart is not the 078\'s chart.',
    mechanics: `Identical 0–10 collar in half-number graduations, but the burr geometry sits finer at any given number. Both anchors move down relative to the 078: espresso lands near 1.5 rather than 2, French press near 9 rather than 9.5. Using the 078 chart on an 078S will run you consistently coarse.`,
    quirks: [
      ['The whole usable brew range is compressed.', 'Because the burr set is biased toward espresso, filter methods bunch into the top half of the collar. Small dial moves do more at the coarse end than they would on the 078.'],
      ['This is the one Timemore where espresso is genuinely on the table.', 'The 078S reaches and holds a real espresso grind, which the plain 078 does only marginally.'],
      ['Do not carry settings across from an 078.', 'They look like the same grinder and share a chassis. They do not share a chart.'],
    ],
  },
  {
    id: 'baratza-encore', name: 'Baratza Encore', short: 'Encore', unit: 'setting',
    min: 0, max: 40, step: 1, espresso: 7, frenchPress: 32,
    kind: 'Electric', burrs: '40 mm conical (M2)',
    blurb: 'The default first electric grinder in the English-speaking world, and the chart most beginner recipes assume.',
    mechanics: `Forty stepped positions on a rotating hopper collar. Steps are physical detents, so the setting is unambiguous — turn the hopper until the number lines up with the mark. Unlike the hand grinders here there is no zeroing procedure; the numbers are factory-referenced.`,
    quirks: [
      ['Espresso is not really in range.', 'The chart puts espresso around setting 7 and the Encore will reach it, but output at that end is inconsistent enough that most people find it unusable for a real espresso shot. The Encore is a brew grinder. The ESP variant exists precisely because of this.'],
      ['Unit-to-unit variance is genuinely wide.', 'Burr holder alignment varies more on the Encore than on any other grinder in this list. Two Encores at setting 20 can taste half a step apart, which is exactly why calibrating your own anchors is worth more here than anywhere else.'],
      ['It is fully rebuildable, and that matters.', 'Burrs are a user-replaceable part. A worn set drifts coarse at every number — if your old settings suddenly taste sour, suspect the burrs before you suspect the chart.'],
    ],
  },
  {
    id: 'baratza-virtuoso-plus', name: 'Baratza Virtuoso+', short: 'Virtuoso', unit: 'setting',
    min: 0, max: 40, step: 1, espresso: 7, frenchPress: 31,
    kind: 'Electric', burrs: '40 mm conical, hardened',
    blurb: 'The Encore\'s step up: same 40-position collar, better burr geometry and a tighter particle spread.',
    mechanics: `The same forty stepped positions as the Encore, so the two look interchangeable — but the Virtuoso+ hardened burr set runs marginally finer at the coarse end, which is why French press anchors at 31 here and 32 on the Encore. Small difference, real difference.`,
    quirks: [
      ['Nearly the Encore chart, deliberately not identical.', 'One position of divergence at the coarse anchor is not a rounding artefact — it is the burr geometry. Do not substitute one chart for the other on the assumption they are the same machine.'],
      ['The digital timer is a repeatability trap.', 'Timed dosing drifts as beans age and degas. Weigh your dose; use the timer as a convenience, not a measurement.'],
      ['Cleaner at filter settings than the Encore.', 'The tighter distribution shows up most between about 18 and 26 — the pour-over band. That is the range you are paying the difference for.'],
    ],
  },
  {
    id: 'fellow-ode-gen2', name: 'Fellow Ode Gen 2', short: 'Ode', unit: 'dial',
    min: 1, max: 11, step: 0.5, espresso: 0, frenchPress: 9,
    kind: 'Electric', burrs: '64 mm flat',
    blurb: 'A brew-only 64 mm flat-burr grinder. It does not do espresso, and this page does not pretend otherwise.',
    mechanics: `An 11-position dial with half-step detents between the printed numbers. The espresso anchor for this grinder sits at 0 — below the dial's physical floor of 1 — because the Ode cannot reach an espresso grind at all. Anything the app resolves below 1 is reported as "finest" rather than quoted as a real number.`,
    quirks: [
      ['It genuinely cannot grind espresso.', 'This is a design decision, not a limitation to work around. Setting 1 is roughly a moka-pot fine. There is no burr swap or adjustment that makes an Ode an espresso grinder.'],
      ['Gen 2 burrs are not Gen 1 burrs.', 'The second-generation burr set was redesigned for filter clarity and sits differently on the dial. If you upgraded a Gen 1 with Gen 2 burrs, re-anchor rather than trusting either chart.'],
      ['Almost no retention, so no purge tax.', 'The single-dose design and near-zero retention mean the first gram out is the same as the last. Changing between bags costs you nothing.'],
    ],
  },
  {
    id: 'fellow-opus', name: 'Fellow Opus', short: 'Opus', unit: 'dial',
    min: 1, max: 11, step: 0.5, espresso: 2, frenchPress: 9,
    kind: 'Electric', burrs: '40 mm conical',
    blurb: 'Fellow\'s all-methods conical grinder — the Ode\'s stablemate, but with espresso genuinely inside the range.',
    mechanics: `An outer collar numbered 1 to 11 with half-step graduations, plus a micro-adjust ring inside the hopper. This chart addresses the outer collar only; the micro-adjust is a fine trim on top of it, and folding it into a published chart would create precision that does not survive a hopper removal.`,
    quirks: [
      ['Same dial numbers as the Ode. Completely different grinder.', '40 mm conical against the Ode\'s 64 mm flat. The dials look identical and the results are not remotely comparable. Never carry a setting between them.'],
      ['Espresso is real here, at the very bottom.', 'Around setting 2 with the micro-adjust engaged. Tight, but genuinely usable — the Ode\'s single biggest gap, closed.'],
      ['The micro-adjust resets when you pull the hopper.', 'If you clean it, re-set the inner ring before trusting your old numbers.'],
    ],
  },
  {
    id: 'niche-zero', name: 'Niche Zero', short: 'Niche', unit: 'setting',
    min: 0, max: 50, step: 1, espresso: 12, frenchPress: 40,
    kind: 'Electric, single dose', burrs: '63 mm conical',
    blurb: 'A stepless single-dose conical grinder with famously near-zero retention, dialled on a 0–50 collar.',
    mechanics: `The collar is stepless — the printed 0–50 numbers are reference marks on a continuous adjustment, not detents. The app quantises to whole numbers because that is what you can read off the collar and return to. You can sit between numbers; you just cannot reliably find that spot again.`,
    quirks: [
      ['Near-zero retention is the whole point, and it changes how you dial.', 'What you put in comes out. There is no purge, no stale carry-over between bags, and no reason to grind a throwaway few grams when you change coffee. Single-dose weighing in gives you single-dose accuracy out.'],
      ['Stepless means your reference marks are yours.', 'Two Niches at "20" are close but not identical, because there are no detents forcing agreement. Calibrating your own espresso and French-press marks is more valuable on this grinder than on any stepped one here.'],
      ['One collar covers espresso to French press honestly.', 'The 63 mm conical set has a genuinely wide usable range — unusual, and the reason the anchors sit as far apart as 12 and 40.'],
    ],
  },
  {
    id: 'df64', name: 'DF64 Gen 1', short: 'DF64', unit: 'setting',
    min: 0, max: 90, step: 1, espresso: 15, frenchPress: 70,
    kind: 'Electric, single dose', burrs: '64 mm flat',
    blurb: 'The original 64 mm flat single-doser. Stepless worm-gear dial with a wide 0–90 reference scale.',
    mechanics: `A worm-gear adjustment turns a continuous collar reading 0 to 90. It is stepless: the numbers are a reference scale, not detents. Because the zero point is set at assembly and drifts with burr seating, two DF64s rarely agree on the same number — this chart is a starting shape, and your own calibration is what makes it accurate.`,
    quirks: [
      ['Per-unit zero drift is the defining quirk.', 'More than any other grinder in this list, the published number is a suggestion. Find your own burr-contact zero, set your own two anchors, and the 0–90 scale becomes genuinely precise.'],
      ['Retention needs managing on Gen 1.', 'The original chute holds grounds. A bellows or a firm tap recovers most of it; without one, expect the first gram of a new bag to carry the last one.'],
      ['Ninety reference points is real resolution.', 'Once calibrated, this scale resolves finer than almost anything else here. The wide anchors — 15 to 70 — are what that resolution buys you.'],
    ],
  },
  {
    id: 'df64-gen2', name: 'DF64 Gen 2', short: 'DF64 G2', unit: 'setting',
    min: 0, max: 90, step: 1, espresso: 15, frenchPress: 70,
    kind: 'Electric, single dose', burrs: '64 mm flat',
    blurb: 'The revised DF64: same worm-gear scale and the same chart, with the Gen 1\'s retention problem largely engineered out.',
    mechanics: `Mechanically the same stepless worm-gear collar reading 0 to 90, which is why the anchors are unchanged from Gen 1. The revision is in the grounds path, not the adjustment, so the mapping carries over exactly.`,
    quirks: [
      ['Identical chart to Gen 1, deliberately.', 'The adjustment mechanism did not change. If a page tells you Gen 2 needs different numbers, it is guessing.'],
      ['Retention is largely solved.', 'The redesigned chute and declumping mean the purge routine Gen 1 owners built habits around is mostly unnecessary here.'],
      ['Zero point still drifts per unit.', 'The revision did not change this. Calibrate your own anchors — it remains the single highest-value thing a DF64 owner can do.'],
    ],
  },
  {
    id: 'df64v', name: 'DF64V', short: 'DF64V', unit: 'setting',
    min: 0, max: 90, step: 1, espresso: 15, frenchPress: 70,
    kind: 'Electric, single dose, variable RPM', burrs: '64 mm flat',
    blurb: 'The variable-speed DF64. Same adjustment scale as its siblings, plus a burr speed control that the chart deliberately ignores.',
    mechanics: `The same stepless 0–90 worm-gear collar, so the same anchors apply. What is different is burr RPM, which is adjustable independently of gap — and which changes the particle distribution without changing the number on the collar.`,
    quirks: [
      ['RPM changes the cup without changing the setting.', 'This is the thing to understand about the V. Slower burr speed shifts the distribution, typically reducing fines. Your dial number stays put while the coffee tastes different — which breaks the usual "one variable at a time" logic unless you fix RPM first.'],
      ['Dial in at a fixed RPM, always.', 'Pick a speed, leave it, and dial the gap. Treat RPM as a setup decision rather than a brewing variable, or you will never isolate what moved.'],
      ['Chart is shared with Gen 1 and Gen 2 for a reason.', 'The gap adjustment is unchanged across the family. Only the motor is new.'],
    ],
  },
  {
    id: '1zpresso-jx-pro', name: '1Zpresso JX-Pro', short: 'JX-Pro', unit: 'clicks',
    min: 0, max: 120, step: 1, espresso: 22, frenchPress: 85,
    kind: 'Hand grinder', burrs: '48 mm conical',
    blurb: 'A hand grinder with an external numbered dial and 12.5 µm per click — fine enough resolution that filter dial-in stops being guesswork.',
    mechanics: `Adjustment is an external ring at the base with a numbered scale, so you can read your setting without disassembly — a real advantage over the under-burr knob on most hand grinders. One click is roughly 12.5 µm of burr gap. Zero is burr contact.`,
    quirks: [
      ['12.5 µm per click means clicks are small.', 'The numbers on this chart look large next to a Comandante\'s because each one does less. Do not scale a C40 setting onto a JX-Pro by eye — 20 clicks here is nothing like 20 clicks there.'],
      ['Do not carry settings to a J-Max.', 'The J-Max S runs 8.8 µm per click. Same brand, same burr size, entirely different chart. This is the single most common cross-grinder mistake in this range.'],
      ['External dial makes repeatability easy.', 'Because you can read the setting without pulling the grinder apart, logging exact numbers per bag is realistic here in a way it is not on an under-burr adjuster.'],
    ],
  },
  {
    id: '1zpresso-jmax-s', name: '1Zpresso J-Max S', short: 'J-Max', unit: 'clicks',
    min: 0, max: 170, step: 1, espresso: 31, frenchPress: 120,
    kind: 'Hand grinder', burrs: '48 mm conical, espresso-capable',
    blurb: 'The fine-resolution 1Zpresso: 8.8 µm per click, which is why every number here is higher than on the JX-Pro.',
    mechanics: `An external numbered ring like the JX-Pro, but with a finer thread pitch — 8.8 µm per click against the JX-Pro's 12.5 µm. The same physical grind size therefore lands at a noticeably higher click count, and the anchors scale accordingly: espresso at 31, French press at 120.`,
    quirks: [
      ['This is where the espresso resolution lives.', 'At 8.8 µm a click, you get genuinely fine control across the espresso band — the reason to choose a J-Max over a JX-Pro.'],
      ['Every JX-Pro number is wrong here, by about 40%.', 'The ratio between the two click sizes is what separates the charts. Reading across from a JX-Pro will land you far too coarse.'],
      ['The coarse end is long but rarely used.', 'French press at 120 of a possible 170 means the top third of the dial exists mainly for cold brew.'],
    ],
  },
  {
    id: 'kinu-m47', name: 'Kinu M47 (Classic / Phoenix)', short: 'M47', unit: 'dial',
    min: 0, max: 9, step: 0.25, espresso: 2.75, frenchPress: 6.75,
    kind: 'Hand grinder', burrs: '47 mm conical',
    blurb: 'A stepless hand grinder counted in full rotations of a numbered collar rather than in clicks.',
    mechanics: `The M47 has no clicks. Adjustment is a numbered collar you count in whole turns from burr contact, and the chart is expressed in rotations — espresso at 2.75 turns, French press at 6.75. The app quantises to a quarter turn, which is the finest division you can find repeatably on the collar markings.`,
    quirks: [
      ['Rotations, not clicks — the units are the trap.', 'Someone reading "3" on this chart and "30" on a Comandante chart is looking at two completely different kinds of number. Here, 3 means three full turns of the collar.'],
      ['Stepless means no detents to protect you.', 'Nothing holds the setting mechanically. Check your collar position before each session, especially after transport.'],
      ['The whole brewing range fits in four turns.', 'From espresso at 2.75 to French press at 6.75. A quarter turn is a substantial move — treat it the way you would treat three or four clicks elsewhere.'],
    ],
  },
  {
    id: 'mahlkonig-x54', name: 'Mahlkönig X54', short: 'X54', unit: 'dial',
    min: 1, max: 10, step: 0.5, espresso: 2, frenchPress: 8.5,
    kind: 'Electric', burrs: '54 mm flat',
    blurb: 'Mahlkönig\'s home all-rounder: 54 mm flat burrs on a 1–10 collar with half-step graduations.',
    mechanics: `A stepped collar reading 1 to 10 with half-number graduations. The scale is designed to cover espresso through French press in a single sweep, which is why the anchors sit at 2 and 8.5 — nearly the full dial.`,
    quirks: [
      ['The whole dial is in use, so half-steps matter.', 'With espresso at 2 and French press at 8.5, a single half-step is a real jump in extraction. Move one graduation at a time and taste before moving again.'],
      ['Flat burrs, so approach from coarse.', 'As with any flat set, adjust with the motor running and come down onto your target from above. Grounds trapped in the gap make a fine-to-coarse move read inaccurately.'],
      ['Commercial burr lineage, home-scale retention.', 'The grind quality reflects the burr pedigree; the retention reflects the price. Purge a couple of grams when switching bags.'],
    ],
  },
  {
    id: 'hario-skerton-pro', name: 'Hario Skerton Pro', short: 'Skerton', unit: 'clicks',
    min: 0, max: 12, step: 1, espresso: 2, frenchPress: 10,
    kind: 'Hand grinder', burrs: 'Ceramic conical',
    blurb: 'A budget ceramic hand grinder with a short 12-click range — every click counts, because there are so few of them.',
    mechanics: `A click nut under the burr assembly, zeroed at burr contact. The entire brewing range spans about ten clicks, which means the resolution here is coarse by design: one click on a Skerton covers what three or four cover on a Comandante.`,
    quirks: [
      ['One click is a big move.', 'With French press only ten clicks from espresso, there is no such thing as a small adjustment. If a brew is slightly sour, you may not have a setting between "too sour" and "too bitter" — that is the grinder, not you.'],
      ['Burr wobble at coarse settings is a known limitation.', 'The Pro added a stabilising bearing over the original Skerton, but at the coarse end the upper burr still has play. Expect a wider particle spread for French press than the click number implies.'],
      ['Ceramic burrs dull slowly and quietly.', 'No sudden failure, just a gradual drift coarse across months. If everything starts tasting under-extracted at your usual settings, the burrs are the first suspect.'],
    ],
  },
  {
    id: 'porlex-mini-tall-2', name: 'Porlex Mini / Tall II', short: 'Porlex', unit: 'clicks',
    min: 0, max: 13, step: 1, espresso: 2.5, frenchPress: 11,
    kind: 'Hand grinder', burrs: 'Ceramic conical',
    blurb: 'The travel grinder that fits inside an AeroPress. Thirteen clicks, and a chart that reflects how few that is.',
    mechanics: `A click nut under the burrs, zeroed at contact. Mini and Tall II share the same burr set and adjustment pitch and differ only in hopper capacity, so one chart covers both. The full brewing range spans under nine clicks.`,
    quirks: [
      ['Mini and Tall II are the same grinder for dialling purposes.', 'Different capacity, identical burrs and identical click pitch. Settings transfer between them exactly.'],
      ['It nests in an AeroPress, which is most of the point.', 'The chart\'s AeroPress row is the one that matters — this grinder is built around that pairing, and it is where the limited range hurts least.'],
      ['Very few clicks across the whole range.', 'Espresso to French press in under nine clicks. Like the Skerton, adjustments are blunt instruments. Use ratio and temperature for fine control, because the grind cannot give it to you.'],
    ],
  },
];

// ---- html helpers ---------------------------------------------------------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const PLAY = (c) =>
  `https://play.google.com/store/apps/details?id=com.jkhosting.coffeeaeye&referrer=utm_source%3Dcoffeeaeye.com%26utm_medium%3Dweb%26utm_campaign%3D${c}`;

function methodRows(spec) {
  return METHODS.map((m) => {
    const r = resolve(spec, m.u);
    const anchor = m.note === 'anchor';
    return `      <tr${anchor ? ' class="anchor-row"' : ''}><td>${esc(m.name)}${
      anchor ? ' <span class="tag">anchor</span>' : ''
    }</td><td class="num">${formatBand(spec, m.u)}</td></tr>`;
  }).join('\n');
}

function related(spec) {
  // three nearest siblings: same kind first, then anything else
  const others = SPECS.filter((s) => s.id !== spec.id);
  const same = others.filter((s) => s.kind.split(',')[0] === spec.kind.split(',')[0]);
  const pool = [...same, ...others.filter((s) => !same.includes(s))];
  return pool.slice(0, 3);
}

function page(spec) {
  const slope = clicksPerUniversal(spec);
  const unitSing = spec.unit === 'clicks' ? 'click' : spec.unit === 'dial' ? 'dial step' : 'setting';
  const stepLabel = spec.step % 1 === 0 ? String(spec.step) : spec.step.toFixed(2).replace(/0$/, '');
  const title = `${spec.name} grind settings — full chart for every brew method | Coffee Aeye`;
  const desc = `${spec.name} grind chart: dial settings for espresso, V60, AeroPress, Chemex, French press and cold brew, with the ± band and how to calibrate the numbers to your own unit.`;
  const canon = `https://coffeeaeye.com/grinders/${spec.id}.html`;
  const v60 = formatBand(spec, 4.5).replace(/<[^>]+>/g, '');
  const rel = related(spec);

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: `${spec.name} grind settings`,
        description: desc,
        url: canon,
        mainEntityOfPage: canon,
        dateModified: '2026-08-17',
        author: { '@type': 'Organization', name: 'Coffee Aeye', url: 'https://coffeeaeye.com/' },
        publisher: {
          '@type': 'Organization',
          name: 'Coffee Aeye',
          logo: 'https://coffeeaeye.com/C1.png',
        },
        about: { '@type': 'Product', name: spec.name, category: 'Coffee grinder' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Coffee Aeye', item: 'https://coffeeaeye.com/' },
          { '@type': 'ListItem', position: 2, name: 'Grinders', item: 'https://coffeeaeye.com/grinders/' },
          { '@type': 'ListItem', position: 3, name: spec.name },
        ],
      },
    ],
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canon}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Coffee Aeye">
<meta property="og:url" content="${canon}">
<meta property="og:title" content="${esc(spec.name)} grind settings — the full chart">
<meta property="og:description" content="${esc(`Dial settings for every brew method on the ${spec.name}, with the ± band and how to calibrate to your own unit.`)}">
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
      <a class="btn" href="${PLAY(`grinder-${spec.id}`)}">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 2.5v19l16-9.5-16-9.5z"/></svg>
        Get the app
      </a>
    </div>
  </div>
</nav>

<main>
  <div class="wrap">
    <div class="crumb"><a href="../index.html">Coffee Aeye</a> → <a href="../grinders/">Grinders</a> → ${esc(spec.short)}</div>
    <div class="eyebrow">Grind chart</div>
    <h1>${esc(spec.name)} grind settings.</h1>
    <p class="lead">${esc(spec.blurb)}</p>

    <div class="specrow">
      <div class="specitem"><span class="sk">Type</span>${esc(spec.kind)}</div>
      <div class="specitem"><span class="sk">Burrs</span>${esc(spec.burrs)}</div>
      <div class="specitem"><span class="sk">Range</span>${formatSetting(spec, spec.min)}–${formatSetting(spec, spec.max)} ${esc(spec.unit)}</div>
      <div class="specitem"><span class="sk">Step</span>${stepLabel} ${esc(spec.unit === 'clicks' ? 'click' : spec.unit)}</div>
    </div>

    <h2>The chart</h2>
    <p>Starting points, not targets. Each number carries a ± ${stepLabel}-${unitSing} band because that is the honest resolution of this dial — land inside the band, then let taste move you.</p>
    <div class="tablewrap">
    <table>
      <thead><tr><th>Brew method</th><th class="num">${esc(spec.short)} ${esc(spec.unit)}</th></tr></thead>
      <tbody>
${methodRows(spec)}
      </tbody>
    </table>
    </div>
    <p class="note">One ${unitSing} on this grinder moves the grind by about ${(1 / slope).toFixed(2)} of a point on the 1–10 universal scale — so roughly ${Math.max(1, Math.round(slope * 0.5))} ${
      Math.max(1, Math.round(slope * 0.5)) === 1 ? unitSing : unitSing + 's'
    } is the smallest change worth making between brews.</p>

    <div class="midcta">
      <p>A chart gets you a starting number and then stops. <strong>Coffee Aeye quotes every recipe in ${esc(spec.short)} ${esc(spec.unit)} to begin with</strong> — and when you rate the brew, it tells you which way to move and how many, on this dial.</p>
      <a class="go" href="${PLAY(`grinder-${spec.id}-mid`)}">€4.29 on Google Play</a>
    </div>

    <h2>Where these numbers come from</h2>
    <p>Two anchors, and interpolation between them. Espresso and French press are the only two bands that manufacturers and community charts actually document with any consistency, so those are the fixed points: <strong>espresso at ${formatSetting(spec, spec.espresso)}</strong> and <strong>French press at ${formatSetting(spec, spec.frenchPress)}</strong>. Everything between is a straight line drawn through them, quantised to the ${unitSing} this dial actually resolves.</p>
    <p>Absolute accuracy is not possible and this page will not claim it. Burr wear, per-unit zero points and assembly tolerances all shift where a number lands. What the two-anchor method gives you is the right <em>shape</em> — correct spacing between methods, correct direction of travel — which is what you need to dial in efficiently. The rest comes from calibration.</p>

    <h2>How this grinder works</h2>
    <p>${esc(spec.mechanics)}</p>

    <h2>Calibrating the chart to your own ${esc(spec.short)}</h2>
    <p>If the chart runs consistently coarse or fine for you, do not nudge every row. Re-anchor it:</p>
    <ol>
      <li>Find <strong>your</strong> espresso mark — the ${unitSing} where a 1:2 shot in about 28 seconds actually happens on your machine. If you do not pull espresso, use the finest point where a moka pot does not choke.</li>
      <li>Find <strong>your</strong> French press mark — coarse enough that a four-minute steep is clean rather than muddy, and the plunger does not fight you.</li>
      <li>Enter both in Coffee Aeye. Replacing the two anchors corrects the zero point <em>and</em> the slope at once, and every method in between re-derives from your own two numbers.</li>
    </ol>
    <p>This matters more on some grinders than others — it matters most anywhere the dial is stepless or the zero is set by hand.</p>

    <h2>Known quirks of the ${esc(spec.short)}</h2>
${spec.quirks
  .map((q) => `    <h3>${esc(q[0])}</h3>\n    <p>${esc(q[1])}</p>`)
  .join('\n')}

    <h2>Moving the dial when a brew tastes wrong</h2>
    <p>The chart gets you into the right neighbourhood. Taste gets you the rest of the way, and the rule is the same on every grinder here:</p>
    <div class="tablewrap">
    <table>
      <thead><tr><th>What you taste</th><th>What it means</th><th class="num">Move</th></tr></thead>
      <tbody>
        <tr><td>Sour, sharp, thin, empty finish</td><td>Under-extracted</td><td class="num">Finer</td></tr>
        <tr><td>Bitter, drying, harsh, ashy</td><td>Over-extracted</td><td class="num">Coarser</td></tr>
        <tr><td>Balanced but weak</td><td>Ratio, not grind</td><td class="num">Hold</td></tr>
        <tr><td>Balanced but overwhelming</td><td>Ratio, not grind</td><td class="num">Hold</td></tr>
      </tbody>
    </table>
    </div>
    <p>On this dial, ${Math.max(1, Math.round(slope * 0.5))}–${Math.max(2, Math.round(slope))} ${unitSing}s is one meaningful step. Change one thing per brew. The full method is in the <a href="../guides/v60-dial-in.html">V60 dial-in guide</a>.</p>

    <div class="callout">
      <div class="k">In the app</div>
      <p>Coffee Aeye holds this chart for all 18 supported grinders and closes the loop on it. Rate a brew and it converts the fault you tasted into a concrete move — <strong>how many ${spec.unit} on your ${esc(spec.short)}</strong>, in your own dial numbers, not a vague "grind finer". Calibrate your two anchors once and every recipe in the app re-derives to your unit. <a href="${PLAY(`grinder-${spec.id}-body`)}">Get it on Google Play</a> — €4.29, one-time.</p>
    </div>

    <h2>Convert a setting to another grinder</h2>
    <p>Settings do not transfer between grinders — click sizes, burr geometry and zero points all differ. The <a href="../tools/grinder-converter.html">grinder converter</a> maps a ${esc(spec.short)} setting onto any of the other 17 through the same universal scale this chart is built on.</p>

    <h2>Other grinders</h2>
    <div class="hubgrid">
${rel
  .map(
    (s) => `      <a class="hubcard" href="${s.id}.html">
        <span class="hk">${esc(s.kind.split(',')[0])}</span>
        <strong>${esc(s.name)}</strong>
        <span class="hd">V60 at ${formatBand(s, 4.5).replace(/<[^>]+>/g, '')} ${esc(s.unit)}</span>
      </a>`
  )
  .join('\n')}
    </div>
    <p><a href="../grinders/">← All 18 grinder charts</a></p>
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
}

// ---- emit -----------------------------------------------------------------
for (const spec of SPECS) {
  fs.writeFileSync(path.join(OUT, `${spec.id}.html`), page(spec));
}

// summary table for the hub + sanity check
const summary = SPECS.map((s) => ({
  id: s.id,
  name: s.name,
  kind: s.kind,
  unit: s.unit,
  range: `${formatSetting(s, s.min)}–${formatSetting(s, s.max)}`,
  step: s.step,
  espresso: formatSetting(s, s.espresso),
  fp: formatSetting(s, s.frenchPress),
  v60: formatBand(s, 4.5).replace(/<[^>]+>/g, ''),
  aeropress: formatBand(s, 3.5).replace(/<[^>]+>/g, ''),
  reachesEspresso: !resolve(s, 2.0).belowRange,
}));
fs.writeFileSync(path.join(__dirname, 'summary.json'), JSON.stringify(summary, null, 2));
// raw anchors for the grinder converter (must stay identical to grinder_specs.dart)
fs.writeFileSync(
  path.join(__dirname, 'specs.json'),
  JSON.stringify(
    SPECS.map((s) => ({
      id: s.id, name: s.name, short: s.short, unit: s.unit,
      min: s.min, max: s.max, step: s.step,
      espresso: s.espresso, frenchPress: s.frenchPress,
    })),
    null, 2
  )
);
console.log(`wrote ${SPECS.length} pages`);
console.table(summary.map((s) => ({ name: s.name, v60: s.v60, unit: s.unit, esp: s.espresso, fp: s.fp })));

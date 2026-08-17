#!/usr/bin/env node
/* Injects the Cloudflare Web Analytics beacon before </body> in every page. Idempotent. */
const fs = require('fs');
const path = require('path');

const TOKEN = '0793fe8619e844cd85e90b7dcfdef5f3';
const BEACON = `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${TOKEN}"}'></script>`;
const ROOT = '/home/user/CoffeeAeye-App';

function walk(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === '_layouts') continue;
    const p = path.join(d, e.name);
    e.isDirectory() ? walk(p, acc) : e.name.endsWith('.html') && acc.push(p);
  }
  return acc;
}

let added = 0, already = 0, missing = 0;
for (const f of walk(ROOT)) {
  let html = fs.readFileSync(f, 'utf8');
  if (html.includes('cloudflareinsights.com')) { already++; continue; }
  if (!html.includes('</body>')) { missing++; console.log('NO </body>:', f); continue; }
  html = html.replace(/\n?<\/body>/, `\n${BEACON}\n</body>`);
  fs.writeFileSync(f, html);
  added++;
}
console.log(`beacon added: ${added}, already present: ${already}, skipped: ${missing}`);

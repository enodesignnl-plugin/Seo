// Study renders: draws shapes (paper items) to a PNG through Chromium, for visual checks only.
const { chromium } = require('playwright');
const fs = require('fs');
// rows: [[{ item, x, y }...], ...] placed in one SVG with viewBox covering all; opts.bg, opts.fg, opts.width
async function render(file, parts, o = {}) {
  const b = parts.map((p) => p.item.bounds).reduce((a, r) => a.unite(r));
  const pad = o.pad ?? 60;
  const vb = [b.x - pad, b.y - pad, b.width + 2 * pad, b.height + 2 * pad];
  const paths = parts.map((p) => `<path fill="${p.fill || o.fg || '#e9d6a8'}" d="${p.item.pathData}"/>`).join('');
  const W = o.width ?? 1600, H = Math.round(W * vb[3] / vb[2]);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" width="${W}" height="${H}">${o.extra || ''}${paths}</svg>`;
  const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: W, height: H } });
  await pg.setContent(`<body style="margin:0;background:${o.bg || '#2b1c14'}">${svg}</body>`);
  await pg.screenshot({ path: file }); await br.close();
}
module.exports = { render };

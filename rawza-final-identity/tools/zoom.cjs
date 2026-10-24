// zoom on part of a wordmark: node zoom.cjs royal out.png x0 y0 x1 y1 '[opts...]'
const { translate } = require('./lib.cjs');
const { render } = require('./view.cjs');
const { paper } = require('./lib.cjs');
const [mod, out, x0, y0, x1, y1, json] = process.argv.slice(2);
const M = require(`./${mod}.cjs`);
const vs = JSON.parse(json || '[{}]'); const parts = []; let dx = 0;
const w = x1 - x0;
for (const v of vs) {
  const { glyphs, pos } = M.set(v);
  const clip = new paper.Path.Rectangle({ from: [+x0, +y0], to: [+x1, +y1], insert: false });
  glyphs.forEach((g, i) => { const it = translate(g.shape, pos[i], 0).intersect(clip, { insert: false }); if (!it.isEmpty()) parts.push({ item: translate(it, dx, 0) }); });
  parts.push({ item: translate(new paper.Path.Rectangle({ from: [+x0, +y0], to: [+x0 + 1, +y0 + 1], insert: false }), dx, 0), fill: 'none' });
  parts.push({ item: translate(new paper.Path.Rectangle({ from: [+x1 - 1, +y1 - 1], to: [+x1, +y1], insert: false }), dx, 0), fill: 'none' });
  dx += w + 40;
}
render(out, parts, { width: 1600, pad: 10 });

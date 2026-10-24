// Study sheet: several wordmark variants stacked, for visual comparison only.
//   node study.cjs royal out.png '[{...opts}, ...]'
const { translate } = require('./lib.cjs');
const { render } = require('./view.cjs');
const [mod, out, json] = process.argv.slice(2);
const M = require(`./${mod}.cjs`);
const variants = JSON.parse(json || '[{}]');
const parts = []; let y = 0;
for (const v of variants) {
  const { glyphs, pos, clearance } = M.set(v);
  if (clearance !== undefined) console.log(JSON.stringify(v), 'clearance', clearance.toFixed(1));
  glyphs.forEach((g, i) => parts.push({ item: translate(g.shape, pos[i], y) }));
  y += 1000;
}
render(out, parts, { width: 1600 });

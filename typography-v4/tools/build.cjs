// Builds the v4 RAWZA wordmarks and the comparison page.
//   cd tools && npm install && npm run build
// Writes to ../ : concept-a.svg, concept-b.svg, comparison.html
const fs = require('fs');
const path = require('path');
const { translate, fix } = require('./lib.cjs');
const A = require('./concept-a.cjs');
const B = require('./concept-b.cjs');

const OUT = path.join(__dirname, '..');
const PAD = 40;

// ---------- clean-up and checks per letter
function cleanPath(p) {
  for (let i = p.segments.length - 1; i >= 0 && p.segments.length > 3; i--) {
    const s = p.segments[i], prev = s.previous || p.lastSegment, next = s.next || p.firstSegment;
    if (s.point.getDistance(prev.point) < 0.05 && s.handleIn.isZero() && prev.handleOut.isZero()) { s.remove(); continue; }
    if (s.handleIn.isZero() && s.handleOut.isZero() && prev.handleOut.isZero() && next.handleIn.isZero()) {
      const a = s.point.subtract(prev.point), b = next.point.subtract(s.point);
      if (Math.abs(a.cross(b)) < 1e-3 * a.length * b.length && a.dot(b) > 0) s.remove();
    }
  }
}
function inspect(item) {
  const kids = item.children ? item.children.slice() : [item];
  kids.forEach(cleanPath);
  let anchors = 0, selfX = 0, windingOk = true;
  for (const k of kids) {
    anchors += k.segments.length;
    selfX += k.getIntersections().filter((c) => !c.isTouching()).length;
    const host = kids.find((o) => o !== k && o.bounds.contains(k.bounds) && o.contains(k.interiorPoint));
    if (host && host.clockwise === k.clockwise) windingOk = false;
  }
  return { subpaths: kids.length, anchors, selfX, windingOk };
}

// ---------- letters at their final positions, origin moved to the artwork's top-left
function build(set) {
  const { glyphs, pos } = set();
  const letters = glyphs.map((g, i) => ({ id: g.id, shape: translate(g.shape, pos[i], 0) }));
  const b = letters.map((l) => l.shape.bounds).reduce((acc, r) => acc.unite(r));
  const dx = PAD - b.x, dy = PAD - b.y;
  const W = Math.ceil(b.width + 2 * PAD), Hh = Math.ceil(b.height + 2 * PAD);
  const placed = letters.map((l) => {
    const s = translate(l.shape, dx, dy);
    return { id: l.id, shape: s, check: inspect(s), d: fix(s.pathData, 2) };
  });
  // baseline and cap line in artwork units, for the comparison page
  return { W, Hh, placed, pos, base: 700 + dy, cap: dy };
}
function writeSvg(file, art, title) {
  const groups = art.placed.map((l) => `  <g id="${l.id}">\n    <path fill="#000000" d="${l.d}"/>\n  </g>`).join('\n');
  fs.writeFileSync(path.join(OUT, file), `<?xml version="1.0" encoding="UTF-8"?>
<!-- RAWZA — ${title}. Wordmark drawn as vector outlines (no font needed). Units: cap height 700. -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${art.W} ${art.Hh}" width="${Math.round(art.W / 2)}" height="${Math.round(art.Hh / 2)}">
<title>RAWZA — ${title}</title>
<g id="wordmark">
${groups}
</g>
</svg>
`);
}
const artA = build(A.set);
const artB = build(B.set);
writeSvg('concept-a.svg', artA, 'Concept A v4, Royal Signature');
writeSvg('concept-b.svg', artB, 'Concept B v4, Editorial Elegance');

// ---------- comparison page: v3 artwork is read from typography-v3 (unchanged), v4 from above
const V3 = path.join(__dirname, '..', '..', 'typography-v3');
function readSvg(file) {
  const s = fs.readFileSync(file, 'utf8');
  const vb = s.match(/viewBox="([^"]+)"/)[1];
  const paths = [...s.matchAll(/<path[^>]* d="([^"]+)"/g)].map((m) => `<path d="${m[1]}"/>`).join('');
  return { vb, paths, W: +vb.split(' ')[2] };
}
const pct = (w, a, b) => (100 * w / Math.max(a, b)).toFixed(1);
const v3a = readSvg(path.join(V3, 'rawza-direction-a-v3.svg'));
const v3b = readSvg(path.join(V3, 'rawza-direction-b-v3.svg'));
const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<g id="v3-a">${v3a.paths}</g>
<g id="v3-b">${v3b.paths}</g>
<g id="v4-a">${artA.placed.map((l) => `<path d="${l.d}"/>`).join('')}</g>
<g id="v4-b">${artB.placed.map((l) => `<path d="${l.d}"/>`).join('')}</g>
</defs></svg>`;
const html = fs.readFileSync(path.join(__dirname, 'comparison.src.html'), 'utf8')
  .replace('<!--SPRITE-->', sprite)
  .replace(/\{\{VB_V3A\}\}/g, v3a.vb)
  .replace(/\{\{VB_V3B\}\}/g, v3b.vb)
  .replace(/\{\{VB_V4A\}\}/g, `0 0 ${artA.W} ${artA.Hh}`)
  .replace(/\{\{VB_V4B\}\}/g, `0 0 ${artB.W} ${artB.Hh}`)
  // v3 and v4 share one scale per column on the large plates (both are drawn at cap height 700)
  .replace(/\{\{PCT_V3A\}\}/g, pct(v3a.W, v3a.W, artA.W)).replace(/\{\{PCT_V4A\}\}/g, pct(artA.W, v3a.W, artA.W))
  .replace(/\{\{PCT_V3B\}\}/g, pct(v3b.W, v3b.W, artB.W)).replace(/\{\{PCT_V4B\}\}/g, pct(artB.W, v3b.W, artB.W));
if (/\{\{/.test(html)) throw new Error('unreplaced placeholder in comparison.src.html');
fs.writeFileSync(path.join(OUT, 'comparison.html'), html);

// ---------- report
for (const [n, art] of [['A', artA], ['B', artB]]) {
  console.log(`Concept ${n}: ${art.W} x ${art.Hh}   positions ${art.pos.map(Math.round).join(' ')}`);
  for (const l of art.placed) console.log(`  ${l.id.padEnd(12)} subpaths ${l.check.subpaths}  anchors ${String(l.check.anchors).padStart(3)}  self-intersections ${l.check.selfX}  counters ${l.check.windingOk ? 'ok' : 'WRONG'}`);
}

// Builds the v3 RAWZA wordmarks and the comparison page.
//   cd tools && npm install && npm run build
// Writes to ../ : rawza-direction-a-v3.svg, rawza-direction-b-v3.svg, rawza-comparison-v3.html
const fs = require('fs');
const path = require('path');
const { translate, union, fix } = require('./lib.cjs');
const setA = require('./set-a.cjs');
const setB = require('./set-b.cjs');

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
  return { W, Hh, placed, capPx: (px) => (px * 700) / Hh, pos };
}
function writeSvg(file, art, title) {
  const groups = art.placed.map((l) => `  <g id="${l.id}">\n    <path fill="#000000" d="${l.d}"/>\n  </g>`).join('\n');
  fs.writeFileSync(path.join(OUT, file), `<?xml version="1.0" encoding="UTF-8"?>
<!-- RAWZA — ${title}. Concept wordmark drawn as vector outlines (no font). Units: cap height 700. -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${art.W} ${art.Hh}" width="${Math.round(art.W / 2)}" height="${Math.round(art.Hh / 2)}">
<title>RAWZA — ${title}</title>
<g id="wordmark">
${groups}
</g>
</svg>
`);
}
const A = build(setA);
const B = build(setB);
writeSvg('rawza-direction-a-v3.svg', A, 'Direction A v3, Refined Signature');
writeSvg('rawza-direction-b-v3.svg', B, 'Direction B v3, Expressive Editorial');

// ---------- before/after letters for the inspection section (v2 geometry from typography-v2)
const V2 = path.join(__dirname, '..', '..', 'typography-v2', 'tools');
const a2 = require(path.join(V2, 'direction-a.cjs')).make();
const b2 = require(path.join(V2, 'direction-b.cjs'));
const a3 = require('./direction-a-v3.cjs');
const b3 = require('./direction-b-v3.cjs');
const box = (shape) => {
  const bb = shape.bounds;
  return { bx: bb.x, by: bb.y, bw: bb.width, bh: bb.height, d: fix(shape.pathData, 2) };
};
// pairs share one viewBox so before and after are drawn at the same scale
const pairs = {
  R: [a2.R().shape, a3.R().shape], A: [a2.A().shape, a3.A().shape], W: [a2.W().shape, a3.W().shape], Z: [a2.Z().shape, a3.Z().shape],
  a: [b2.a().shape, b3.a().shape], w: [b2.w().shape, b3.w().shape],
};
const defs = [], vbs = {};
for (const [k, [before, after]] of Object.entries(pairs)) {
  const p = [box(before), box(after)];
  const x0 = Math.min(p[0].bx, p[1].bx) - 50, y0 = Math.min(p[0].by, p[1].by) - 50;
  const x1 = Math.max(p[0].bx + p[0].bw, p[1].bx + p[1].bw) + 50, y1 = Math.max(p[0].by + p[0].bh, p[1].by + p[1].bh) + 50;
  vbs['L' + k] = [x0, y0, x1 - x0, y1 - y0].map(Math.round).join(' ');
  defs.push(`<path id="v2-${k}" d="${p[0].d}"/>`, `<path id="v3-${k}" d="${p[1].d}"/>`);
}
// the R–a pair of direction B, as set in the wordmark
const ra = union([B.placed[0].shape, B.placed[1].shape]);
const rab = ra.bounds;
vbs.Ra = [rab.x - 40, rab.y - 40, rab.width + 80, rab.height + 80].map(Math.round).join(' ');
defs.push(`<path id="v3-Ra" d="${fix(ra.pathData, 2)}"/>`);

// ---------- page
const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<g id="wm-a">${A.placed.map((l) => `<path d="${l.d}"/>`).join('')}</g>
<g id="wm-b">${B.placed.map((l) => `<path d="${l.d}"/>`).join('')}</g>
${defs.join('\n')}
</defs></svg>`;
let html = fs.readFileSync(path.join(__dirname, 'comparison-v3.src.html'), 'utf8')
  .replace('<!--SPRITE-->', sprite)
  .replace(/\{\{VB_A\}\}/g, `0 0 ${A.W} ${A.Hh}`)
  .replace(/\{\{VB_B\}\}/g, `0 0 ${B.W} ${B.Hh}`)
  .replace(/\{\{VB_(\w+)\}\}/g, (m, k) => { if (!vbs[k]) throw new Error('no viewBox ' + k); return vbs[k]; });
fs.writeFileSync(path.join(OUT, 'rawza-comparison-v3.html'), html);

// ---------- report
for (const [n, art] of [['A', A], ['B', B]]) {
  console.log(`Direction ${n}: ${art.W} x ${art.Hh}   positions ${art.pos.map(Math.round).join(' ')}`);
  for (const l of art.placed) console.log(`  ${l.id.padEnd(12)} subpaths ${l.check.subpaths}  anchors ${String(l.check.anchors).padStart(3)}  self-intersections ${l.check.selfX}  counters ${l.check.windingOk ? 'ok' : 'WRONG'}`);
}

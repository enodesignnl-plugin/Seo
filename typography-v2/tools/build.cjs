// Builds the two RAWZA wordmarks as Illustrator-ready SVGs plus the comparison page.
//   cd tools && npm install && npm run build
// Output (in ../):
//   rawza-direction-a-wordmark.svg   rawza-direction-b-wordmark.svg
//   rawza-typography-comparison.html
const fs = require('fs');
const path = require('path');
const { translate, sub, union, fix } = require('./lib.cjs');
const DA = require('./direction-a.cjs');
const DB = require('./direction-b.cjs');

const OUT = path.join(__dirname, '..');

// ---------- geometry clean-up and checks
function cleanPath(p) {
  // drop zero-length segments and straight-line points that sit on a straight run
  for (let i = p.segments.length - 1; i >= 0 && p.segments.length > 3; i--) {
    const s = p.segments[i], prev = s.previous || p.lastSegment, next = s.next || p.firstSegment;
    if (s.point.getDistance(prev.point) < 0.05 && s.handleIn.isZero() && prev.handleOut.isZero()) { s.remove(); continue; }
    const straight = s.handleIn.isZero() && s.handleOut.isZero() && prev.handleOut.isZero() && next.handleIn.isZero();
    if (straight) {
      const a = s.point.subtract(prev.point), b = next.point.subtract(s.point);
      if (Math.abs(a.cross(b)) < 1e-3 * a.length * b.length && a.dot(b) > 0) s.remove();
    }
  }
}
function children(item) { return item.children ? item.children.slice() : [item]; }
function inspect(item) {
  const kids = children(item);
  kids.forEach(cleanPath);
  let anchors = 0, selfX = 0;
  for (const k of kids) {
    anchors += k.segments.length;
    selfX += k.getIntersections().filter((c) => !c.isTouching()).length;
  }
  // counters: a sub-path inside another must wind the other way (non-zero fill)
  let windingOk = true;
  for (const k of kids) {
    const host = kids.find((o) => o !== k && o.bounds.contains(k.bounds) && o.contains(k.interiorPoint));
    if (host && host.clockwise === k.clockwise) windingOk = false;
  }
  return { subpaths: kids.length, anchors, selfX, windingOk };
}

// ---------- assemble each direction as separately positioned letters
function layout(glyphs, kern) {
  let x = 0;
  return glyphs.map((g, i) => { x += kern[i] || 0; const shape = translate(g.shape, x, 0); x += g.adv; return { id: g.id, shape }; });
}
const A = DA.make();
const dirA = layout([
  { id: 'letter-R', ...A.R() }, { id: 'letter-A-1', ...A.A() }, { id: 'letter-W', ...A.W() },
  { id: 'letter-Z', ...A.Z() }, { id: 'letter-A-2', ...A.A() }], A.kern);

const dirB = layout([
  { id: 'letter-R', ...DB.R() }, { id: 'letter-a-1', ...DB.a() }, { id: 'letter-w', ...DB.w() },
  { id: 'letter-z', ...DB.z({ join: true }) }, { id: 'letter-a-2', ...DB.a() }], DB.kern);
// the shared hairline belongs to the z; trim it where it meets the w so nothing overlaps
const wB = dirB.find((l) => l.id === 'letter-w'), zB = dirB.find((l) => l.id === 'letter-z');
zB.shape = sub(zB.shape, wB.shape);

// ---------- write SVGs (origin moved to the top-left of the artwork)
const PAD = 40;
function writeSvg(file, letters, title) {
  const b = letters.map((l) => l.shape.bounds).reduce((acc, r) => acc.unite(r));
  const dx = PAD - b.x, dy = PAD - b.y, W = Math.ceil(b.width + 2 * PAD), Hh = Math.ceil(b.height + 2 * PAD);
  const report = [];
  const groups = letters.map((l) => {
    const s = translate(l.shape, dx, dy);
    const r = inspect(s);
    report.push({ id: l.id, ...r });
    return `  <g id="${l.id}">\n    <path fill="#000000" fill-rule="nonzero" d="${fix(s.pathData, 2)}"/>\n  </g>`;
  });
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- RAWZA — ${title}. Concept wordmark drawn as vector geometry (no font). Units: cap height 700. -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${Hh}" width="${Math.round(W / 2)}" height="${Math.round(Hh / 2)}">
<title>RAWZA — ${title}</title>
<g id="wordmark">
${groups.join('\n')}
</g>
</svg>
`;
  fs.writeFileSync(path.join(OUT, file), svg);
  return { W, Hh, dx, dy, report };
}
const outA = writeSvg('rawza-direction-a-wordmark.svg', dirA, 'Direction A, Refined Signature');
const outB = writeSvg('rawza-direction-b-wordmark.svg', dirB, 'Direction B, Expressive Editorial');

// ---------- comparison page: inline the same geometry for recolouring
const pathsOf = (letters, o) => letters.map((l) => `<path d="${fix(translate(l.shape, o.dx, o.dy).pathData, 2)}"/>`).join('');
const det = (shape, pad = 60) => {
  const b = shape.bounds;
  return { vb: [b.x - pad, b.y - pad, b.width + 2 * pad, b.height + 2 * pad].map(Math.round).join(' '), d: fix(shape.pathData, 2) };
};
const details = {
  'a-R': det(A.R().shape), 'a-A': det(A.A().shape), 'a-W': det(A.W().shape), 'a-Z': det(A.Z().shape),
  'b-R': det(DB.R().shape), 'b-a': det(DB.a().shape),
  'b-wz': det(translate(union([wB.shape, zB.shape]), -wB.shape.bounds.x, 0)),
};
let html = fs.readFileSync(path.join(__dirname, 'comparison.src.html'), 'utf8');
html = html
  .replace('<!--SPRITE-->', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<g id="wm-a">${pathsOf(dirA, outA)}</g>
<g id="wm-b">${pathsOf(dirB, outB)}</g>
${Object.entries(details).map(([id, v]) => `<path id="d-${id}" d="${v.d}"/>`).join('\n')}
</defs></svg>`)
  .replace(/\{\{VB_A\}\}/g, `0 0 ${outA.W} ${outA.Hh}`)
  .replace(/\{\{VB_B\}\}/g, `0 0 ${outB.W} ${outB.Hh}`)
  .replace(/\{\{VB_([a-zA-Z]+-[a-zA-Z]+)\}\}/g, (m, id) => details[id].vb);
fs.writeFileSync(path.join(OUT, 'rawza-typography-comparison.html'), html);

for (const [n, o] of [['A', outA], ['B', outB]]) {
  console.log(`Direction ${n}: ${o.W} x ${o.Hh}`);
  for (const r of o.report) console.log(`  ${r.id.padEnd(12)} subpaths ${r.subpaths}  anchors ${r.anchors}  self-intersections ${r.selfX}  counters ${r.windingOk ? 'ok' : 'WRONG'}`);
}

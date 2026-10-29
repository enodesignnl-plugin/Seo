// Step 3: assemble the parts into the logo and export Illustrator-ready files.
//   node build.cjs <work dir>/logo.json
// logo.json (paths relative to the work dir):
// {
//   "name": "RAWZA_Logo",                    file name prefix
//   "out": "../logo-vector",                 output folder (gets SVG/, PDF/, PNG/)
//   "layers": [ { "id": "TOREN_BLOEM", "parts": ["toren"] },
//               { "id": "WOORDMERK", "parts": ["r", "woord"] } ],
//   "ids": { "toren": "TOREN_EN_BLOEM", "r": "LETTER_R" },   path ids; a text part without one gets
//                                                             one path per letter: LETTER_A, LETTER_W, LETTER_A_2
//   "align": [],                             optional rules, applied in order (default: keep the
//                                            reference's positions exactly)
//   "variants": [ { "name": "Goud_Op_Chocolade_Vierkant", "fill": "#C9A063", "background": "#29170D", "canvas": true },
//                 { "name": "Goud", "fill": "#C9A063" },
//                 { "name": "Voorbeeldkleuren", "fill": { "*": "#EDBD76", "toren": "#DBA667" } } ],
//   "scale": 2, "margin": 60, "png_width": 3000
// }
// canvas: true keeps the reference's full canvas size; otherwise the file is cropped to the logo plus margin
// (reference px). Align rules (bounds as Illustrator shows them):
//   { "rule": "equal-gaps-y", "parts": ["toren", "woord", "ondertitel"] }  middle part stays, gaps = their mean
//   { "rule": "center-x", "part": "toren", "on": ["r", "woord"] }          centre over the union of "on"
//   { "rule": "flush-right", "part": "ondertitel", "to": "woord" }         also "flush-left"
//   { "rule": "move", "part": "toren", "by": [dx, dy] }
//   { "rule": "center-canvas" }                                            the whole logo on the canvas centre
// Writes <work>/placed.json (final outlines in reference px, moves per part) for compare.py.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { paper, P, fix, shape, readJSON } = require('./common.cjs');
const specFile = path.resolve(process.argv[2]);
const work = path.dirname(specFile), spec = readJSON(specFile), meta = readJSON(path.join(work, 'meta.json'));
const K = spec.scale || 2, margin = spec.margin ?? 60, out = path.resolve(work, spec.out || 'out');

const parts = {};
for (const L of spec.layers) for (const n of L.parts) {
  const j = readJSON(path.join(work, 'parts', n + '.json'));
  const items = j.letters ? j.letters.map((l) => ({ ch: l.ch, s: shape(l.d) })) : [{ s: shape(j.d) }];
  parts[n] = { items, move: [0, 0] };
}
const bnd = (names) => names.flatMap((n) => parts[n].items.map((i) => i.s.bounds)).reduce((a, b) => a.unite(b));
const mv = (n, dx, dy) => { for (const i of parts[n].items) i.s.translate(P(dx, dy)); parts[n].move[0] += dx; parts[n].move[1] += dy; };
const all = Object.keys(parts);
let shift = [0, 0];
const report = [];
for (const r of spec.align || []) {
  if (r.rule === 'equal-gaps-y') {
    const [a, b, c] = r.parts, g1 = bnd([b]).top - bnd([a]).bottom, g2 = bnd([c]).top - bnd([b]).bottom, g = (g1 + g2) / 2;
    mv(a, 0, bnd([b]).top - g - bnd([a]).bottom); mv(c, 0, bnd([b]).bottom + g - bnd([c]).top);
    report.push(`equal gaps: ${g1.toFixed(2)} and ${g2.toFixed(2)} px -> ${g.toFixed(2)} px`);
  } else if (r.rule === 'center-x') {
    const dx = bnd(r.on).center.x - bnd([r.part]).center.x; mv(r.part, dx, 0); report.push(`${r.part} centred: moved ${dx.toFixed(2)} px`);
  } else if (r.rule === 'flush-right' || r.rule === 'flush-left') {
    const dx = r.rule === 'flush-right' ? bnd([r.to]).right - bnd([r.part]).right : bnd([r.to]).left - bnd([r.part]).left;
    mv(r.part, dx, 0); report.push(`${r.part} ${r.rule} with ${r.to}: moved ${dx.toFixed(2)} px`);
  } else if (r.rule === 'move') {
    mv(r.part, r.by[0], r.by[1]); report.push(`${r.part} moved by ${r.by}`);
  } else if (r.rule === 'center-canvas') {
    const b = bnd(all); shift = [meta.width / 2 - b.center.x, meta.height / 2 - b.center.y];
    for (const n of all) mv(n, ...shift); report.push(`logo centred on the canvas: moved ${shift.map((v) => v.toFixed(2))} px`);
  } else throw new Error('unknown align rule ' + r.rule);
}
report.forEach((l) => console.log(l));

// path ids
const used = {};
const uid = (id) => { used[id] = (used[id] || 0) + 1; return used[id] === 1 ? id : `${id}_${used[id]}`; };
const pathsOf = (n) => {
  const id = spec.ids && spec.ids[n];
  if (parts[n].items.length > 1 && !id) return parts[n].items.map((i) => [uid('LETTER_' + i.ch.toUpperCase()), i.s]);
  return [[uid(id || n.toUpperCase()), parts[n].items.length > 1 ? parts[n].items.map((i) => i.s).reduce((a, b) => a.unite(b, { insert: false })) : parts[n].items[0].s]];
};
const layerPaths = spec.layers.map((L) => ({ id: L.id, paths: L.parts.flatMap((n) => pathsOf(n).map(([id, s]) => ({ id, part: n, s }))) }));

const logoB = bnd(all);
const svg = (v) => {
  const ox = v.canvas ? 0 : logoB.x - margin, oy = v.canvas ? 0 : logoB.y - margin;
  const w = v.canvas ? meta.width : logoB.width + 2 * margin, h = v.canvas ? meta.height : logoB.height + 2 * margin;
  const W = Math.round(w * K), H = Math.round(h * K);
  const fillOf = (part) => (typeof v.fill === 'string' ? v.fill : v.fill[part] || v.fill['*']);
  const tr = (s) => { const c = s.clone({ insert: false }); c.translate(P(-ox, -oy)); c.scale(K, P(0, 0)); return fix(c.pathData, 2); };
  const layers = layerPaths.map((L) => `  <g id="${L.id}">\n${L.paths.map((p) => `    <path id="${p.id}" fill="${fillOf(p.part)}" fill-rule="nonzero" d="${tr(p.s)}"/>`).join('\n')}\n  </g>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${W} ${H}" width="${W / K}px" height="${H / K}px">
  <title>${spec.name}</title>
${v.background ? `  <g id="ACHTERGROND">\n    <rect id="VLAK" x="0" y="0" width="${W}" height="${H}" fill="${v.background}"/>\n  </g>\n` : ''}${layers}
</svg>
`;
};
for (const d of ['SVG', 'PDF', 'PNG']) fs.mkdirSync(path.join(out, d), { recursive: true });
const has = (cmd) => { try { execFileSync('sh', ['-c', `command -v ${cmd}`]); return true; } catch { return false; } };
for (const v of spec.variants) {
  const base = `${spec.name}_${v.name}`, f = path.join(out, 'SVG', base + '.svg'), s = svg(v);
  fs.writeFileSync(f, s);
  // checks: every subpath closed, no styles/text/use, valid XML
  const ds = [...s.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
  const open = ds.reduce((n, d) => n + (d.match(/[Mm]/g) || []).length - (d.match(/[Zz]/g) || []).length, 0);
  if (open || /<(style|text|use)\b/.test(s)) throw new Error(`${base}: ${open} open subpaths or styles/text/use found`);
  if (has('xmllint')) execFileSync('xmllint', ['--noout', f]);
  if (has('inkscape')) {
    execFileSync('inkscape', [f, '--export-type=pdf', '-o', path.join(out, 'PDF', base + '.pdf')], { stdio: 'ignore' });
    execFileSync('inkscape', [f, '-o', path.join(out, 'PNG', base + '.png'), '-w', String(spec.png_width || 3000)], { stdio: 'ignore' });
  }
  console.log('written', base, '(SVG' + (has('inkscape') ? ', PDF, PNG' : '') + ')');
}
const placed = { shift, report, parts: Object.fromEntries(all.map((n) => [n, { move: parts[n].move, items: parts[n].items.map((i) => ({ ch: i.ch, d: fix(i.s.pathData, 3) })) }])) };
fs.writeFileSync(path.join(work, 'placed.json'), JSON.stringify(placed));
const nodes = layerPaths.flatMap((L) => L.paths).map((p) => `${p.id} ${(p.s.children || [p.s]).reduce((n, k) => n + k.segments.length, 0)}`);
console.log('anchor points per path:', nodes.join(', '));

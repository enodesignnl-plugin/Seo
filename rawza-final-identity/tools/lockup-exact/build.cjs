// The full reference lockup (tower with flower, RAWZA with the swash R, AFGHAANS RESTAURANT) as clean
// vector paths, in reference-image pixel units (1254 x 1254).   node build.cjs -> lockup.json
//   R: ../r-exact (placed by place_r.cjs)            icon: traced and mirrored (icon.py, icon.cjs)
//   AWZA: Cormorant Garamond 500 (W and Z as in glyphs.cjs), size, stretch and place fitted per
//         letter (fitword2.py), at the reference's own letter spacing
//   descriptor: Montserrat 550, size, baseline and tracking fitted (fitdesc.py), uniform tracking
// Then the spacing rules: icon -> AWZA gap equals AWZA -> descriptor gap, descriptor ends flush with
// the last A, icon at its horizontal place in the reference (6.6 px right of the centre of the word, as the
// client chose), whole lockup centred on the square.
// Rebuild (from this folder; CG/MS = the variable fonts in ../../round-2/lettertypen):
//   python3 -m fontTools varLib.instancer $CG wght=500 -o fonts/CormorantGaramond-500.ttf
//   python3 -m fontTools varLib.instancer $MS wght=550 -o fonts/Montserrat-550.ttf
//   python3 coverage.py && python3 icon.py && potrace icon_bw.pbm -s -a 1.1 -O 0.6 -t 50 -o icon_trace.svg
//   AXIS=628.5 node icon.cjs icon_trace.svg icon.json && node place_r.cjs r.json
//   python3 fitword.py $CG 500 && python3 fitword2.py $CG 500 216 755.95
//   python3 fitdesc.py $MS 550 34.6 822.2 save
//   node build.cjs && node export.cjs && python3 compare.py   (then PDF/PNG with Inkscape)
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');
const { paper, fix, union } = require('../lib.cjs');
const { dropSpecks } = require('../edit.cjs');
const J = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, f), 'utf8'));
const P = (x, y) => new paper.Point(x, y);
const glyphShape = (font, ch, size, x, y, sx = 1) => {
  const g = font.charToGlyph(ch);
  const s = new paper.CompoundPath({ pathData: g.getPath(0, 0, size).toPathData(4), insert: false }).resolveCrossings().reorient(true, true);
  s.scale(sx, 1, P(0, 0)); s.translate(P(x, y));
  return dropSpecks(union([s]));
};

const r = new paper.CompoundPath({ pathData: J('r.json').d, insert: false });
const icon = new paper.CompoundPath({ pathData: J('icon.json').d, insert: false });

// letters at their places in the reference (the client's choice), not with equalised spacing
const W = J('word_fit.json');
const ZBOX = [754.8, 874.9];   // the reference Z, left and right edge
const cg = opentype.loadSync(path.join(__dirname, 'fonts', 'CormorantGaramond-500.ttf'));
// both As share one stretch, so they are the same letter
const aStretch = (W.letters[0].stretch + W.letters[3].stretch) / 2;
const { glyph } = require('./glyphs.cjs');
const letters = W.letters.map((L, i) => {
  const s = glyph(cg, L.ch); s.scale(W.em / cg.unitsPerEm * (L.ch === 'A' ? aStretch : L.stretch), W.em / cg.unitsPerEm, P(0, 0));
  s.translate(P(W.letters[i].x, W.baseline));
  if (L.ch === 'Z') {   // Z: its outline matched to the reference Z's left and right edges
    const b = s.bounds; s.scale((ZBOX[1] - ZBOX[0]) / b.width, 1, P(b.left, 0)); s.translate(P(ZBOX[0] - b.left, 0));
  }
  return s;
});

const D = J('desc_fit.json');
const ms = opentype.loadSync(path.join(__dirname, 'fonts', 'Montserrat-550.ttf'));
// fitted: x0 427.26, tracking 9.60 px (277/1000 em) after every character, the space 1.28 px wider
const TRACK = 0.2774 * D.em, SPACE_EXTRA = 10.88 - TRACK;
const text = 'AFGHAANS RESTAURANT';
let x = 427.26; const dparts = [];
for (const ch of text) {
  const g = ms.charToGlyph(ch);
  if (ch !== ' ') dparts.push(glyphShape(ms, ch, D.em, x, D.baseline));
  x += g.advanceWidth * D.em / ms.unitsPerEm + TRACK + (ch === ' ' ? SPACE_EXTRA : 0);
}
let desc = dropSpecks(union(dparts));

const bb = (items) => items.map((i) => i.bounds).reduce((a, b) => a.unite(b));
const word = bb(letters);
const report = {};
report.ref = { iconToWord: word.top - icon.bounds.bottom, wordToDesc: desc.bounds.top - word.bottom,
  descRight: desc.bounds.right, aRight: letters[3].bounds.right, iconAxis: J('icon.json').axis,
  wordCentre: bb([r, ...letters]).center.x };

// 1. descriptor flush right with the last A
desc.translate(P(letters[3].bounds.right - desc.bounds.right, 0));
// 2. equal vertical gaps (AWZA stays where it is)
const G = (report.ref.iconToWord + report.ref.wordToDesc) / 2;
icon.translate(P(0, word.top - G - icon.bounds.bottom));
desc.translate(P(0, word.bottom + G - desc.bounds.top));
// 3. icon: stays at its x in the reference (its axis at 628.5, the word's centre at 621.9)
// 4. lockup centred on the 1254 square
const all = bb([icon, r, ...letters, desc]);
const shift = P(627 - all.center.x, 627 - all.center.y);
for (const it of [icon, r, ...letters, desc]) it.translate(shift);

report.final = { gap: G, iconToWord: bb(letters).top - icon.bounds.bottom, wordToDesc: desc.bounds.top - bb(letters).bottom,
  iconCentre: icon.bounds.center.x, wordCentre: bb([r, ...letters]).center.x, descRight: desc.bounds.right,
  aRight: letters[3].bounds.right, lockup: bb([icon, r, ...letters, desc]).toString(), shift: shift.toString() };
console.log(JSON.stringify(report, null, 1));
const out = { icon: fix(icon.pathData, 3), r: fix(r.pathData, 3), letters: letters.map((l, i) => ({ ch: W.letters[i].ch, d: fix(l.pathData, 3) })),
  desc: fix(desc.pathData, 3), shift: [shift.x, shift.y] };
fs.writeFileSync(path.join(__dirname, 'lockup.json'), JSON.stringify(out));

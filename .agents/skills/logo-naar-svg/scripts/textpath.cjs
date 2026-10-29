// A fitted line of lettering (fitfont.py's .fit.json) -> one outline per letter, in reference pixels.
//   node textpath.cjs <name.fit.json> <name.json>       (fitfont.py runs this; run again after editing edits)
//   node textpath.cjs --contours <font.ttf> <letter>     list a glyph's contours, to plan an edit
// Per letter: the glyph at size em on the baseline, stretched horizontally about its origin, at x.
// Overlapping contours (variable fonts) are united so every letter is one clean shape.
//
// Letter edits, for where the reference draws a letter differently from the font: put them in
// <name>.edits.json next to the fit file (kept when you refit). Font units, y up, baseline 0:
// { "W": [ { "drop_contour": 2 } ],                      remove a contour (number from --contours)
//   "A": [ { "move_contour": 0, "dx": 0, "dy": 13 } ],   move one contour (a crossbar up 13 units)
//   "Z": [ { "clip": { "top": 625 } },                   cut everything above / below / beyond
//          { "squeeze": { "x0": 300, "x1": 564, "to": 535, "ymax": 160 } } ] }
//        squeeze: points right of x0 and below ymax are pulled in so x1 lands on "to"
//        (a foot serif that sticks out further than the reference's)
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');
const { paper, P, fix, union, dropSpecks, kids, readJSON } = require('./common.cjs');

const contoursOf = (font, ch) => font.charToGlyph(ch).getPath(0, 0, font.unitsPerEm).toPathData(4)
  .split(/(?=M)/).filter((s) => s.trim()).map((s) => new paper.Path({ pathData: s, insert: false }));

if (process.argv[2] === '--contours') {
  const font = opentype.loadSync(process.argv[3]);
  contoursOf(font, process.argv[4]).forEach((c, i) => {
    const b = c.bounds;
    console.log(`contour ${i}: x ${b.left.toFixed(0)}..${b.right.toFixed(0)}  y ${(-b.bottom).toFixed(0)}..${(-b.top).toFixed(0)} (up)  ${c.segments.length} points  ${c.clockwise ? 'outer' : 'counter'}`);
  });
  process.exit(0);
}
const [, , fitFile, out] = process.argv;
const F = readJSON(fitFile);
const editsFile = fitFile.replace(/\.fit\.json$/, '.edits.json');
const E = fs.existsSync(editsFile) ? readJSON(editsFile) : {};
const font = opentype.loadSync(F.outline_font);
function glyph(ch) {
  let cs = contoursOf(font, ch);
  const ed = E[ch] || [];
  const drop = new Set(ed.filter((e) => 'drop_contour' in e).map((e) => e.drop_contour));
  ed.filter((e) => 'move_contour' in e).forEach((e) => cs[e.move_contour].translate(P(e.dx || 0, -(e.dy || 0))));
  cs = cs.filter((c, i) => !drop.has(i));
  // outer contours are united, counters cut out (nonzero, as the font intends)
  let s = new paper.CompoundPath({ children: cs, insert: false }).resolveCrossings().reorient(true, true);
  s = dropSpecks(s, 1);
  for (const e of ed) {
    if (e.clip) {
      const c = e.clip, r = new paper.Path.Rectangle({ from: [c.left ?? -1e4, -(c.top ?? 1e4)], to: [c.right ?? 1e4, -(c.bottom ?? -1e4)], insert: false });
      s = dropSpecks(s.intersect(r, { insert: false }), 1);
    }
    if (e.squeeze) {
      const q = e.squeeze, k = (q.to - q.x0) / (q.x1 - q.x0);
      for (const p of kids(s)) for (const sg of p.segments) if (-sg.point.y < (q.ymax ?? 1e4) && sg.point.x > q.x0) {
        sg.point = P(q.x0 + (sg.point.x - q.x0) * k, sg.point.y);
        sg.handleIn = P(sg.handleIn.x * k, sg.handleIn.y); sg.handleOut = P(sg.handleOut.x * k, sg.handleOut.y);
      }
    }
  }
  return s;
}
const letters = F.chars.map((ch, i) => {
  const L = F.letters[i], s = glyph(ch), k = F.em / font.unitsPerEm;
  s.scale(k * L.stretch, k, P(0, 0)); s.translate(P(L.x, F.baseline));
  return { ch, d: fix(s.pathData, 3) };
});
fs.writeFileSync(out, JSON.stringify({ kind: 'text', font: F.outline_font, wght: F.wght, em: F.em, baseline: F.baseline, letters, d: letters.map((l) => l.d).join(' ') }));
console.log(`outlines: ${letters.length} letters${Object.keys(E).length ? ', edits for ' + Object.keys(E).join('') : ''} -> ${path.basename(out)}`);

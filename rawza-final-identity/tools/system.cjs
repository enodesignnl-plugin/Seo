// The brand system for both directions: wordmark, lockups and secondary mark, as positioned
// groups of outlines. Every piece is { id, item } with the item already in place.
// Units: the wordmark's cap height is 700 (cap line y = 0, baseline y = 700).
const { rect, translate, scale, union } = require('./lib.cjs');
const { line } = require('./text.cjs');
const { mark } = require('./saffron.cjs');
const royal = require('./royal.cjs');
const warm = require('./warm.cjs');

// the saffron mark, final form (asymmetric: the threads lean as a picked stigma does)
const SMALL = { nib: 86, min: 0.16, pow: 2, stem: false };
const SAFFRON = { threads: [[-6, -336, -8], [-100, -270, -30], [124, -250, 60]], pow: 2.4, nib: 62, stem: 44 };

function wordmark(M) {
  const { glyphs, pos } = M.set();
  return glyphs.map((g, i) => ({ id: g.id, item: translate(g.shape, pos[i], 0) }));
}
const boundsOf = (pieces) => pieces.map((p) => p.item.bounds).reduce((a, r) => a.unite(r));
// horizontal centre of the letters themselves (cap height band), ignoring tails below the baseline
function capCentre(pieces) {
  const clip = rect(-1e4, 0, 1e4, 700);
  const b = pieces.map((p) => p.item.intersect(clip, { insert: false }).bounds).reduce((a, r) => a.unite(r));
  return b.center.x;
}

// descriptor line, centred on cx with its cap line at y; optional flanking rules
function descriptor(spec, cx, y) {
  const t = line(spec.font, spec.text, { cap: spec.cap, track: spec.track });
  const out = [{ id: 'descriptor-text', item: translate(t, cx - t.bounds.width / 2 - t.bounds.x, y) }];
  if (spec.rule) {
    const b = out[0].item.bounds, { len, gap, w } = spec.rule, ym = y + spec.cap / 2;
    out.push({ id: 'rule-left', item: rect(b.x - gap - len, ym - w / 2, b.x - gap, ym + w / 2) });
    out.push({ id: 'rule-right', item: rect(b.x + b.width + gap, ym - w / 2, b.x + b.width + gap + len, ym + w / 2) });
  }
  return out;
}

const DESC = {
  A: { font: 'CormorantGaramondV-600.ttf', cap: 92, track: 0.42 },
  B: { font: 'Fraunces-S100-380.ttf', cap: 78, track: 0.4 },
};
const TEXTS = { full: 'AFGHAANS RESTAURANT', short: 'RESTAURANT' };

// ---- Direction A
function A(opts = {}) {
  const wm = wordmark(royal);
  const cx = capCentre(wm);
  const out = { wordmark: wm };
  // emblem above the cap line: the saffron mark, 0.5 of the cap height
  const m = scale(mark(SAFFRON), opts.markScale ?? 1);
  const em = translate(m, cx - m.bounds.center.x, -(opts.markGap ?? 210) - (m.bounds.y + m.bounds.height));
  out.emblem = [{ id: 'saffron-mark', item: em }];
  const text = TEXTS[opts.text || 'full'];
  out.descriptor = descriptor({ ...DESC.A, text, rule: opts.rule === false ? null : { len: 150, gap: 56, w: 4 } }, cx, opts.descY ?? 900);
  // the stand-alone mark is cut heavier and without the stem, so it holds at avatar and favicon size
  out.monogram = [{ id: 'saffron-mark', item: mark({ ...SAFFRON, ...SMALL }) }];
  return out;
}

// ---- Direction B
function B(opts = {}) {
  const wm = wordmark(warm);
  const cx = capCentre(wm);
  const out = { wordmark: wm };
  const text = TEXTS[opts.text || 'full'];
  out.descriptor = descriptor({ ...DESC.B, text }, cx, opts.descY ?? 920);
  // monogram: the R alone, its tail drawn shorter so the mark sits in a square
  out.monogram = [{ id: 'letter-R', item: warm.R(opts.monoReach ?? 960, { bx: 170, dip: 84, lift: 52 }).shape }];
  if (opts.monoMark) {
    const m = scale(mark(SAFFRON), opts.monoMark);
    out.monogram.push({ id: 'saffron-mark', item: translate(m, 690 - m.bounds.center.x, 600 - (m.bounds.y + m.bounds.height)) });
  }
  return out;
}

module.exports = { A, B, boundsOf, capCentre, SAFFRON, TEXTS };

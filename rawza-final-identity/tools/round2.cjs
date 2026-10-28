// Round 2 lockups after the client's feedback: the swash R shortened (entry and tail), the
// descriptor larger and heavier, and new combinations with the round 2 symbols.
// Every lockup returns groups { group, pieces } for svgout.place(). Units: cap height 700.
const { translate, scale, union, rect } = require('./lib.cjs');
const { line } = require('./text.cjs');
const SW = require('./swash.cjs');
const E = require('./emblem.cjs');
const L = require('./leafmark.cjs');
const royal = require('./royal.cjs');
const S = require('./system.cjs');

const DESC = { font: 'Montserrat-600.ttf', cap: 112, track: 0.46 };
const TEXT = { full: 'AFGHAANS RESTAURANT', short: 'RESTAURANT' };
const bounds = (pieces) => pieces.map((p) => p.item.bounds).reduce((a, r) => a.unite(r));
// centre of the capitals (cap line to baseline), ignoring the swash strokes outside it
function capCentre(pieces) {
  const clip = rect(-1e4, 0, 1e4, 700);
  return pieces.map((p) => p.item.intersect(clip, { insert: false }).bounds).reduce((a, r) => a.unite(r)).center.x;
}
function desc(text, o = {}) {
  const d = { ...DESC, ...o };
  return line(d.font, text, { cap: d.cap, track: d.track });
}
// set the descriptor right-aligned at `right`, its cap line at y; if it comes closer than `gap` to
// the R's tail, track it tighter (down to 0.3 of the cap height), then move it down
function fitDescriptor(text, R, right, y, o = {}) {
  const gap = o.gap ?? 70;
  let track = (o.desc && o.desc.track) ?? DESC.track, dy = 0, item, d;
  for (let i = 0; i < 40; i++) {
    const t = desc(text, { ...(o.desc || {}), track });
    item = translate(t, right - t.bounds.width - t.bounds.x, y + dy);
    d = royal.minDistance(R, item, 600);
    if (d >= gap) break;
    if (track > 0.3) track = Math.max(0.3, track - 0.02); else dy += 10;
  }
  return { item, track, dy, clearance: d };
}
// the swash wordmark with the short R
function swashWord() { return SW.lockup({ R: SW.SHORT, text: false }).wordmark; }
// symbols, each centred on x = 0 with its base at y = 0
const SYM = {
  lancet: () => { const m = L.lancet(); return union([m.left, m.right]); },
  archRosette: (o = {}) => {
    const fr = E.ogee().frame;
    const ros = translate(E.rosette({ r: 170, hole: 38, seed: 19, w: [25, 25], w2: [19, 19] }), 0, -525);
    return o.split ? { frame: fr, rosette: ros } : union([fr, ros]);
  },
  rosette: () => translate(E.rosette(), 0, -300),
  archLancet: () => { const m = L.lancet(); return union([E.ogee().frame, translate(scale(union([m.left, m.right]), 0.46, 0, 0), 0, -235)]); },
  archR: () => {
    const r = SW.R({ bowlStartX: -60, leg: [[5, 500], [260, 580], [470, 760], [620, 900]] }).shape;
    const rs = scale(r, 0.36, r.bounds.center.x, r.bounds.center.y);
    return union([E.ogee().frame, translate(rs, -rs.bounds.center.x + 6, -505 - rs.bounds.center.y)]);
  },
};
// symbol as pieces: [{ id, item, accent }] (accent pieces may take the lapis colour)
function symPieces(name) {
  if (name === 'archRosette') { const r = SYM.archRosette({ split: true }); return [{ id: 'frame', item: r.frame }, { id: 'rosette', item: r.rosette, accent: true }]; }
  if (name === 'rosette') return [{ id: 'rosette', item: SYM.rosette(), accent: true }];
  return [{ id: name, item: SYM[name]() }];
}
// scale pieces together about the origin, then move them so they are centred on cx with their
// bottom at `bottom`
function placePieces(pieces, cx, bottom, k = 1) {
  const sc = pieces.map((p) => ({ ...p, item: scale(p.item, k, 0, 0) }));
  const b = sc.map((p) => p.item.bounds).reduce((a, r) => a.unite(r));
  return sc.map((p) => ({ ...p, item: translate(p.item, cx - b.center.x, bottom - (b.y + b.height)) }));
}
const place = (item, cx, bottom, k = 1) => { const s = scale(item, k, 0, 0); return translate(s, cx - s.bounds.center.x, bottom - (s.bounds.y + s.bounds.height)); };

// 1 — swash, short: descriptor nested over the tail, right-aligned under AWZA
function swash(o = {}) {
  const wm = swashWord();
  const fit = fitDescriptor(TEXT[o.text || 'full'], wm[0].item, wm[4].item.bounds.right - (o.inset ?? 60), o.descY ?? 1010, o);
  const out = [{ group: 'wordmark', pieces: wm }, { group: 'descriptor', pieces: [{ id: 'descriptor', item: fit.item }] }];
  out.fit = fit;
  if (o.symbol) {
    const cx = capCentre(wm);
    out.unshift({ group: 'symbol', pieces: placePieces(symPieces(o.symbol), cx, -(o.symGap ?? 200), o.symScale ?? 0.72) });
  }
  return out;
}
// 2 — classic, after the client's reference: arch-and-rosette emblem over the release RAWZA,
// descriptor centred below
function classic(o = {}) {
  const r = S.Aref({ preset: S.RELEASE });
  const wm = r.wordmark, cx = capCentre(wm);
  const t = desc(TEXT[o.text || 'full'], { cap: 96, track: 0.5, ...(o.desc || {}) });
  const em = placePieces(symPieces(o.symbol || 'archRosette'), cx, -170, 0.62);
  return [{ group: 'symbol', pieces: em }, { group: 'wordmark', pieces: wm },
    { group: 'descriptor', pieces: [{ id: 'descriptor', item: translate(t, cx - t.bounds.width / 2 - t.bounds.x, 960) }] }];
}
// 3 — Rawza: the short swash R with the concept B lowercase (Cormorant Upright) awza
function titlecase(o = {}) {
  const G = require('./garden.cjs');
  const { glyphs, pos } = G.set();
  const r = SW.R({ ...SW.SHORT, leg: [[5, 500], [300, 585], [600, 860], [900, 1080], [1100, 1220], [1300, 1290], [1450, 1300], [1530, 1300], [1600, 1290], [1660, 1272]] }).shape;
  const shift = (o.xa ?? 780) - (pos[1] + glyphs[1].shape.bounds.x);
  const wm = [{ id: 'letter-R', item: r }, ...glyphs.slice(1).map((g, i) => ({ id: g.id, item: translate(g.shape, pos[i + 1] + shift, 0) }))];
  // the shorter word leaves no room beside the tail: the tail underlines the word and the
  // descriptor is centred below it
  const t = desc(TEXT[o.text || 'full'], { cap: 92, track: 0.46, ...(o.desc || {}) });
  const cx = bounds(wm).center.x, y = r.bounds.bottom + (o.descGap ?? 120);
  const item = translate(t, cx - t.bounds.width / 2 - t.bounds.x, y);
  const out = [{ group: 'wordmark', pieces: wm }, { group: 'descriptor', pieces: [{ id: 'descriptor', item }] }];
  out.fit = { clearance: royal.minDistance(r, item, 600), track: 0.46, dy: 0 };
  return out;
}
module.exports = { SYM, symPieces, placePieces, swash, classic, titlecase, swashWord, desc, DESC, TEXT };

// Small-size variant of the release lockup (≤ about 300 px wide). Run in its own process because
// the letters come from a heavier instance: RAWZA_A_WGHT=500 node small.cjs <out.json>
// Heavier hairlines (wght 500), wider spacing, a shorter and sturdier R tail that does not thin
// out to nothing, a bolder icon and a larger descriptor. Prints the placed artboard as JSON.
const S = require('./system.cjs');
const { place } = require('./svgout.cjs');
const SMALL = {
  ...S.RELEASE,
  gap: 262,
  reach: 255,
  R: { ...S.RELEASE.R, dip: 58, lift: 22, t1: 0.5, end: 0.3, point: null },
};
const r = S.Aref({
  preset: SMALL, iconGap: 340, iconScale: 1.3,
  iconOpts: { thread: 10, dot: 15, leaf: 34, side: 40 },
  descCap: 118, descTrack: 0.34, descY: 930,
});
const groups = [{ group: 'saffron-threads', pieces: r.threads }, { group: 'crocus-leaves', pieces: r.leaves }, { group: 'wordmark', pieces: r.wordmark }, { group: 'descriptor', pieces: r.descriptor }];
const out = { lockup: place(groups), wordmark: place([{ group: 'wordmark', pieces: r.wordmark }]), clearance: require('./royal.cjs').set(SMALL).clearance };
require('fs').writeFileSync(process.argv[2], JSON.stringify(out));

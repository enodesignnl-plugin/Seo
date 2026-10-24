// The saffron mark: the three stigmas of the saffron crocus (the threads that are the spice; Herat
// saffron is one of Afghanistan's best-known products). Each thread is one stroke of the same
// broad nib (qalam.cjs, angle -28°) that draws the R's leg: a hairline for most of its length
// from the shared base, bending in a slow S, then opening into the trumpet of the stigma, whose
// open end is cut as a shallow cup. Because the nib angle is fixed, the threads take different
// weights from their direction, as pen strokes do.
// Units: the mark is drawn about 350 high; the base of the threads is at (0, 0), tips point up.
const { union, sub, circle } = require('./lib.cjs');
const { stroke } = require('./qalam.cjs');
const { dropSpecks } = require('./edit.cjs');

const ANGLE = -28;
const ease = (u) => { u = Math.min(1, Math.max(0, u)); return u * u * (3 - 2 * u); };
// th: { tip, c1, c2 }, a cubic from the base (0, 0) to the tip
function thread(th, o) {
  const pts = [[0, 0], th.c1, th.c2, th.tip];
  // hairline up to f0, then opening into the trumpet
  const pressure = (t) => o.min + (1 - o.min) * Math.pow(ease((t - o.f0) / (1 - o.f0)), o.k);
  let s = stroke(pts, { nib: o.nib, angle: ANGLE, pressure, samples: 400, tolerance: 0.25 });
  if (o.cup) {
    // the open end of the trumpet: a shallow cup cut into the tip along the thread's direction
    const [x, y] = th.tip, [cx, cy] = th.c2, L = Math.hypot(x - cx, y - cy), f = o.cup * o.cupOff;
    s = sub(s, circle(x + (x - cx) / L * f, y + (y - cy) / L * f, o.cup));
  }
  return s;
}
const THREADS = [
  { tip: [-6, -350], c1: [22, -140], c2: [-30, -250] },
  { tip: [-128, -262], c1: [-14, -150], c2: [-118, -170] },
  { tip: [112, -300], c1: [34, -110], c2: [90, -210] },
];
function mark(o = {}) {
  const opt = { nib: 62, min: 0.07, f0: 0.48, k: 1.3, cup: 24, cupOff: 0.9, stem: 60, threads: THREADS, ...o };
  const parts = opt.threads.map((th) => thread(th, opt));
  // the style: a short hairline stem below the point where the threads part
  if (opt.stem) parts.push(stroke([[0, 0], [0, opt.stem / 3], [0, 2 * opt.stem / 3], [0, opt.stem]], { nib: opt.nib, angle: ANGLE, pressure: (t) => opt.min * (1 - 0.4 * t), samples: 60 }));
  return dropSpecks(union(parts));
}
module.exports = { mark };

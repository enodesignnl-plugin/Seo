// Direction B: glyph order, ids and optical spacing (measured in the x-height band)
const B = require('./direction-b-v3.cjs');
const { space } = require('./spacing.cjs');
module.exports = () => {
  const glyphs = [
    { id: 'letter-R', ...B.R() }, { id: 'letter-a-1', ...B.a() }, { id: 'letter-w', ...B.w() },
    { id: 'letter-z', ...B.z() }, { id: 'letter-a-2', ...B.a() }];
  const pos = space(glyphs, { y0: B.XH, y1: B.H, depth: 100, gap: 64, minGap: 22, extra: [0, 30, 0, 0, 0] });
  return { glyphs, pos };
};

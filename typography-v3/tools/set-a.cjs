// Direction A: glyph order, ids and optical spacing
const A = require('./direction-a-v3.cjs');
const { space } = require('./spacing.cjs');
module.exports = () => {
  const glyphs = [
    { id: 'letter-R', ...A.R() }, { id: 'letter-A-1', ...A.A() }, { id: 'letter-W', ...A.W() },
    { id: 'letter-Z', ...A.Z() }, { id: 'letter-A-2', ...A.A() }];
  const pos = space(glyphs, { y0: 0, y1: 700, depth: 120, gap: 96, minGap: 34, extra: [0, 20, 0, 0, 0] });
  return { glyphs, pos };
};

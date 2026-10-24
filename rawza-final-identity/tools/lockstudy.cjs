const S = require('./system.cjs');
const { translate } = require('./lib.cjs');
const { render } = require('./view.cjs');
const out = process.argv[2], which = process.argv[3], opts = JSON.parse(process.argv[4] || '{}'), part = process.argv[5] || 'lockup';
const sys = S[which](opts);
let pieces = part === 'monogram' ? sys.monogram : [...sys.wordmark, ...(sys.emblem || []), ...sys.descriptor];
render(out, pieces, { width: 1200, pad: 120 });

# Letter edits

When a fitted font letter differs from the reference, change the outline with an edits file
instead of tracing the letter. It stays a clean font outline and keeps its consistency with
the other letters.

## 1. Look at the glyph's contours

```bash
node scripts/textpath.cjs --contours <work>/fonts/CormorantGaramond-500.ttf W
```

Use the static instance in `<work>/fonts/`; fitfont made it. Example output:

```
contour 0: x -2..483  y -3..625 (up)  30 points  outer
contour 1: x 264..932  y -3..625 (up)  45 points  outer
contour 2: x 472..670  y 328..625 (up)  22 points  outer
```

Units are font units (often 1000 per em), with y going up and the baseline at 0. Compare
with the reference: the reference rows tell you where strokes are. For example, print the
runs of coverage on a pixel row with numpy on `t.npy` and convert with
`font units = px / size × unitsPerEm`.

## 2. Write `<work>/parts/<name>.edits.json`

```json
{
  "W": [ { "drop_contour": 2 } ],
  "A": [ { "move_contour": 0, "dy": 13 } ],
  "Z": [ { "clip": { "top": 625 } },
         { "squeeze": { "x0": 300, "x1": 564, "to": 535, "ymax": 160 } } ]
}
```

| Edit | Does | Example from RAWZA |
|---|---|---|
| `drop_contour: n` | removes contour n (run `--contours` first; numbers are per glyph) | the W's thin middle stroke crossed the thick one up to a serif of its own (contour 2). The reference stops it where it meets the thick stroke, so there are 3 serifs on top |
| `move_contour: n, dx, dy` | shifts one contour, in font units, y up | the A's crossbar (contour 0) sat 2.8 px lower than in the reference: dy 13 at size 216 px |
| `clip: {top, bottom, left, right}` | cuts everything beyond | the Z's top-left flag rose to 656; the reference stops at the cap line 625 |
| `squeeze: {x0, x1, to, ymax}` | points right of x0 and below ymax are pulled in, linearly, so x1 lands on `to` | the Z's foot serif reached 564, the top bar 535; the reference ends both at the same x |

Edits apply in the order listed; drop and move act on the font's contours before anything
else. A letter that occurs twice (A … A) gets the same edits, which keeps them identical.

## 3. Rebuild that part and check

```bash
node scripts/textpath.cjs <work>/parts/<name>.fit.json <work>/parts/<name>.json
node scripts/build.cjs <work>/logo.json && python3 scripts/compare.py <work>/logo.json
```

The letter's shape overlap should go up. In RAWZA:

- A went from 84.6% to 89.3%;
- W from 79.1% to 83.6%;
- Z from 85.1% to 87.4%.

If an edit cannot express the difference, trace that one letter instead with `trace.py`.
It will match better, but it is no longer the font.

---
name: logo-naar-svg
description: Rebuild a logo from a picture (PNG, JPG, screenshot, AI-generated image) as clean, Illustrator-ready SVG vectors. It identifies the fonts, traces emblems and hand-drawn letters, measures the exact colours and positions, and exports layered SVG, PDF and PNG files with a comparison sheet. Use this whenever someone wants a logo, wordmark, emblem, icon or lettering "exact nagemaakt", vectorised, traced, redrawn, converted to SVG/vector/Illustrator/AI/EPS/PDF, or asks which font or colour codes a logo uses — also when they only send an image and say "kan je dit na maken", "maak hier een vector van" or "zet dit om naar SVG", even without naming the format.
---

# Logo naar SVG

Turn a reference image of a logo into vector files a designer can open in Illustrator and
keep working with: real font outlines where the lettering is a font, clean traced paths
where it is drawn, the reference's own colours, positions and sizes, measured rather than
guessed.

The scripts do the measuring and the geometry; your job is to choose the parts, read the
numbers, look at the renders, and talk the client through the choices.

## What clients care about (learned the hard way)

- **"Exact" means the reference, not an improvement of it.** Keep every position, size and
  spacing of the reference unless the client asks for a change. When you see something you
  would improve (spacing that is not equal, an emblem that is not centred), say so with the
  numbers and let them decide. In the RAWZA project, "equalising" the letter spacing moved
  the W 7 px. The client then saw the tower sit differently over the W and had to push back
  twice before it was undone.
- **When they do ask for alignment** ("alle afstanden gelijk", "precies in het midden"),
  apply exactly that one rule, measure the reference first, and report before → after in px.
  Say what you measure, too: Illustrator-style bounding boxes, or optical spacing, or the
  centre of what.
- **They check by eye, side by side.** Always deliver the comparison sheet. If they say
  something looks different, measure both images before arguing. Their eye is usually right
  about something, even when it is not the thing they named.
- **Colours are asked for as codes.** Give HEX and RGB, measured. A part can have its own
  tone; the RAWZA tower was darker than the letters.
- **Gold has to read as gold, not yellow** (see Colours below).

## Workflow

Scripts are in `scripts/` next to this file; call them by path. Use a work folder per logo,
for example `<project>/<logo>-vector/werk/`, with the output in `<project>/<logo>-vector/`.

### 0. Setup (once per machine)

```bash
bash scripts/setup.sh        # potrace, inkscape, xmllint, numpy/scipy/pillow/fonttools, node packages
```

### 1. Measure the reference

```bash
python3 scripts/analyse.py <image> <work>
```

This writes the following into `<work>`:

| File | What it holds |
|---|---|
| `t.npy` | Coverage per pixel |
| `meta.json` | Size, background colour and ink colour |
| `parts.txt` | Every shape with its box and colour |
| `overview.png` | The image with each shape boxed and numbered |

Look at `overview.png` and decide the parts. Typical parts:

- an emblem or icon;
- a hand-drawn or swash letter;
- each line of lettering that is a font;
- a tagline.

Note each part's box and, if needed, its shape numbers.

### 2a. Drawn parts: trace

```bash
python3 scripts/trace.py <work> toren --box 545,400,712,590 --mirror auto
python3 scripts/trace.py <work> r --box 185,585,455,845 --parts 7
```

How the box works:

- Only shapes lying wholly inside the box are used. A neighbour that crosses the box edge is ignored.
- `--parts` picks shape numbers from `parts.txt` when other artwork also lies inside the box.

Options:

| Option | Use it for |
|---|---|
| `--mirror auto` | Symmetric emblems. It finds the axis and makes both halves identical. The difference it prints should be below 0.02 for a truly symmetric original; otherwise drop the option. |
| `--tol` | Default 0.12 px. Raise it (0.2–0.3) for fewer, smoother anchor points. Lower it for more detail. |
| `--tip-turn` | Default 70°. Sharpens points that the blurry source rounded off. Set 0 for designs with rounded ends. |

A traced swash letter matched the reference at 95% in testing. That is good enough to hand
over, and better than hand-built strokes on a small source.

### 2b. Lettering that is a font: fit and outline

Find candidate fonts first:

- **The client named one** ("met Montserrat"): use it.
- **Otherwise:** pick 3–8 plausible Google Fonts and download them:
  `scripts/getfont.sh <work>/fonts <family-folder> "<File>[wght].ttf" OFL.txt`

Good starting sets:

| Style | Fonts to try |
|---|---|
| High-contrast serif capitals | Cormorant Garamond, Cormorant, Cinzel, EB Garamond, Playfair Display, Libre Caslon Display, Gilda Display, Marcellus, Bodoni Moda |
| Geometric sans | Montserrat, Poppins, Raleway, Josefin Sans, Jost |
| Humanist sans | Lato, Open Sans, Source Sans 3 |

```bash
python3 scripts/fitfont.py <work> woord --box 365,612,1065,764 --text AWZA \
    --fonts <work>/fonts/A.ttf,<work>/fonts/B.ttf --weights 400,500,600 --stretch
python3 scripts/fitfont.py <work> ondertitel --box 422,792,1062,828 --text "AFGHAANS RESTAURANT" \
    --fonts <work>/fonts/Montserrat[wght].ttf --weights 500,550,600
```

How to use the options:

- `--stretch` is for big display lettering that may be drawn wider or narrower than the font. AI-generated logos often are.
- Leave `--stretch` off for small text such as taglines.
- Scan weights in steps of 50 around the best one. An in-between weight such as 550 is fine: Illustrator can set it in the variable font panel.

What fitfont prints:

- The ranking of fonts and weights.
- The chosen size and baseline.
- The tracking in px and in Illustrator units, and how far each letter is off uniform tracking. If every letter is off by less than about 0.5 px, the original was set with uniform tracking.
- `--uniform` puts the letters exactly on that tracking.

**Then compare letter by letter.** A font is never the whole story for an AI-drawn or
custom logo. Render the sheet in step 4 and look for letters drawn differently from the
font. Examples from RAWZA:

- a W without the crossing middle stroke;
- a Z flag that does not rise above the cap line;
- an A crossbar sitting higher;
- a Z foot serif that does not stick out.

Fix these with `<work>/parts/<name>.edits.json`. See [references/letter-edits.md](references/letter-edits.md); the contour listing comes from `node scripts/textpath.cjs --contours <font> W`. Then rerun:

```bash
node scripts/textpath.cjs <work>/parts/woord.fit.json <work>/parts/woord.json
```

In RAWZA this raised those letters from about 80% to about 88%.

### 3. Assemble and export

Write `<work>/logo.json`. The format is documented at the top of `scripts/build.cjs`. It sets:

- the layers and path ids in capitals, named the way the client speaks (`TOREN_BLOEM`, `WOORDMERK`, `ONDERTITEL`);
- the colour variants;
- the alignment rules. Start with `"align": []`, which keeps the reference positions exactly. Add rules only when asked.

```bash
node scripts/build.cjs <work>/logo.json
```

This writes `SVG/`, `PDF/` and `PNG/` (3000 px) for each variant. It checks the following:

- every subpath is closed;
- there is no style, text or `<use>`;
- the XML is valid.

Units: 1 reference pixel is 1 px in Illustrator.

Usual variants:

- the main colour on the background, at canvas size (`"canvas": true`);
- the same, cropped;
- free-standing in the main colour, in a dark colour, in black and in white;
- "Voorbeeldkleuren", with the exact measured colours, when the main colour differs from the reference.

### 4. Check

```bash
python3 scripts/compare.py <work>/logo.json
```

This writes `<name>_Vergelijking.png` with three panels: the reference, the vector, and contours over the reference. Per part and per letter it prints:

- **shape:** the overlap at the best offset;
- **moved:** that offset;
- **colour:** the measured colour under the shape.

How to read the numbers:

| Part | Expected shape overlap |
|---|---|
| Large drawn parts | 92–95% |
| Display letters | 83–90% |
| Small text | 80–88% |

Small text scores lower because blurry edges weigh more there.

Any "moved" value that no alignment rule explains is a fit error: fix it. Then **look at
the renders yourself**, zoomed in on tips, joins and serifs, before showing anything.

### 5. Deliver

In the output folder:

- `SVG/`, `PDF/`, `PNG/`;
- the comparison sheet;
- `bron/` with the reference;
- `lettertypen/` with the font files and their OFL licence;
- a `LEESMIJ.md` in the client's language. Template: [references/leesmij-template.md](references/leesmij-template.md);
- a ZIP of all of it.

Send the client the comparison sheet, the main SVG and the ZIP.

In the reply, cover:

- the fonts (name, weight, size, tracking);
- the colour codes;
- what was kept exactly and what was changed, with px;
- the overlap figures;
- the limits: source resolution, blurry details, and that the files were not opened in Illustrator itself (unless they were).

## Colours

- Measured colours come from `compare.py`, per part (median of the inner pixels). JPEG
  edges around small letters read lighter. When small text measures a little lighter than
  the large letters, it is usually the same colour; say so instead of inventing a third tone.
- **Gold that reads as gold:** keep the reference's hue (about 33–40°). Bring the saturation
  to about 0.45–0.55 and the lightness to about 0.55–0.62.
  - Light, saturated "gold" (#EDBD76, lightness 0.70, saturation 0.77) glows yellow or apricot on dark brown.
  - A redder hue (#DBA667) reads copper.
  - A desaturated one (#D6B583) reads champagne or beige.
  - #C9A063 (hue 36°, saturation 0.49, lightness 0.59) was chosen as the RAWZA gold.
  - When gold matters, render 3–4 candidates side by side on the real background, recommend one and say why.
- **Print:** flat ink gold turns mustard. Advise gold foil or a metallic ink (for example
  Pantone 871 C), and let the printer convert to CMYK with their own profile rather than
  quoting computed CMYK.

## Troubleshooting

- **analyse.py finds no artwork:** the border is not background, for example with a photo or a frame. Crop the image first.
- **fitfont "found N letter shapes":** letters touch each other (they merge into one shape) or the box is cutting a letter. Adjust the box, or fit the line in two parts.
- **Trace edges wobble:** raise `--tol`. Rounded tips that should be sharp: lower `--tip-turn` or raise `--tip-cut`.
- **A part looks paler or darker in the comparison:** expected for a part with its own tone. trace and compare normalise per part.

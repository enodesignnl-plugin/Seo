# RAWZA — brand identity exploration

Two identity directions for RAWZA, a premium Afghan restaurant in Apeldoorn.

- **Concept A — The Signature**: wide, high-contrast custom capitals. Its signature details are an R whose leg becomes a hairline tail under the A, a crossed W and low-bar A's.
- **Concept B — Contemporary Heritage**: condensed glyphic capitals with arch-shaped A's and a chahar-bagh (four-part garden) emblem with a lapis pool.

## Open it

Double-click `index.html`, or drag it into Chrome, Safari, Firefox or Edge. It needs no server and no internet connection, because the fonts, references and logos are all inside this folder.

## Contents

| Path | What it is |
|---|---|
| `index.html` | The presentation (generated — edit `tools/index.src.html` instead) |
| `styles.css`, `script.js` | Layout, mockups and the small interactions (subtitle and size toggles, day/evening sign, resize sliders) |
| `concepts/concept-a/`, `concepts/concept-b/` | Standalone SVG logos for Illustrator: primary, alternative, monogram/emblem, small cut |
| `assets/fonts/` | Cormorant Garamond and Jost (SIL Open Font License, licences included) |
| `assets/references/` | The client references analysed in section 00 |
| `assets/patterns/` | Garden-pattern tiles generated from the emblem |
| `tools/` | The generator that draws every letterform and lockup |

## Rebuilding the artwork

```
cd tools
npm install
npm run build
```

The letters are defined as geometry in `tools/concept-a.cjs` and `tools/concept-b.cjs`. Each module has a `make({ ... })` factory: its defaults produce the display cut, and heavier hairlines give the small cut. The build then writes the SVG exports, the pattern tiles and `index.html`.

All artwork is concept-stage vector geometry, meant for evaluation and as a starting point for refinement in Illustrator. It is not final production artwork.

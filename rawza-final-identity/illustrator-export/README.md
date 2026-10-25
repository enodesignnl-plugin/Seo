# RAWZA: Illustrator export package

The approved RAWZA logo (source: `rawza-final-identity/release/`), prepared as clean, editable vector files. Nothing in the design was changed.

## Contents

| Folder / file | What it is |
|---|---|
| `SVG/` | 13 production SVG files (see the list below) |
| `PNG/` | High-resolution transparent previews of each SVG: 4000 px wide, the saffron symbol 1600 px |
| `RAWZA_Contact_Sheet.png` | Overview of all variants |
| `Fonts/` | Cormorant Garamond (variable font, SIL OFL 1.1) and its licence. Only needed for `RAWZA_Descriptor_Editable.svg` |
| `RAWZA_Illustrator_Export.zip` | The whole package in one archive |

### SVG files

| File | Use |
|---|---|
| `RAWZA_Logo_Gold.svg` | Full logo, one colour gold |
| `RAWZA_Logo_Colour.svg` | Full logo, gold with saffron threads |
| `RAWZA_Logo_Black.svg` | Full logo, black |
| `RAWZA_Logo_White.svg` | Full logo, white (for dark backgrounds) |
| `RAWZA_Wordmark_Gold.svg` | RAWZA only, gold |
| `RAWZA_Wordmark_Black.svg` | RAWZA only, black |
| `RAWZA_Saffron_Gold.svg` | Saffron symbol only, gold |
| `RAWZA_Saffron_Colour.svg` | Saffron symbol only, gold with saffron threads |
| `RAWZA_Saffron_Black.svg` | Saffron symbol only, black |
| `RAWZA_Logo_Small.svg` | Small-size variant (below about 300 px wide), black |
| `RAWZA_Logo_Small_Colour.svg` | Small-size variant, gold with saffron threads |
| `RAWZA_Foil_OneColour.svg` | One-colour separation for foil, for review by the printer |
| `RAWZA_Descriptor_Editable.svg` | Full logo with "AFGHAANS RESTAURANT" as live, editable text |

## Colours (exact values from the approved release)

| Name | HEX | Used for |
|---|---|---|
| Gold | `#CFAE6E` | Letters, descriptor, leaves |
| Saffron | `#C9573A` | Saffron threads (colour versions only) |
| Black | `#000000` | Black versions and the foil plate |
| White | `#FFFFFF` | White version |

The files are in RGB with explicit fill colours. No CMYK, Pantone or foil reference has been chosen. Your printer should match gold and saffron to a spot colour or foil, using a printed proof.

## Structure in every file

Every path has its own name, which Illustrator shows in the Layers panel:

```
01_SAFFRON_ICON        SAFFRON_LEAVES
02_WORDMARK_RAWZA      LETTER_R, LETTER_A_01, LETTER_W, LETTER_Z, LETTER_A_02
03_DESCRIPTOR          DESC_01_A … DESC_18_T   (one compound path per letter)
                       or DESCRIPTOR_TEXT       (live text, editable version only)
04_COLOUR_COMPONENTS   SAFFRON_THREADS          (the parts that carry the saffron colour)
```

- **Shapes:**
  - Every letter is one compound path, with its counters as holes. The letters are not merged.
  - Every path is a real outline with `fill-rule="nonzero"` and an explicit `fill`.
- **Clean file:**
  - No strokes, CSS, classes, `<use>`, `<defs>`, clipping masks, filters, gradients or embedded images.
  - Transparent background, `viewBox` matching the artwork.
- **Saffron threads:**
  - They sit in `04_COLOUR_COMPONENTS`, so the accent colour can be changed in one place.
  - The part of the threads that was hidden under the leaves has been removed, so no shapes overlap. The visible shape is unchanged.
  - In the one-colour files the threads carry the same colour as the rest.
- **Wordmark and saffron files:** these contain only the groups they need.

## Opening and editing in Illustrator

1. **Open:** File › Open, then choose the SVG. The artboard follows the `viewBox`. 1 SVG unit is 0.25 px, so the full logo opens at about 1034 × 440 px. Scale freely; it is vector.
2. **Select a single letter:** use the Direct Selection tool or the Layers panel. Groups and paths keep the names above.
3. **Recolour:**
   - Select a group in the Layers panel, then change the fill.
   - For the saffron colour, select `04_COLOUR_COMPONENTS`.
4. **Save as native AI:** File › Save As › Adobe Illustrator (`.ai`). This package contains no `.ai` file, because it was not made in Illustrator. Saving the SVG as `.ai` yourself gives you a genuine AI document.
5. **Avoid simplifying paths:** do not use Object › Path › Simplify on the letters, because it changes the approved curves.

## Editable descriptor

`RAWZA_Descriptor_Editable.svg` has the same artwork as the black logo, but "AFGHAANS RESTAURANT" is live text. The settings below match the approved outlines.

| Setting | Value |
|---|---|
| Font | Cormorant Garamond SemiBold (weight 600) |
| Size | 128 SVG units, which is 32 pt when opened at 1034 px wide. The cap height is 80 units. |
| Tracking | 40 units = 0.3125 em, which is **313** in Illustrator's tracking field (1/1000 em) |
| Kerning | The font's own kerning, "Metrics" in Illustrator |
| Position | Left aligned at x = 937.66, baseline y = 1697.65 in SVG units. Optically centred under RAWZA. |
| Colour | `#000000` |

- **Installing the font:** install `Fonts/CormorantGaramond[wght].ttf` first, or the static "Cormorant Garamond SemiBold" from Google Fonts. The included file is version 4.001 of the variable font from the Google Fonts repository.
- **Licence:** SIL Open Font License 1.1 (`Fonts/OFL.txt`). Free for commercial use, including logos and print.
- **Check after opening:** after File › Open, check in the Character panel that tracking reads 313. SVG letter-spacing does not always come in as tracking in every Illustrator version.
- **For production:** use the outlined files. They do not need the font.

## Foil file

`RAWZA_Foil_OneColour.svg` is a single plate.

- Every black area is foil: 100 % solid, with no tints, gradients or simulated foil effects.
- No shapes overlap.
- The R tail and the saffron threads taper to fine points, and the A's have thin hairlines. Have your printer check the minimum line width for the foil and the size you choose. For small applications, use the small-size variant instead.

## Small-size variant

- **Changes:** heavier letters, wider spacing, a shorter R tail, a bolder symbol and a larger descriptor.
- **When to use it:** below about 300 px wide, or the equivalent in print.
- **Even smaller:** below about 100 px, use the wordmark without the descriptor.

## Verification done

- **Pixel comparison:** every SVG was rendered with Inkscape 1.2.2 at 2400 px and compared with the approved release files, in the same colour. Lettering, kerning, proportions, symbol placement and descriptor match. The only differences are anti-aliasing at edges: at most 31/255 on single pixels, no pixel differs by more than 40/255. The wordmark files are identical.
- **Editable descriptor:** rendered with Cormorant Garamond installed, it matches the outlined version within the same tolerance.
- **Path checks:** all 198 paths have no self-intersections and correctly oriented counters. All files are valid XML and open in Inkscape without missing objects.
- **Not tested:** the files have **not** been opened in Adobe Illustrator itself; no Illustrator was available. They use only basic SVG 1.1 that Illustrator supports, but please open them once and check them.

To rebuild from the source: `cd rawza-final-identity/tools && node export-illustrator.cjs`.

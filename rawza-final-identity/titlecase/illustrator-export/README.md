# Rawza: title-case variant (Illustrator export)

This is a variant of the approved RAWZA logo, set as **Rawza**: a capital R followed by lowercase letters.

## What it is made of

| Part | Source |
|---|---|
| **R** | Exactly the approved release R, including its broad-nib sweep. In this variant the sweep runs under the first **a**. |
| **a, w, z, a** | Lowercase from the same font as the release: Cormorant Garamond, weight 420. |
| **Saffron icon and descriptor** | Same icon, colours and descriptor font as the release. |

The release details carry over to the lowercase letters:

- **w:** the font's lowercase w already ends the left hairline inside the right heavy stroke, the same construction as the custom W. It gets the same soft join brackets and the trimmed inner serif.
- **z:** the flag at the top left and the beak at the bottom right are softened with the same warps as the capital Z.
- **Spacing:** optical spacing, measured from the x-height to the baseline.
- **Icon:** 170 units above the cap line. With lowercase letters next to the R, there is no risk of it reading as an accent.
- **Descriptor:** cap height 74 and tracking 0.46 × cap height (the release uses 80 and 0.50). The title-case word is shorter, so the descriptor is set slightly smaller to stay in proportion.

## Files

| File | Use |
|---|---|
| `SVG/RAWZA_Titlecase_Logo_Gold.svg` | Full logo, one colour gold |
| `SVG/RAWZA_Titlecase_Logo_Colour.svg` | Full logo, gold with saffron threads |
| `SVG/RAWZA_Titlecase_Logo_Black.svg` | Full logo, black |
| `SVG/RAWZA_Titlecase_Logo_White.svg` | Full logo, white |
| `SVG/RAWZA_Titlecase_Wordmark_Gold.svg` | Rawza only, gold |
| `SVG/RAWZA_Titlecase_Wordmark_Black.svg` | Rawza only, black |
| `SVG/RAWZA_Titlecase_Foil_OneColour.svg` | One-colour foil separation |
| `SVG/RAWZA_Titlecase_Descriptor_Editable.svg` | Full logo with the descriptor as live text |
| `PNG/` | Transparent previews, 4000 px wide |
| `RAWZA_Titlecase_Contact_Sheet.png` | Overview, with the approved RAWZA logo alongside for comparison |
| `Fonts/` | Cormorant Garamond (SIL OFL 1.1), for the editable descriptor only |

Use the saffron symbol on its own from the main RAWZA package (`illustrator-export/SVG/RAWZA_Saffron_*.svg`); it is the same icon.

## Structure, colours and opening

These are the same as the main package; see `illustrator-export/README.md`. The only difference is that the letter paths are named after the lowercase:

```
01_SAFFRON_ICON        SAFFRON_LEAVES
02_WORDMARK_RAWZA      LETTER_R, LETTER_a_01, LETTER_w, LETTER_z, LETTER_a_02
03_DESCRIPTOR          DESC_01_A … DESC_18_T   (or DESCRIPTOR_TEXT in the editable file)
04_COLOUR_COMPONENTS   SAFFRON_THREADS
```

Colours: gold `#CFAE6E`, saffron `#C9573A`, black `#000000`, white `#FFFFFF`.

### Editable descriptor

| Setting | Value |
|---|---|
| Font | Cormorant Garamond SemiBold (weight 600) |
| Size | 118.4 SVG units, which is 29.6 pt when opened at the default size. The cap height is 74 units. |
| Tracking | 34.04 units, which is **288** in Illustrator's tracking field |
| Position | Left aligned at x = 399.03, baseline y = 1561.65 in SVG units |

## Verification done

- **Pixel comparison:** every SVG was rendered with Inkscape 1.2.2 at 2400 px and compared with its source in `titlecase/source/`. The only differences are anti-aliasing at edges: at most 31/255, no pixel differs by more than 40/255. The wordmark files are identical.
- **Path checks:** all paths have no self-intersections and correctly oriented counters. All files are valid XML with no CSS, `<use>`, masks or filters.
- **Not tested:** the files have **not** been opened in Adobe Illustrator itself.
- **No small-size version:** this variant has not been given a separate small-size version yet.

To rebuild: `cd rawza-final-identity/tools && node build-titlecase.cjs && RAWZA_EXPORT=titlecase node export-illustrator.cjs`.

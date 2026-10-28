# RAWZA — ronde 2

Dit is de ronde na de feedback van de klant.

## Wat er veranderd is

- **De swash-R is ingekort**, in twee stappen. Na "kan die nog iets korter?" stopt de staart eerder en hoger (preset `SHORT`); `L1_Swash_ExtraKort` (preset `SHORTER`) laat de kortste stap zien.
- **AFGHAANS RESTAURANT is groter en dikker.**
  - Lettertype: Montserrat SemiBold (600).
  - Kapitaalhoogte: 112 (was 100).
- **Vijf logovarianten:**
  - L1 Swash
  - L2 Swash met boog en rozet
  - L3 Swash met Lancet
  - L4 Klassiek met boog
  - L5 Rawza in kleine letters
- **Vier nieuwe symbolen:**
  - S4 Boog met rozet
  - S5 Rozet
  - S6 Lancet in boog
  - S7 R in boog

## Bestanden

| Pad | Inhoud |
|---|---|
| `ronde-2.html` | presentatie |
| `RAWZA_Ronde2_Logos.png`, `RAWZA_Ronde2_Symbolen.png` | overzichten |
| `svg/RAWZA_R2_*.svg` | 30 vectorbestanden |
| `png/` | voorbeelden van 2400 px |

De SVG's hebben benoemde lagen: `WORDMARK`, `DESCRIPTOR` en `SYMBOL`.

De kleurversies in de bestandsnamen:

| Naam | Kleur |
|---|---|
| `Gold` | `#D6B583` |
| `Chocolate` | `#2A1A12` |
| `Black` | `#1A1410` |
| `White` | wit |
| `GoldLapis` / `ChocolateLapis` | rozet in lapis-blauw `#2B4F86` |

## Bouwen

```
cd tools
node build-round2.cjs
node round2-page.cjs
```

Bronbestanden: `tools/round2.cjs`, `tools/emblem.cjs` en `tools/swash.cjs` (preset `SHORT`).

## Controle

De paden zijn gecontroleerd: geen zelfdoorsnijdingen, juiste binnenvormen en geldige XML. In Illustrator zijn ze niet geopend. Het volledige Illustrator-pakket volgt na de keuze van de klant.

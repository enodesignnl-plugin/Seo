# RAWZA: sierlijke R, nagemaakt als vector

De R uit je referentieafbeelding (goud op chocoladebruin), opnieuw opgebouwd als één gesloten vectorpad. De R is niet automatisch overgetrokken. Hij is in vier penstreken uitgemeten:

- de aanhaal met de lus;
- de dunne dwarslijn door de schacht;
- de schacht met de ronde voet;
- het been met de staart.

Die streken zijn daarna als vloeiende curves getekend. Daardoor zijn de randen strak, ook als je ver inzoomt. Het pad heeft 83 ankerpunten.

## Bestanden

| Map | Inhoud |
|---|---|
| `SVG/` | De bron voor Illustrator. Laag `SIERLIJKE_R`, pad `LETTER_R`. Elke kleur heeft een expliciete vulling. Er zitten geen stijlen, maskers of `<use>` in. |
| `PDF/` | Dezelfde bestanden als PDF. Die openen in Illustrator direct als vector. |
| `PNG/` | Voorbeelden van 3000 px breed, met transparante achtergrond. |
| `RAWZA_Sierlijke_R_Exact_Vergelijking.png` | De referentie, de vector en de vectorcontour over de referentie heen. |
| `bron/referentie.png` | Je originele afbeelding. |

## Kleuren

| Bestand | Kleur |
|---|---|
| `Goud_Referentie` | `#EDBD76`, het goud uit je afbeelding |
| `Goud` | `#D6B583`, het goud van de huisstijl |
| `Chocolade` | `#2A1A12` |
| `Zwart` | `#000000` |
| `Wit` | `#FFFFFF` |
| `Goud_Op_Chocolade` | `#EDBD76` op `#29170D` (de achtergrond uit je afbeelding), met een aparte laag `ACHTERGROND` |

## Hoe exact is het?

- **Overlap:** de vector is pixel voor pixel vergeleken met de referentie. Hij valt er voor 91,4% mee samen, randen meegerekend. Een ruwe automatische overtrek van dezelfde afbeelding scoort 91,8%, maar die heeft hobbelige randen.
- **Afwijking:** het verschil zit vrijwel alleen in de zachte, wazige randen van de afbeelding. Gemeten op de afbeelding is dat minder dan een halve pixel.
- **Grenzen van de afbeelding:**
  - De referentie is klein: de R is er maar ongeveer 240 pixels hoog. Bij de fijnste haarlijnen is de precieze dikte daarom een beste schatting.
  - Bij de staart liep de oranje lijn over de letter. Daar is de vorm van de staart aan beide kanten doorgetrokken.
- **Illustrator:** de bestanden zijn niet in Adobe Illustrator zelf geopend.
  - De SVG's zijn wel gecontroleerd: geldige XML en één gesloten pad.
  - De PDF's zijn met Inkscape gemaakt.

## Opnieuw bouwen

`tools/r-exact/`: `python3 mask.py && KE=6 python3 build.py && F=0.85 node outline.cjs strokes.json shape.json && python3 cmp.py && node export.cjs && python3 compare.py`

# RAWZA — definitieve swash-R, klaar voor Illustrator

Dit is de beste versie uit ronde 2.

- **R:** de ingekorte sierlijke R, met een staart die geleidelijk uitloopt tot een fijne punt.
- **A, W, Z, A:** de goedgekeurde letters van richting A.
- **Ondertitel:** groter en dikker, in Montserrat SemiBold.

Aan het ontwerp is niets veranderd: dezelfde tekening als `round-2/svg/RAWZA_R2_L1_Swash_*`.

## Openen in Illustrator

- **SVG:** *Bestand > Openen*. De laag- en padnamen blijven behouden.
- **PDF:** opent direct als vector. Je kunt alles selecteren, kopiëren en in een eigen document plakken.
- **Kleur wijzigen:** selecteer de groep en kies een nieuwe vulkleur. Elk pad heeft een eigen kleur.

## Bestanden

| Bestand | Gebruik |
|---|---|
| `SVG/RAWZA_Logo_Afghaans_Restaurant_{Gold,Chocolate,Black,White}.svg` | Logo met AFGHAANS RESTAURANT |
| `SVG/RAWZA_Logo_Restaurant_{Gold,Chocolate,Black,White}.svg` | Logo met RESTAURANT |
| `SVG/RAWZA_Logo_*_Descriptor_Editable.svg` | Ondertitel als bewerkbare tekst (lettertype nodig) |
| `PDF/` | Dezelfde 8 logo's als PDF |
| `PNG/` | Transparante voorbeelden van 4000 px |
| `Fonts/` | Montserrat (SIL OFL 1.1), alleen nodig voor de bewerkbare ondertitel |

## Lagen

```
01_WORDMARK_RAWZA   LETTER_R, LETTER_A_01, LETTER_W, LETTER_Z, LETTER_A_02
02_DESCRIPTOR       DESC_01_A … DESC_18_T   (RESTAURANT: DESC_01_R … DESC_10_T)
                    of DESCRIPTOR_TEXT in de bewerkbare versie
```

## Kleuren

| Kleur | Hex |
|---|---|
| Goud | `#D6B583` |
| Chocolade | `#2A1A12` |
| Zwart | `#000000` |
| Wit | `#FFFFFF` |

## Bewerkbare ondertitel

Installeer eerst `Fonts/Montserrat[wght].ttf`. Kies **SemiBold** en zet de **kerning op 0**.

| | AFGHAANS RESTAURANT | RESTAURANT |
|---|---|---|
| Grootte | 160 SVG-eenheden (40 pt bij openen op standaardgrootte) | 160 eenheden (40 pt) |
| Tracking in Illustrator | **308** | **322** |
| Positie (links, basislijn) | x 1377,17 · y 1402,55 | x 2789,49 · y 1402,55 |

## Kleine maten

De haarlijnen van de R zijn fijn. Gebruik het logo niet kleiner dan ongeveer 250 px breed op scherm, of 35 mm in druk.

## Controle

- **SVG en PDF:** opnieuw gerenderd en vergeleken met de bron. Ze zijn gelijk; de grootste afwijking is 29/255 aan de randen.
- **Paden en XML:**
  - geen zelfdoorsnijdingen en juiste binnenvormen;
  - geldige XML;
  - geen `<style>`-blokken, `<use>`, `<defs>`, maskers of filters.
- **Bewerkbare ondertitel:** valt op de omlijnde versie (zelfde breedte en positie).
- **Illustrator:** het pakket is niet in Adobe Illustrator zelf geopend.

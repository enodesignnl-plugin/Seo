# Rawza — swash-R

Een namaak van de kalligrafische R uit het voorbeeld van de klant, als vector getekend. De R bestaat uit drie penhalen:

- **Lus:** komt als haarlijn van ver links binnen, wordt dik in de neergaande boog rechts en kruist de schacht weer als haarlijn.
- **Schacht:** een sikkel die met een fijne punt begint en dik eindigt.
- **Been:** valt uit de lus, loopt als zwierige staart onder RESTAURANT door en eindigt in een stijgende haarlijn.

A, W, Z en A zijn de goedgekeurde letters van richting A (release). Ze zijn niet aangepast en zijn iets zwaarder dan in het voorbeeld. RESTAURANT staat in Montserrat 500, rechts uitgelijnd boven de staart, zoals in het voorbeeld.

## Bestanden

Alles staat als vectorpaden in `svg/`:

- `RAWZA_SwashR_Logo_Restaurant_{Gold,Chocolate,Black,White}.svg`
- `RAWZA_SwashR_Logo_Afghaans_Restaurant_{Gold,Chocolate}.svg`
- `RAWZA_SwashR_Wordmark_{Gold,Chocolate}.svg`
- `RAWZA_SwashR_R_{Gold,Chocolate}.svg`

In `png/` staan voorbeelden.

## Bouwen

```
cd tools
node build-swash.cjs
```

De bron staat in `tools/swash.cjs`.

## Controle

De SVG's zijn gecontroleerd: geldige XML, geen zelfdoorsnijdingen en juiste binnenvormen. In Illustrator zijn ze niet getest.

## Lettertypen

Cormorant Garamond en Montserrat, beide onder de SIL Open Font License.

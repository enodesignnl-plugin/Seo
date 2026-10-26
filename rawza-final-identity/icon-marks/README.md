# RAWZA — drie dubbelbladsymbolen

Drie losse symbolen, zonder woordmerk. Elk symbool bestaat uit twee bladeren die naar elkaar toe buigen en samen een spitsboog vormen.

| | Symbool | Karakter |
|---|---|---|
| I | **Lancet** | Twee leunende bladeren met fijne middennerf; de punten raken elkaar in de top. Rustig en architectonisch. |
| II | **Vlechtwerk** | De bladeren kruisen elkaar vlak onder de top, het ene met een fijne naad over het andere. Ambachtelijk. |
| III | **Contrast** | Een haarlijnblad en een vol blad, dik en dun zoals in een serif-kapitaal. Editoriaal. |

## Bestanden

| Pad | Inhoud |
|---|---|
| `svg/RAWZA_Icon_{Lancet,Interlace,Contrast}_Gold.svg` | goud `#D6B583`, transparante achtergrond (voor chocoladebruin `#2A1A12`) |
| `svg/RAWZA_Icon_{Lancet,Interlace,Contrast}_Black.svg` | zwart `#1A1410`, transparante achtergrond (voor crème `#F3EBDD`) |
| `png/` | voorbeelden van 2000 px op de bijbehorende achtergrond |
| `RAWZA_Icon_Overzicht.png` | alle drie naast elkaar, goud en zwart |
| `icon-marks.html` | presentatie, met de symbolen ook op 96 tot 16 px |

## Opbouw

Elk blad is één gesloten pad van kubische curves, zonder lijnen, effecten of overlappende vormen:

- de groep heet `ICON_…` en bevat de paden `LEAF_LEFT` en `LEAF_RIGHT`;
- de nerven bij Lancet zijn uitsparingen in het blad;
- de naad bij Vlechtwerk is een uitsparing in het rechterblad.

## Kleine maten

- Lancet en Vlechtwerk blijven leesbaar tot 16 px.
- Contrast heeft vanaf ongeveer 24 px nodig, vanwege de haarlijn.

## Bouwen

Bron: `tools/leafmark.cjs`.

```
cd tools
node build-icons.cjs
node icons-page.cjs
```

Gecontroleerd op geldige XML, geen zelfdoorsnijdingen en juiste uitsparingen. In Illustrator zijn de bestanden niet geopend.

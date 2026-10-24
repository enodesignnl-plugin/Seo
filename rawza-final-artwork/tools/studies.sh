#!/bin/sh
# Rebuilds the internal micro-variant study sheets in ../studies (needs Playwright + Chromium).
cd "$(dirname "$0")"
node study.cjs signature.cjs ../studies/a-micro-variants.png '[
{"label":"A1 · R-been: naaldvoet, loopt als haarlijn uit tot een punt óp de basislijn","opts":{"leg":"kick","extra":[0,20,0,25,0]}},
{"label":"A2 · R-been: dalende haal, loopt onder de basislijn door en eindigt in een punt vóór de A (gekozen)","opts":{"leg":"sweep","extra":[0,20,0,25,0]}},
{"label":"A3 · R-been: opwaartse uithaal, raakt de basislijn en buigt omhoog naar een punt","opts":{"leg":"flick","extra":[0,20,0,25,0]}}
]' 110
node study.cjs editorial.cjs ../studies/b-micro-variants.png '[
{"label":"B1 · w–z: de rechterschreef van de w loopt door als bovenbalk van de z (T-verbinding, linkerhelft van de schreef blijft)","opts":{"join":"bar"}},
{"label":"B2 · w–z: de laatste haal van de w knikt scherp over in de bovenbalk van de z","opts":{"join":"corner"}},
{"label":"B3 · w–z: de laatste haal van de w draait in een ronde penbocht over in de bovenbalk van de z (gekozen)","opts":{"join":"turn"}}
]' 150

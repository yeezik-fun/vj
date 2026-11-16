# Yeezik LED Wall (VJ)

Grafiche a schermo intero da usare come ledwall nei video DJ di **Yeezik**: si apre la pagina su PC o iPad, si va a schermo intero e dietro la consolle gira lo sfondo animato con la scritta YEEZIK.

## Come si usa

- Apri `index.html` (o la pagina GitHub Pages del repo).
- **Tocca lo schermo** (o premi **H**) per aprire i controlli.
- **F** schermo intero · **1–6** cambia sfondo · **Spazio** sfondo a caso · **A** cambio automatico.
- Su iPad, se lo schermo intero non parte: Condividi → "Aggiungi alla schermata Home".
- Le impostazioni restano salvate nel browser. Il font caricato (Moderniz / Helvetica Now, .otf/.ttf) pure.

## Sfondi

Componenti di [React Bits](https://reactbits.dev): Dither, Faulty Terminal, Galaxy, Gradient ASCII, Hyperspeed, Letter Glitch. Ognuno ha i suoi controlli (colori, velocità, densità…) nel pannello.

## Modificare

Il codice sta in `src/` (`src/App.jsx` è la pagina, `src/bg/` i componenti React Bits). Per rigenerare `index.html`:

```bash
npm install
npm run build
```

## Crediti

Sfondi: React Bits di David Haz — licenza MIT + Commons Clause (uso libero nei propri progetti, non si possono rivendere i componenti in sé).

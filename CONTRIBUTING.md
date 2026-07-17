# Contributing

## Setup

```bash
npm ci
npm run dev
```

## Branches und Commits

Kleine, thematische Branches verwenden. Commit-Nachrichten sollen verständlich und bevorzugt im Conventional-Commit-Stil sein.

## Tests

Vor Pull Requests:

```bash
npm run check
npm run test:e2e
```

## Architekturregeln

- Domain-Code bleibt ohne React und Browser-APIs.
- Kein direkter `localStorage`-Zugriff in Features.
- Keine API-Secrets im Frontend.
- UI-Texte auf Deutsch und möglichst zentral.
- Keine ARD-Links in Version 1.
- Keine Views, Likes oder Beliebtheitswerte.

## UI-Regel

Buttons, Karten, Inputs, Dialoge und Tags haben keine runden Ecken. Das Glücksrad ist die einzige runde Ausnahme.

## Katalogpflege

Generierte Katalogdateien nur über Scripts ändern. Keine erfundenen Episodendaten eintragen.

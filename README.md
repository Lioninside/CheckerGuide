# Checker Guide

Checker Guide ist ein inoffizieller, statischer Guide für vollständige Checker-Folgen auf YouTube. Die App hilft Kindern und Familien dabei, eine nächste Folge zu finden, Fortschritt lokal zu behalten und neue Themen zu entdecken.

Der Checker Guide ist ein privates Fanprojekt und steht in keiner Verbindung zur Checkerwelt, zum Bayerischen Rundfunk, zur ARD, zum KiKA, zu Megaherz oder zu YouTube.

## Status

Version 1 ist als statische Web-App vorbereitet. Der produktive Katalog ist absichtlich leer, bis ein echter YouTube-Data-API-Sync mit Repository-Secrets ausgeführt wurde. Es wurden keine YouTube-Video-IDs erfunden.

## Voraussetzungen

- Node.js 24.x
- npm 11.x
- Für echten Katalogsync: YouTube Data API Key
- Für Deployment: FTPS-Zugangsdaten

## Installation

```bash
npm ci
```

## Entwicklung

```bash
npm run dev
```

## Tests und Checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run check
```

## Build

```bash
npm run build
```

`npm run build:production` prüft zusätzlich, dass ein echter, nicht leerer Katalog vorhanden ist. Mit dem initial leeren Katalog muss dieser Befehl fehlschlagen.

## Erster YouTube-Katalogsync

1. YouTube Data API aktivieren.
2. `YOUTUBE_API_KEY` lokal setzen oder als GitHub Secret hinterlegen.
3. Optional `YOUTUBE_CHANNEL_ID` als GitHub Variable setzen.
4. Dry Run ausführen:

```bash
npm run catalog:sync:dry-run
```

5. Echtes Schreiben:

```bash
npm run catalog:sync
npm run catalog:validate
```

Unklare Videos landen in `public/catalog/needs-review.json` und müssen geprüft werden.

## GitHub Secrets und Variablen

Secrets:

- `YOUTUBE_API_KEY`
- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`

Variables:

- `YOUTUBE_CHANNEL_ID`
- `YOUTUBE_CHANNEL_HANDLE`
- `FTP_SERVER_DIR`

## Deployment

Das Deployment ist über `.github/workflows/ftp-deploy.yml` vorbereitet und läuft nur manuell. Es führt `npm run check` und `npm run build:production` aus, bevor `dist/` per FTPS hochgeladen wird.

## Lokale Profildaten

Das Profil liegt ausschließlich in `localStorage`. Export und Import verwenden JSON. Es gibt keine Registrierung, kein Tracking, keine Werbung und keine eigene Cloud in Version 1.

## Datenschutz

Die App bettet keine YouTube-Player ein und lädt keine Videos vor. YouTube wird nur geöffnet, wenn eine Person aktiv auf den Link klickt. Thumbnails können von YouTube-CDNs geladen werden, sobald ein echter Katalog vorhanden ist.

## Lizenz

Es wurde noch keine Open-Source-Lizenz gewählt.

Weitere Details stehen in `docs/`.

# Checker Guide

Checker Guide ist ein inoffizieller, statischer Guide für vollständige Checker-Folgen auf YouTube. Die App hilft Kindern und Familien dabei, eine nächste Folge zu finden, Fortschritt lokal zu behalten und neue Themen zu entdecken.

Der Checker Guide ist ein privates Fanprojekt und steht in keiner Verbindung zur Checkerwelt, zum Bayerischen Rundfunk, zur ARD, zum KiKA, zu Megaherz oder zu YouTube.

## Status

Version 1 ist als statische Web-App umgesetzt. Der produktive Katalog wird über die YouTube Data API generiert und liegt statisch unter `public/catalog/episodes.json`. API-Secrets bleiben ausschließlich in GitHub Actions oder in der lokalen Shell und werden nicht ins Frontend oder Repository geschrieben.

Die aktuelle öffentliche Testadresse ist:

```text
https://bartlome.com/checkerguide/
```

## Voraussetzungen

- Node.js 24.x
- npm 11.x
- Für echten Katalogsync: YouTube Data API Key
- Optional für automatisiertes Deployment: FTPS-Zugangsdaten

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

`npm run build:production` prüft zusätzlich, dass ein echter, nicht leerer Katalog vorhanden ist. Mit leerem Katalog muss dieser Befehl fehlschlagen.

## YouTube-Katalogsync

1. YouTube Data API v3 in Google Cloud aktivieren.
2. `YOUTUBE_API_KEY` lokal setzen oder als GitHub Repository Secret hinterlegen.
3. `YOUTUBE_CHANNEL_HANDLE` als GitHub Variable setzen, zum Beispiel `@CHECKERWELT`.
4. Dry Run ausführen:

```bash
npm run catalog:sync:dry-run
```

5. Echtes Schreiben:

```bash
npm run catalog:sync
npm run catalog:validate
```

Unklare Videos landen in `public/catalog/needs-review.json` und müssen geprüft werden. Nur echte YouTube-IDs aus dem offiziellen Kanal dürfen in den produktiven Katalog gelangen.

## GitHub Secrets und Variablen

Secrets:

- `YOUTUBE_API_KEY`
- `FTP_SERVER` nur für automatisiertes FTP-Deployment
- `FTP_USERNAME` nur für automatisiertes FTP-Deployment
- `FTP_PASSWORD` nur für automatisiertes FTP-Deployment

Variables:

- `YOUTUBE_CHANNEL_HANDLE`
- `YOUTUBE_CHANNEL_ID` optional
- `FTP_SERVER_DIR` nur für automatisiertes FTP-Deployment

## Deployment

Manuell reicht:

```bash
npm run build:production
```

Danach den Inhalt von `dist/` in den FTP-Zielordner für `https://bartlome.com/checkerguide/` hochladen. FTP-Secrets werden nur benötigt, wenn `.github/workflows/ftp-deploy.yml` das Deployment automatisch ausführen soll.

## Lokale Profildaten

Das Profil liegt ausschließlich in `localStorage`. Export und Import verwenden JSON. Es gibt keine Registrierung, kein Tracking, keine Werbung und keine eigene Cloud in Version 1.

## Datenschutz

Die App bettet keine YouTube-Player ein und lädt keine Videos vor. YouTube wird nur geöffnet, wenn eine Person aktiv auf den Link klickt. Thumbnails können von YouTube-CDNs geladen werden, sobald ein echter Katalog vorhanden ist.

## Lizenz

Es wurde noch keine Open-Source-Lizenz gewählt.

Weitere Details stehen in `docs/`.

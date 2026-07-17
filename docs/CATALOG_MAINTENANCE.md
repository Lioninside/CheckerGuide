# Catalog Maintenance

## YouTube API einrichten

Im Google Cloud Projekt die YouTube Data API v3 aktivieren und einen API-Key erzeugen. Der Key darf nicht ins Repository.

## Lokal verwenden

`.env.example` zeigt die Variablen. In PowerShell:

```powershell
$env:YOUTUBE_API_KEY="..."
$env:YOUTUBE_CHANNEL_HANDLE="@CHECKERWELT"
npm run catalog:sync:dry-run
```

## GitHub Secret setzen

`YOUTUBE_API_KEY` als Repository Secret setzen. Optional `YOUTUBE_CHANNEL_ID` als Variable setzen, damit der Sync nicht von der Handle-Auflösung abhängt.

## Sync

```bash
npm run catalog:sync
npm run catalog:validate
```

## Review

Unklare Videos werden nach `public/catalog/needs-review.json` geschrieben. Sie kommen nicht ungeprüft in den produktiven Katalog.

## Forced Include und Exclude

`public/catalog/review-overrides.json` enthält:

- `forcedInclude`
- `forcedExclude`
- `titleCorrections`
- `topicCorrections`
- `checkerCorrections`

Nur echte YouTube-IDs aus dem offiziellen Kanal verwenden.

## Themen und Checker ergänzen

Themen bleiben flach und pflegbar. Neue Checker sollen über Daten und Korrekturen ergänzt werden, nicht durch Umbau mehrerer Komponenten.

## Daily Recommendations

`dailyRecommendations` wird beim Sync erhalten. Für den aktuellen Tag wird nur dann neu gepinnt, wenn die bisherige Folge nicht mehr verfügbar ist.

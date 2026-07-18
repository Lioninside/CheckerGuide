# Catalog Maintenance

## YouTube API Einrichten

Im Google Cloud Projekt die YouTube Data API v3 aktivieren und einen API-Key erzeugen. Der Key darf nicht ins Repository, nicht ins Frontend und nicht in FTP-Dateien.

Empfohlene Einschränkung:

- API restrictions: nur `YouTube Data API v3`
- Application restrictions: nur setzen, wenn die GitHub-Runner-Umgebung zuverlässig abgebildet werden kann

Wenn ein Key versehentlich geteilt wurde, den Key in Google Cloud rotieren oder löschen und danach das GitHub Secret `YOUTUBE_API_KEY` mit dem neuen Wert aktualisieren.

## Lokal Verwenden

`.env.example` zeigt die Variablen. In PowerShell:

```powershell
$env:YOUTUBE_API_KEY="..."
$env:YOUTUBE_CHANNEL_HANDLE="@CHECKERWELT"
npm run catalog:sync:dry-run
```

## GitHub Secret Setzen

`YOUTUBE_API_KEY` als Repository Secret setzen. `YOUTUBE_CHANNEL_HANDLE` als Repository Variable setzen. `YOUTUBE_CHANNEL_ID` ist optional und kann gesetzt werden, wenn der Sync nicht von der Handle-Auflösung abhängen soll.

## Sync

```bash
npm run catalog:sync
npm run catalog:validate
```

Der GitHub Workflow `catalog-sync.yml` kann den Sync automatisch oder manuell ausführen. Wenn der Workflow eine Pull Request erstellt, muss das Repository GitHub Actions erlauben, Pull Requests zu erstellen.

## Review

Unklare Videos werden nach `public/catalog/needs-review.json` geschrieben. Sie kommen nicht ungeprüft in den produktiven Katalog.

## Forced Include Und Exclude

`public/catalog/review-overrides.json` enthält:

- `forcedInclude`
- `forcedExclude`
- `titleCorrections`
- `topicCorrections`
- `checkerCorrections`

Nur echte YouTube-IDs aus dem offiziellen Kanal verwenden.

## Themen Und Checker Ergänzen

Themen bleiben flach und pflegbar. Neue Checker sollen über Daten und Korrekturen ergänzt werden, nicht durch Umbau mehrerer Komponenten.

## Daily Recommendations

`dailyRecommendations` wird beim Sync erhalten. Für den aktuellen Tag wird nur dann neu gepinnt, wenn die bisherige Folge nicht mehr verfügbar ist.

## Nach Dem Sync

Nach einem erfolgreichen Sync:

```bash
git pull
npm run build:production
```

Für manuelles FTP-Testing wird nur der Inhalt von `dist/` hochgeladen. Der YouTube API Key wird dafür nicht benötigt.

# Data Model

## Katalogschema

`public/catalog/episodes.json` enthält:

- `schemaVersion`
- `catalogVersion`
- `generatedAt`
- `source`
- `topics`
- `checkers`
- `dailyRecommendations`
- `episodes`

Eine Folge enthält:

- `id`
- `youtubeId`
- `title`
- `checker`
- `topics`
- `description`
- `publishedAt`
- `durationSeconds`
- `thumbnail`
- `available`
- `needsReview`

## Profilschema

Das lokale Profil enthält:

- `version`
- `createdAt`
- `updatedAt`
- `seenEpisodeIds`
- `bookmarkedEpisodeIds`
- `lastOpenedEpisodeId`
- `lastSeenEpisodeId`
- `localNoticeAcknowledged`
- `wheelHistory`
- `discoverOrder`
- `activity`

## Exportformat

Export ist die serialisierte Profil-JSON. Es werden keine Katalogdaten und keine Secrets exportiert.

## Versionierung und Migration

Aktuelle Profilversion ist `1`. Version `0` beziehungsweise alte Felder `seen` und `bookmarks` werden migriert.

## Merge-Regeln

Beim Zusammenführen werden gesehene und gemerkte Folgen vereinigt. Gesehen gewinnt gegen Merkliste. Aktivitäten werden chronologisch zusammengeführt und auf die letzten 200 Einträge begrenzt.

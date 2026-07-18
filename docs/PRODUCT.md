# Product

## Zielgruppe

Kinder ungefähr von 6 bis 10 Jahren und ihre Eltern. Die App soll selbstständig bedienbar sein, aber nicht verniedlicht wirken.

## Problem

Kinder wollen eine Checker-Folge schauen, können sich aber oft nicht entscheiden. Eltern wollen eine schnelle, werbefreie, verständliche Auswahlhilfe ohne Konto.

## Positionierung

Checker Guide ist ein inoffizielles Companion-Tool. Es ist keine Mediathek, kein Streamingdienst und kein Videoplayer. Alle Folgen öffnen extern auf YouTube.

## Version-1-Scope

- Start mit täglicher Empfehlung
- "Das könnte dir gefallen" als horizontale Folgeauswahl
- Zufallsauswahl mit Kartenstapel
- Swipen
- Suche und Filter
- Detailseiten
- lokales Profil mit Merkliste, Gesehen-Status, Import und Export
- statischer Katalog aus YouTube Data API

## Nicht-Ziele

- keine Registrierung
- keine Cloud-Synchronisation
- keine Bewertungen oder Kommentare
- keine YouTube-Embeds
- keine ARD-Links in der Oberfläche
- keine Views, Likes oder Beliebtheitswerte
- keine Werbung und kein Tracking

## Nutzerwege

- Eine tägliche Empfehlung öffnen.
- Eine Karte ziehen und eine ungesehene Folge finden.
- Im Swipen-Modus durch ungesehene Folgen gehen.
- Nach Titel oder Thema suchen.
- Folge merken oder als gesehen markieren.
- Profil exportieren und später importieren.

## Produktentscheidungen

Das Profil bleibt lokal. Gesehen gewinnt gegen Merkliste: Sobald eine Folge als gesehen markiert wird, wird sie aus der Merkliste entfernt. Die Zufallsauswahl ignoriert Checker-Präferenzen und wählt fair aus dem ungesehenen Pool.

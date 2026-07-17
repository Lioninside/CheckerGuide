# Roadmap

Mögliche Version 2, noch nicht implementiert:

- optionale Speicherung der Profil-JSON in privater OneDrive des Nutzers
- kein öffentlich freigegebener JSON-Link
- OAuth und privater App-Dateizugriff
- lokales Profil bleibt Standard
- Synchronisation bleibt optional
- Konfliktlösung zwischen Geräten
- Familienprofile nur nach erneuter Produktentscheidung
- Fernseher-Unterstützung
- Abzeichen
- Bewertungen und Kommentare nur nach Datenschutz- und Moderationskonzept
- Sammlungen

Architekturregel: `ProfileRepository` bleibt die Grenze. Eine spätere `OneDriveProfileRepository` darf Domain und UI nicht direkt an Microsoft Graph koppeln.

# UpcycleHub

UpcycleHub ist eine Fullstack-Webanwendung für nachhaltige Upcycling-Projekte. Die Anwendung ermöglicht es, Projektideen öffentlich zu entdecken, nach passenden Inhalten zu suchen und eigene Anleitungen nach einer Anmeldung zu erstellen und zu verwalten.

## Projektidee

Die Idee hinter UpcycleHub ist eine Plattform, auf der aus alten oder nicht mehr genutzten Materialien neue Projekte entstehen können. Besucherinnen und Besucher können Upcycling-Ideen ansehen und sich durch Materialien, Schritte und Projektbeschreibungen inspirieren lassen. Registrierte Benutzerinnen und Benutzer können zusätzlich eigene Projekte veröffentlichen, bearbeiten und löschen.

## Feature-Übersicht

- Öffentliche Startseite mit Branding und empfohlenen Projekten
- Öffentliche Projektübersicht ohne Login
- Detailseiten mit Beschreibung, Materialien, Schwierigkeitsgrad und Arbeitsschritten
- Suche über Titel, Kurzbeschreibung, Beschreibung, Kategorie, Schwierigkeit, Autor, Materialien und Schritte
- Einfache fehlertolerante Suche mit Fuzzy-Matching-Ansatz
- Erweiterte Filter für Kategorie, Schwierigkeit und Materialien mit Mehrfachauswahl
- Öffentliche Autorenseiten mit Projekten der jeweiligen Person
- Registrierung, Login und Logout
- Sitzungsbasierte Authentifizierung mit Gastmodus
- Bereich "Meine Projekte" für angemeldete Benutzerinnen und Benutzer
- Projekte erstellen, inklusive Bild-Upload
- Eigene Projekte bearbeiten und löschen
- Schutz der Bearbeiten- und Löschen-Funktionen vor Gästen und fremden Benutzerkonten
- Gestaltete Ladezustände, Leerzustände, Fehlerzustände und Not-Found-Seiten
- Eigenes Logo und Favicon

## Technologie-Stack

### Frontend

- React
- Vite
- Tailwind CSS
- TanStack Router

### Backend

- Node.js
- Express
- SQLite
- better-sqlite3
- express-session
- bcryptjs
- multer

## Projektstruktur

- `upcyclehub/` - React-Frontend mit Routen, Komponenten, Styling und API-Zugriffen
- `backend/` - Express-Backend mit API-Routen, Datenbankzugriff und Middleware
- `backend/sql/` - SQL-Dateien für Datenbankschema und Seed-Daten
- `backend/public/images/` - lokal gespeicherte Projektbilder
- `backend/data/` - lokale SQLite-Datenbankdatei

## Setup und Installation

### Backend starten

```bash
cd backend
npm install
npm run seed
npm run dev
```

Das Backend läuft lokal unter:

```text
http://localhost:3000
```

### Frontend starten

In einem zweiten Terminal:

```bash
cd upcyclehub
npm install
npm run dev
```

Das Frontend läuft lokal unter:

```text
http://localhost:5173
```

## Datenbank

UpcycleHub verwendet SQLite als lokale Datenbank. Das Datenbankschema und die Seed-Daten liegen im Ordner `backend/sql/`. Mit dem Befehl `npm run seed` im Backend-Ordner kann die Datenbank neu erstellt und mit Demo-Daten befüllt werden.

Die Datei `backend/data/upcyclehub.db` enthält den lokalen, befüllten Datenbankstand für die Entwicklung und Demonstration.

## Nutzung und Demo-Ablauf

1. Backend und Frontend starten.
2. `http://localhost:5173` im Browser öffnen.
3. Auf der Startseite empfohlene Projekte ansehen.
4. In der Projektübersicht suchen und Filter für Kategorie, Schwierigkeit oder Materialien verwenden.
5. Eine Projekt-Detailseite öffnen und Materialien sowie Arbeitsschritte ansehen.
6. Einen öffentlichen Autor-Link öffnen, um die Projekte dieser Person zu sehen.
7. Ein neues Konto registrieren oder sich anmelden.
8. Im Bereich "Meine Projekte" ein eigenes Projekt mit Bild erstellen.
9. Das eigene Projekt bearbeiten oder löschen.
10. Prüfen, dass fremde Projekte nicht bearbeitet oder gelöscht werden können.

## Git-Workflow

- `master` bleibt als sauberer Hauptstand bestehen.
- Feature-Branches verwenden das Präfix `feature/...`.
- Dokumentations-Branches verwenden das Präfix `docs/...`.
- Commit-Nachrichten verwenden die Präfixe `ADD:`, `UPDATE:` oder `DELETE:`.
- Der erste Commit des Projekts heißt `Initial Commit`.

## Einsatz von KI

KI wurde im Projekt unterstützend für Planung, Implementierungshilfe, Debugging und Formulierungsvorschläge eingesetzt. Die finalen Entscheidungen, Tests, Validierungsschritte und die fachliche Projektrichtung wurden vom Entwickler kontrolliert.

## Aktuelle Einschränkungen und mögliche Verbesserungen

- Eine Deployment-Umgebung ist nicht Bestandteil des aktuellen Projektumfangs.
- Die Testabdeckung kann in Zukunft erweitert werden.
- Weitere Beispielprojekte und Inhalte könnten ergänzt werden.
- Die Bildverarbeitung könnte später weiter verbessert werden, zum Beispiel durch zusätzliche Validierung oder automatische Optimierung.

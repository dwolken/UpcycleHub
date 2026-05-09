# UpcycleHub

UpcycleHub ist eine Fullstack-Webanwendung für nachhaltige Upcycling-Projekte. Gäste können Projekte öffentlich durchsuchen, filtern und ansehen. Angemeldete Benutzerinnen und Benutzer können eigene Projekte mit Bild erstellen, bearbeiten und löschen.

## Projektidee

UpcycleHub sammelt Ideen, wie aus alten oder nicht mehr genutzten Materialien neue Gegenstände und Projekte entstehen können. Die Plattform soll Upcycling-Anleitungen auffindbar machen und es Benutzerinnen und Benutzern ermöglichen, eigene Projektideen zu veröffentlichen und zu verwalten.

## Features

- Öffentliche Homepage mit Branding
- Empfohlene Projekte auf der Startseite
- Projektübersicht für öffentliches Browsing
- Projekt-Detailseiten mit Beschreibung, Materialien und Arbeitsschritten
- Suche und erweiterte Filter für Projekte
- Einfache fehlertolerante Suche für Tippfehler
- Öffentliche Autorenseiten
- Registrierung, Login und Logout
- Bereich "Meine Projekte" für angemeldete Benutzerinnen und Benutzer
- Eigene Projekte erstellen, bearbeiten und löschen
- Bild-Upload für Projekte
- Schutz vor Bearbeiten und Löschen fremder Projekte
- Ladezustände, Leerzustände, Fehlerzustände und Not-Found-Seiten

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

- `upcyclehub/` - React-Frontend mit Routen, Komponenten, Styles und API-Zugriffen
- `backend/` - Express-Backend mit Server, API, Datenbankzugriff und lokaler Dateiablage
- `backend/src/` - Backend-Quellcode mit Routen, Middleware, Datenbankmodul und Hilfsfunktionen
- `backend/sql/` - SQL-Dateien für Schema und Seed-Daten
- `backend/public/images/` - öffentlich bereitgestellte Projektbilder
- `backend/data/` - lokale SQLite-Datenbankdatei

## Backend-Überblick

Das Backend ist ein Express-Server und läuft lokal unter `http://localhost:3000`. Es stellt die API für Authentifizierung, Projekte und Benutzer- beziehungsweise Autorenseiten bereit.

Die Authentifizierung arbeitet mit Sessions über `express-session`. Nach Login oder Registrierung wird die angemeldete Person über die Session erkannt. Geschützte Projektfunktionen wie Erstellen, Bearbeiten, Löschen und "Meine Projekte" sind nur mit gültiger Anmeldung nutzbar.

Projektbilder werden mit `multer` hochgeladen und im Ordner `backend/public/images/` gespeichert. Das Backend stellt diese Bilder anschließend statisch bereit, damit das Frontend sie in Projektkarten und Detailseiten anzeigen kann.

## API-Überblick

Wichtige API-Endpunkte:

- `GET /api/projects` - Projekte abrufen, inklusive Suche und Filter
- `GET /api/projects/:id` - einzelnes Projekt abrufen
- `POST /api/projects` - neues Projekt erstellen
- `PUT /api/projects/:id` - eigenes Projekt bearbeiten
- `DELETE /api/projects/:id` - eigenes Projekt löschen
- `GET /api/projects/mine` - eigene Projekte abrufen
- `POST /api/auth/register` - neues Benutzerkonto registrieren
- `POST /api/auth/login` - anmelden
- `POST /api/auth/logout` - abmelden
- `GET /api/auth/me` - aktuelle Session prüfen
- `GET /api/users/:username/projects` - öffentliche Projekte eines Autors abrufen

Schreibende Projekt-Endpunkte sind durch Authentifizierung geschützt. Beim Bearbeiten und Löschen prüft das Backend zusätzlich, ob das Projekt zur angemeldeten Person gehört.

## Datenbank

UpcycleHub verwendet SQLite als lokale Datenbank. Das Schema liegt in `backend/sql/schema.sql`, die Demo-Daten liegen in `backend/sql/seed.sql`. Die Datenbankdatei befindet sich unter `backend/data/upcyclehub.db`.

Mit folgendem Befehl im Backend-Ordner wird die Datenbank neu erstellt und mit Demo-Daten befüllt:

```bash
npm run seed
```

Wichtige Tabellen:

- `users`
- `projects`
- `categories`
- `difficulties`
- `materials`
- `project_materials`
- `project_steps`

Passwörter werden nicht im Klartext gespeichert, sondern als Hashes abgelegt. Projekte gehören über eine Besitzerbeziehung zu einem Eintrag in der Tabelle `users`. Dadurch kann das Backend prüfen, ob eine angemeldete Person ein bestimmtes Projekt bearbeiten oder löschen darf.

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

## Demo-Ablauf

1. Backend und Frontend starten.
2. `http://localhost:5173` im Browser öffnen.
3. Projekte auf der Startseite oder in der Projektübersicht ansehen.
4. Suche und Filter verwenden.
5. Eine Projekt-Detailseite öffnen.
6. Ein Benutzerkonto registrieren oder sich anmelden.
7. Ein eigenes Projekt mit Bild erstellen.
8. Das eigene Projekt bearbeiten oder löschen.
9. Eine öffentliche Autorenseite öffnen.

## Einschränkungen und mögliche Erweiterungen

- Deployment ist im aktuellen Projektumfang nicht enthalten.
- Tests könnten erweitert werden.
- Weitere Beispielprojekte und Inhalte könnten ergänzt werden.
- Die Bildverarbeitung könnte weiter verbessert werden, zum Beispiel durch zusätzliche Validierung oder automatische Optimierung.

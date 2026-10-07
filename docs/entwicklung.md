# Entwicklung

## Aufbau

```
main.go                 Lokaler Webserver (Go, nur Standardbibliothek): liefert web/ eingebettet aus,
                        speichert Konfiguration, Snapshots und Notizen, Sicherheits-Header
web/
  index.html            Einstiegsseite
  redirect.html         Leere Zielseite für das Anmelde-Pop-up (MSAL)
  app.css               Gestaltung (dunkles und helles Design über CSS-Variablen)
  js/
    app.js              Oberfläche: Zustand, Ansichten, Aktionen
    graph.js            Anmeldung (MSAL) und Graph-Zugriff: Paging, $batch, Drosselung/Wiederholung
    scanner.js          Quellenliste und Ablauf des Scans, Aufbereitung je Objekttyp
    normalize.js        Reine Funktionen: Settings Catalog abflachen, Zuweisungen, Kategorien, Geheimnisse ausblenden
    devices.js          Geräteinventar, Autopilot, Plattform-Anbindungen und deren Auswertung
    analyze.js          Kennzahlen, Befunde, Konflikte, Zuweisungsindex, Snapshot-Vergleich
    export.js           Word, HTML/PDF, Markdown, CSV
    demo.js             Demo-Mandant (gleiches Datenformat wie ein echter Scan)
  vendor/               MSAL.js, docx (eingebettet, keine CDN-Abhängigkeit)
  fonts/                IBM Plex Sans / Mono
tests/
  logic.test.mjs        Auswertung, Vergleich, Ausblenden von Geheimnissen (Demo-Daten)
  scan-mock.test.mjs    Kompletter Scan gegen eine simulierte Graph-API (Paging, Fallbacks, 429, 404, Base64)
tools/
  package.sh            Baut alle Plattformen und packt ZIPs + SHA256SUMS nach dist/
  screenshots.py        Erzeugt die Screenshots und Beispiel-Exporte der Doku aus dem Demo-Modus
.github/workflows/
  ci.yml                gofmt, go vet, Build, JS-Syntax, Tests bei jedem Push
  release.yml           Bei Tag v*: Tests, Build, Release-Entwurf mit ZIPs und Prüfsummen
```

Es gibt keinen Build-Schritt für die Web-App: Die Dateien unter `web/` werden unverändert per `go:embed` in die Programmdatei übernommen. Abhängigkeiten zur Laufzeit: keine.

## Datenmodell

Ein Scan ergibt einen **Snapshot** (JSON):

```jsonc
{
  "app": "Intune Inspector", "formatVersion": 1,
  "tenant": { "id": "…", "displayName": "…", "domain": "…" },
  "scannedAt": "2026-10-07T12:00:00Z", "scannedBy": "admin@…",
  "objects": [            // alle Richtlinien, Profile, Apps, Skripte, Anbindungen …
    {
      "uid": "catalog:<id>", "area": "Endpoint Security", "category": "Firewall",
      "name": "…", "platform": "Windows", "assignable": true,
      "assignments": [{ "mode": "include", "target": "group", "label": "GRP-…", "filterName": "…", "intent": "Erforderlich" }],
      "settings": [{ "key": "<settingDefinitionId>", "label": "…", "value": "…", "path": "…", "depth": 0 }],
      "code": [{ "title": "Skriptinhalt", "lang": "powershell", "content": "…" }],
      "meta": [["Vorlage", "…"]], "raw": { /* Graph-Rohdaten ohne Binärdaten */ }
    }
  ],
  "devices": [ /* normalisierte managedDevices */ ],
  "autopilot": [ /* normalisierte windowsAutopilotDeviceIdentities */ ],
  "groups": { "<id>": { "name": "…", "dynamic": true } },
  "warnings": [{ "source": "…", "message": "…" }]
}
```

`settings[].key` ist der Vergleichsschlüssel für Konflikte und den Snapshot-Vergleich.

## Neue Quelle hinzufügen

1. In `web/js/scanner.js` einen Eintrag in `SOURCES` ergänzen (`path`, `expand`, `kind`, ggf. `fixed: [Bereich, Kategorie]`).
2. Für Spezialfälle einen `case` in `toObject()` bzw. eine Funktion in `devices.js` schreiben – sonst übernimmt `flattenProps()` alle konfigurierten Werte.
3. Berechtigung prüfen und ggf. in `PERMS` (`app.js`), `docs/einrichtung.md` und `docs/datenumfang.md` ergänzen.
4. Den Mock in `tests/scan-mock.test.mjs` erweitern.

Fällt `$expand` bei einer Quelle aus, lädt der Scanner automatisch ohne `$expand` und holt Zuweisungen einzeln per `$batch` nach.

## Lokal starten

```sh
go run . -no-browser           # dann http://localhost:8400/?demo öffnen
```

Änderungen unter `web/` werden erst nach einem Neustart sichtbar (eingebettet).

## Tests

```sh
cd tests
node logic.test.mjs
node scan-mock.test.mjs
```

Voraussetzung: Node.js 20+ (keine npm-Pakete nötig).

## Screenshots und Beispiel-Exporte neu erzeugen

```sh
go run . -no-browser -data /tmp/ii-demo &        # leerer Datenordner → Einrichtungsseite erscheint
pip install playwright && playwright install chromium
python tools/screenshots.py docs/screenshots
# PDF-Beispiel (optional, benötigt LibreOffice):
soffice --headless --convert-to pdf --outdir docs/beispiel docs/beispiel/Beispiel-Dokumentation.docx
```

## Bauen

```sh
tools/package.sh            # alle Plattformen → dist/*.zip + dist/SHA256SUMS.txt
go build -o IntuneInspector.exe .   # nur für das aktuelle System
```

## Release

1. Version in `main.go` (`appVersion`) und Titel in `LIESMICH.md` anheben, `CHANGELOG.md` ergänzen.
2. Committen und pushen.
3. Tag setzen: `git tag v1.2.0 && git push origin v1.2.0`
4. Die Action *Release* baut alles und legt einen **Release-Entwurf** an. Dort Text prüfen und veröffentlichen.

## Fremdbibliotheken aktualisieren

```sh
npm pack @azure/msal-browser@4 docx@9   # oder per npm install in einem Temp-Ordner
# lib/msal-browser.min.js  → web/vendor/msal-browser.min.js
# dist/index.iife.js       → web/vendor/docx.iife.js
```

MSAL v5 ändert das Pop-up-Verhalten (Redirect-Bridge) – vor einem Wechsel auf v5 `graph.js` und `redirect.html` anpassen.

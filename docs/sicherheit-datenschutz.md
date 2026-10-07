# Sicherheit & Datenschutz

## Architektur

```
┌──────────────────────── Rechner des Anwenders ────────────────────────┐
│                                                                       │
│  IntuneInspector.exe  ── liefert Oberfläche aus ──►  Browser          │
│  (Webserver nur auf 127.0.0.1)                       (Web-App)        │
│        │                                                 │            │
│        ▼                                                 │ OAuth 2.0  │
│  IntuneInspector-Daten/                                  │ PKCE +     │
│   ├ config.json  (Client-ID)                             │ Graph GET  │
│   ├ snapshots/   (Scans als JSON)                        │            │
│   └ notes/       (Notizen je Mandant)                    │            │
└──────────────────────────────────────────────────────────┼────────────┘
                                                           ▼
                                   login.microsoftonline.com · graph.microsoft.com
```

- Die Programmdatei ist ein schlanker Go-Webserver, der die eingebettete Web-App ausliefert und lokale Dateien (Konfiguration, Snapshots, Notizen) verwaltet. **Er hat keinen Zugriff auf Tokens** und spricht selbst nie mit Microsoft.
- Anmeldung und Graph-Abfragen laufen ausschließlich im Browser (MSAL.js, Authorization Code Flow mit PKCE). Tokens liegen im *Session Storage* und verfallen mit der Browser-Sitzung bzw. beim Abmelden.
- Es gibt **keine Telemetrie** und keine Verbindungen zu anderen Diensten als Microsoft Entra ID und Microsoft Graph. Schriften und Bibliotheken sind eingebettet; es wird nichts aus dem Internet nachgeladen.

## Schutzmaßnahmen

| Maßnahme | Umsetzung |
| --- | --- |
| Nur lesend | Ausschließlich `GET` (auch innerhalb von `$batch`); App-Registrierung nur mit `.Read`-Berechtigungen |
| Nur lokal erreichbar | Server bindet an `127.0.0.1`, nicht an Netzwerkschnittstellen |
| Schutz vor DNS-Rebinding | Anfragen werden nur mit `Host: localhost` bzw. `127.0.0.1` beantwortet |
| Schutz vor fremden Webseiten | schreibende API-Aufrufe nur mit passendem `Origin`-Header der eigenen Oberfläche |
| Content-Security-Policy | Skripte nur aus der eigenen Quelle, Verbindungen nur zu `login.microsoftonline.com` und `graph.microsoft.com`, keine Einbettung in fremde Seiten |
| Ausgabe-Kodierung | alle aus Graph gelesenen Texte werden vor der Anzeige HTML-kodiert (Schutz vor manipulierten Richtliniennamen) |
| Geheimnisse | Kennwörter, Pre-Shared Keys, Tokens, QR-Codes werden beim Einlesen ausgeblendet und gelangen weder in Snapshots noch in Exporte |
| Pfadschutz | Dateinamen für Snapshots/Notizen werden strikt geprüft (keine Pfadangaben) |
| Kein endgültiges Löschen | „Entfernen“ verschiebt Snapshots nur in `snapshots/_entfernt` |

## Gespeicherte Daten

Alles liegt im Ordner **`IntuneInspector-Daten`** neben der Programmdatei (Dateirechte nur für den aktuellen Benutzer, soweit das Betriebssystem das unterstützt):

| Datei | Inhalt | Sensibilität |
| --- | --- | --- |
| `config.json` | Client-ID, Standard-Tenant, Untertitel | gering |
| `snapshots/*.json` | vollständige Intune-Konfiguration eines Mandanten inkl. Geräteinventar | **hoch** – enthält Konfigurationsdetails und personenbezogene Gerätedaten |
| `notes/*.json` | eigene Notizen je Mandant | je nach Inhalt |

Empfehlungen:

- Den Datenordner nur auf verschlüsselten Datenträgern (BitLocker/FileVault) ablegen.
- Snapshots nach Projektende löschen oder entsprechend den Vereinbarungen mit dem Kunden aufbewahren.
- Snapshots und Exporte nicht in öffentliche Repositories, Tickets oder Chats laden. Die `.gitignore` dieses Projekts schließt `IntuneInspector-Daten/` und `config.json` aus.

## Personenbezogene Daten (DSGVO)

Das Geräteinventar enthält Benutzernamen, UPNs, Gerätenamen und Seriennummern. Wird das Werkzeug für Kunden eingesetzt, findet in der Regel eine Verarbeitung im Auftrag statt – sie sollte durch den bestehenden Dienstleistungs- bzw. AV-Vertrag abgedeckt sein.

- Im Export ist die personenbezogene **Geräteliste standardmäßig abgewählt**.
- Gelesen werden nur Inventardaten, keine Inhalte (keine Mails, Dateien, Standorte, installierten Apps je Gerät, Wiederherstellungsschlüssel oder Kennwörter).

## Unsignierte Programmdatei

Die Releases sind nicht code-signiert. Wer die Programmdatei selbst prüfen möchte, kann sie aus dem Quellcode bauen (siehe [Entwicklung](entwicklung.md)) und die SHA-256-Prüfsummen der Releases vergleichen.

## Sicherheitslücken melden

Siehe [SECURITY.md](../SECURITY.md).

<div align="center">

# Intune Inspector

**Komplette Microsoft-Intune-Umgebung in wenigen Minuten erfassen, verstehen und dokumentieren.**

🇩🇪 Deutsch · 🇬🇧 [English](README.en.md)

Doppelklick, am Kundentenant anmelden, fertig – ohne PowerShell, ohne Installation, nur lesend.

![Übersicht](docs/screenshots/03-uebersicht.png)

</div>

---

## Worum geht es?

Bei einem IT-Dienstleisterwechsel, einer Übernahme oder einem Audit stellt sich oft dieselbe Frage: *Welche Intune-Richtlinien gibt es, was bewirken sie, und wer bekommt was?* Intune Inspector beantwortet das automatisch:

- liest **alle** Intune-Konfigurationen eines Mandanten über Microsoft Graph – ausschließlich lesend,
- bereitet sie einheitlich auf (Einstellungen, Zuweisungen, Filter, Skripte),
- findet **Konflikte, Aufräum-Kandidaten und ablaufende Zertifikate**,
- erfasst das **Geräteinventar** aller Plattformen inkl. Windows Autopilot,
- und erzeugt per Klick eine **fertige Kundendokumentation** (Word, PDF, HTML, Markdown, Excel/CSV, JSON).

Technisch ist es eine einzelne Programmdatei: Sie startet einen kleinen Webserver, der nur auf `localhost` erreichbar ist, und öffnet die Oberfläche im Browser. Anmeldung und Abfragen laufen direkt vom Browser zu Microsoft Entra ID und Microsoft Graph. Es gibt keinen Cloud-Dienst dazwischen, und es werden keine Daten an Dritte übertragen.

## Funktionen im Überblick

| | |
| --- | --- |
| **Vollständiger Read-only-Scan** | Settings Catalog, Konfigurationsprofile, ADMX, OMA-URI, Endpoint Security, Security Baselines, Compliance, Update-Ringe & Windows-Update-Profile, Apps, App-Schutz, App-Konfiguration, Skripte & Remediations, Enrollment & Autopilot, Filter, Scope Tags, Rollen – Details in [Datenumfang](docs/datenumfang.md) |
| **Geräteinventar** | Windows, iOS/iPadOS, Android, macOS mit Version, Modell, Benutzer, Besitz, Konformität, Registrierungsart, Verschlüsselung, letztem Check-in – plus alle Windows-Autopilot-Geräte |
| **Plattform-Anbindungen** | Apple MDM-Push-Zertifikat, ADE- und VPP-Token mit Restlaufzeit, Managed Google Play, Defender for Endpoint / MTD |
| **Analyse** | Konflikte & Dubletten mit Bewertung der Gruppen-Überschneidung, Zuweisungen je Gruppe, nicht zugewiesene Objekte, Zuweisungen an gelöschte Gruppen, veraltete Objekte, nicht konforme oder inaktive Geräte |
| **Snapshots & Vergleich** | Jeder Scan wird lokal gesichert; zwei Stände zeigen, was sich geändert hat |
| **Doku auf Knopfdruck** | Word mit Titelseite, Inhaltsverzeichnis und Seitenzahlen, PDF, HTML, Markdown, CSV, JSON-Backup – mit Partner-Branding und eigenen Notizen je Objekt |
| **Deutsch & Englisch** | Oberfläche per Klick umschaltbar; die Doku lässt sich unabhängig davon auf Deutsch oder Englisch erzeugen |
| **Sicher by Design** | nur lesende Graph-Aufrufe, nur `localhost`, strikte Content-Security-Policy, Geheimnisse (Kennwörter, PSKs, Tokens) werden ausgeblendet |

## Screenshots

<table>
<tr>
<td width="50%"><img src="docs/screenshots/04-geraete.png" alt="Geräteinventar"><br><sub><b>Geräteinventar</b> – alle Plattformen, Versionen, Registrierungsarten, Konformität</sub></td>
<td width="50%"><img src="docs/screenshots/07-objekte-suche.png" alt="Suche über alle Einstellungen"><br><sub><b>Suche über alle Einstellungen</b> – z. B. „BitLocker“, mit Detailansicht</sub></td>
</tr>
<tr>
<td><img src="docs/screenshots/09-zuweisungen.png" alt="Zuweisungen nach Gruppe"><br><sub><b>Zuweisungen nach Gruppe</b> – wer bekommt was, inkl. gelöschter Gruppen</sub></td>
<td><img src="docs/screenshots/10-konflikte.png" alt="Konflikte"><br><sub><b>Konflikte</b> – gleiche Einstellung, unterschiedliche Werte</sub></td>
</tr>
<tr>
<td><img src="docs/screenshots/08-objekt-skript.png" alt="Remediation mit Skriptinhalt"><br><sub><b>Skripte & Remediations</b> – inklusive Skriptinhalt und Zeitplan</sub></td>
<td><img src="docs/screenshots/11-snapshot-vergleich.png" alt="Snapshot-Vergleich"><br><sub><b>Snapshot-Vergleich</b> – Änderungen zwischen zwei Scans</sub></td>
</tr>
<tr>
<td><img src="docs/screenshots/12-export.png" alt="Export"><br><sub><b>Doku-Export</b> – Format, Inhalt und Bereiche wählbar</sub></td>
<td><img src="docs/screenshots/13-helles-design.png" alt="Helles Design"><br><sub><b>Helles Design</b> – umschaltbar</sub></td>
</tr>
</table>

**Ergebnis – Word-Export (Auszug):**

![Word-Export](docs/screenshots/15-word-export.png)

Komplette Beispiel-Dokumente aus dem Demo-Mandanten: [Word](docs/beispiel/Beispiel-Dokumentation.docx) · [PDF](docs/beispiel/Beispiel-Dokumentation.pdf) · [HTML](docs/beispiel/Beispiel-Dokumentation.html) · [Markdown](docs/beispiel/Beispiel-Dokumentation.md)
Englische Fassung: [Word](docs/sample/Sample-Documentation.docx) · [PDF](docs/sample/Sample-Documentation.pdf) · [HTML](docs/sample/Sample-Documentation.html) · [Markdown](docs/sample/Sample-Documentation.md)

## Schnellstart

1. Die passende Datei von der [Releases-Seite](../../releases) herunterladen und entpacken.
2. `IntuneInspector.exe` doppelklicken (macOS/Linux: siehe [Einrichtung](docs/einrichtung.md#macos-und-linux)).
3. Beim ersten Start die **Client-ID** einer App-Registrierung eintragen (einmalig, siehe unten).
4. Kundentenant eingeben, **Mit Microsoft anmelden** – der Scan startet automatisch.

> Ohne Tenant ausprobieren: Auf der Anmeldeseite **„Demo mit Beispieldaten“** wählen oder `http://localhost:8400/?demo` öffnen.

## Einmalige Einrichtung (Kurzfassung)

1. In Entra ID eine **mehrinstanzenfähige** App-Registrierung anlegen.
2. Plattform **Single-Page-Anwendung** mit der Umleitungs-URI `http://localhost:8400/redirect.html` hinzufügen.
3. Diese **delegierten** Microsoft-Graph-Berechtigungen hinzufügen (alle nur lesend):
   `DeviceManagementConfiguration.Read.All`, `DeviceManagementApps.Read.All`, `DeviceManagementServiceConfig.Read.All`, `DeviceManagementManagedDevices.Read.All`, `DeviceManagementRBAC.Read.All`, `DeviceManagementScripts.Read.All`, `Group.Read.All`, `User.Read`
4. Im Kundentenant einmalig die **Administratorzustimmung** erteilen.

Schritt für Schritt mit allen Details, GDAP-Hinweisen und Verteilung an Kollegen: **[docs/einrichtung.md](docs/einrichtung.md)**

## Dokumentation

| Dokument | Inhalt |
| --- | --- |
| [Einrichtung](docs/einrichtung.md) | App-Registrierung, Zustimmung, GDAP, Verteilung, Startoptionen, macOS/Linux |
| [Bedienung](docs/bedienung.md) | Rundgang durch alle Ansichten mit Screenshots |
| [Datenumfang](docs/datenumfang.md) | Was genau gelesen wird – Bereiche, Graph-Endpunkte, Berechtigungen |
| [Export](docs/export.md) | Formate, Abschnitte, Datenschutz bei der Geräteliste |
| [Sicherheit & Datenschutz](docs/sicherheit-datenschutz.md) | Architektur, Schutzmaßnahmen, Ablage, personenbezogene Daten |
| [Fehlerbehebung](docs/fehlerbehebung.md) | AADSTS-Fehler, Berechtigungen, Pop-ups, Ports |
| [Entwicklung](docs/entwicklung.md) | Aufbau des Codes, bauen, testen, Screenshots, Releases |
| [Veröffentlichung](docs/veroeffentlichung.md) | Checkliste vor dem öffentlichen Release |
| [Änderungen](CHANGELOG.md) | Versionshistorie |

## Systemvoraussetzungen

- Windows 10/11 (x64 oder ARM64), macOS 12+ (Apple Silicon oder Intel) oder Linux x64
- aktueller Browser (Edge, Chrome, Firefox, Safari)
- Konto mit Leserechten in Intune im Zielmandanten (z. B. *Globaler Leser* oder *Intune-Administrator*, auch per GDAP)

## Status

Version 1.2.1. Logik, Oberfläche und Exporte sind mit Demo-Daten und gegen eine simulierte Graph-API getestet. Erster Test an einem echten Demo-Mandanten war erfolgreich; weitere Tests (z. B. per GDAP an Kundenmandanten) stehen noch aus – siehe [Veröffentlichungs-Checkliste](docs/veroeffentlichung.md).

## Lizenz

Noch nicht festgelegt – siehe [Veröffentlichung](docs/veroeffentlichung.md#lizenz). Enthaltene Fremdkomponenten und deren Lizenzen: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Microsoft, Intune, Entra und Windows sind Marken der Microsoft-Unternehmensgruppe. Dieses Projekt steht in keiner Verbindung zu Microsoft.

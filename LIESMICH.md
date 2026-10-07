# Intune Inspector 1.1

Bestandsaufnahme und Dokumentation einer kompletten Microsoft-Intune-Umgebung – per Doppelklick, ohne PowerShell, ohne Installation.

Das Programm startet einen kleinen Webserver, der **nur auf diesem Rechner** erreichbar ist (`http://localhost:8400`), und öffnet die Oberfläche im Standardbrowser. Die Anmeldung und alle Abfragen laufen direkt aus dem Browser gegen Microsoft Entra ID und Microsoft Graph. Es werden **ausschließlich lesende** Aufrufe gemacht, und es gehen keine Daten an Dritte.

---

## Schnellstart

1. ZIP entpacken, z. B. nach `C:\Tools\IntuneInspector`.
2. `IntuneInspector.exe` doppelklicken. Es öffnet sich ein Konsolenfenster (offen lassen) und der Browser.
3. Beim ersten Start die **Client-ID** der App-Registrierung eintragen (siehe unten).
4. Kundentenant eingeben (Domain oder Tenant-ID), **Mit Microsoft anmelden**, fertig: Der Scan läuft automatisch.

> **macOS / Linux:** `chmod +x IntuneInspector` und `./IntuneInspector` starten. macOS: beim ersten Start Rechtsklick → *Öffnen*.

> **Windows SmartScreen:** Die Datei ist nicht signiert. Beim ersten Start ggf. *Weitere Informationen → Trotzdem ausführen* wählen, oder vorher Rechtsklick auf die ZIP → *Eigenschaften* → *Zulassen*.

Ohne Tenant ausprobieren: Auf der Anmeldeseite **Demo mit Beispieldaten** wählen.

---

## Einmalige Einrichtung: App-Registrierung

Einmal anlegen, dann für alle Kunden nutzbar (z. B. im eigenen Partner-Tenant).

1. **Entra Admin Center → Identität → Anwendungen → App-Registrierungen → Neue Registrierung**
   - Name: `Intune Inspector`
   - Unterstützte Kontotypen: **Konten in einem beliebigen Organisationsverzeichnis (mehrinstanzenfähig)**
2. **Authentifizierung → Plattform hinzufügen → Single-Page-Anwendung (SPA)**
   - Umleitungs-URI: `http://localhost:8400/redirect.html`
   - Wichtig: als *SPA*, nicht als *Web*.
3. **API-Berechtigungen → Berechtigung hinzufügen → Microsoft Graph → Delegierte Berechtigungen**:

   | Berechtigung | Wofür |
   | --- | --- |
   | DeviceManagementConfiguration.Read.All | Konfigurationsprofile, Settings Catalog, Endpoint Security, Baselines, Compliance, Updates |
   | DeviceManagementApps.Read.All | Apps, App-Schutz, App-Konfiguration |
   | DeviceManagementServiceConfig.Read.All | Enrollment, Autopilot, ESP, Filter, Nutzungsbedingungen, Branding |
   | DeviceManagementManagedDevices.Read.All | geräte­bezogene Einstellungen, Kategorien |
   | DeviceManagementRBAC.Read.All | Intune-Rollen, Bereichsmarkierungen |
   | DeviceManagementScripts.Read.All | PowerShell-/Shell-Skripte, Remediations, Compliance-Skripte |
   | Group.Read.All | Gruppennamen der Zuweisungen auflösen |
   | User.Read | Anmeldung, Mandantenname |

4. Die **Anwendungs-ID (Client-ID)** von der Übersichtsseite kopieren und beim ersten Start im Intune Inspector eintragen.

### Zustimmung im Kundentenant

Beim ersten Login in einem Kundentenant muss einmal die **Administratorzustimmung** erteilt werden. Das geht auf zwei Wegen:

- Ein Administrator des Kunden meldet sich an und setzt im Zustimmungsdialog den Haken *Im Namen Ihrer Organisation zustimmen*.
- Oder direkt per Link (Tenant und Client-ID einsetzen):
  `https://login.microsoftonline.com/<KUNDENTENANT>/adminconsent?client_id=<CLIENT-ID>`

### Zugriff über GDAP (Partner)

- Auf der Anmeldeseite **immer den Kundentenant** angeben, sonst landet die Anmeldung im eigenen Tenant.
- Benötigte GDAP-Rollen für das Lesen: z. B. **Intune-Administrator** oder **Globaler Leser** (lesend reicht). Für die einmalige Zustimmung zusätzlich **Cloudanwendungsadministrator**, oder der Kunde stimmt selbst zu.

### Client-ID an Kollegen verteilen

Neben die `IntuneInspector.exe` eine Datei `config.json` legen:

```json
{ "clientId": "00000000-0000-0000-0000-000000000000", "brandLabel": "Name des Teams" }
```

Sie wird beim ersten Start übernommen, die Einrichtungsseite entfällt dann. `brandLabel` (optional) ist der Untertitel unter dem Logo, z. B. der Name eures Teams.

---

## Was gelesen und dokumentiert wird

| Bereich | Inhalt |
| --- | --- |
| Konfiguration | Settings Catalog, Konfigurationsprofile (Vorlagen), Administrative Vorlagen (ADMX) inkl. Werte, Benutzerdefiniert (OMA-URI), WLAN, VPN, Zertifikate, E-Mail, Kiosk, Domänenbeitritt u. a. |
| Endpoint Security | Antivirus, Firewall, Datenträgerverschlüsselung, EDR, Angriffsflächenreduzierung, Kontoschutz, App-Steuerung, EPM – neue und ältere Vorlagen |
| Security Baselines | alle Baselines (Windows, Defender, Edge, M365 Apps) |
| Compliance | Compliance-Richtlinien inkl. Aktionen bei Nichtkonformität, Settings-Catalog-Compliance, Compliance-Skripte, Mandanteneinstellungen |
| Windows Updates | Update-Ringe, Feature-Updates, Quality-Updates (beschleunigt), Treiber-Updates, Apple-Update-Richtlinien |
| Apps | alle zugewiesenen Apps mit Absicht (erforderlich, verfügbar, deinstallieren), Installationsbefehlen, Erkennungsregeln (inkl. Skript), Benachrichtigungen, Stichtagen |
| App-Schutz / App-Konfiguration | iOS, Android, Windows (Edge); verwaltete Geräte und verwaltete Apps |
| Skripte & Remediations | PowerShell, macOS-Shell, benutzerdefinierte Attribute, Remediations inkl. **Skriptinhalt** und Zeitplan |
| Enrollment | Autopilot-Profile, Enrollment Status Page, Registrierungseinschränkungen, Gerätelimit, Windows Hello for Business, Android Enterprise-Profile, Autopilot Device Preparation |
| Mandant & Verwaltung | Zuweisungsfilter (mit Regel), Scope Tags, Intune-Rollen inkl. Zuweisungen, Gerätekategorien, Nutzungsbedingungen, Branding, Benachrichtigungsvorlagen |
| Plattform-Anbindungen | Apple MDM-Push-Zertifikat (APNs) mit Apple-ID und Ablaufdatum, Apple ADE-Token (Business/School Manager) inkl. Registrierungsprofilen, Apple VPP-Token, Managed Google Play, Mobile Threat Defense / Defender for Endpoint, Geräteverwaltungs-Partner |
| Geräteinventar | alle verwalteten Geräte – **Windows, iOS/iPadOS, Android, macOS** – mit OS-Version, Modell, Seriennummer, Benutzer, Besitz (Firma/privat), Konformität, Registrierungsart, Join-Typ, Verschlüsselung, Supervised/Jailbreak, letztem Check-in; dazu alle **Windows-Autopilot-Geräte** mit Group Tag und Profilstatus |

Zu jedem Objekt: alle konfigurierten Einstellungen, Zuweisungen (eingeschlossen/ausgeschlossen, Filter, Absicht), Bereichsmarkierungen, Erstell- und Änderungsdatum. Geheime Werte (Kennwörter, Pre-Shared Keys, Tokens) werden ausgeblendet.

### Auswertungen

- **Übersicht** mit Kennzahlen und Befunden
- **Konflikte & Dubletten:** gleiche Einstellung in mehreren zugewiesenen Richtlinien mit unterschiedlichen bzw. gleichen Werten, mit Bewertung, ob sich die Zielgruppen überschneiden
- **Zuweisungen nach Gruppe:** was bekommt welche Gruppe (inkl. Alle Geräte/Alle Benutzer)
- **Ablaufdaten:** APNs-, ADE- und VPP-Token mit Restlaufzeit; Warnung ab 60 Tagen, kritisch ab 30 Tagen bzw. bei Ablauf
- **Geräte:** Kennzahlen je Plattform, Versionsverteilung, Registrierungsarten; Befunde zu nicht konformen, unverschlüsselten, gerooteten und seit über 30 Tagen inaktiven Geräten sowie Autopilot-Geräten ohne Profil
- **Aufräum-Kandidaten:** nicht zugewiesen, Zuweisung an gelöschte Gruppen, Ein- und Ausschluss derselben Gruppe, doppelte Namen, seit über 12 Monaten unverändert
- **Snapshots & Vergleich:** jeder Scan wird lokal gespeichert; zwei Stände vergleichen zeigt neue, geänderte, entfernte Objekte und geänderte Zuweisungen
- **Notizen** je Objekt, die in die Doku übernommen werden

### Exporte

Word (.docx mit Titelseite, Inhaltsverzeichnis, Seitenzahlen), PDF (über den Druckdialog), HTML-Bericht, Markdown, Excel-taugliche CSV (Einstellungen, Zuweisungen bzw. Geräte inkl. Autopilot) und JSON-Backup.

**Datenschutz:** Die Geräteliste mit Gerätenamen, Benutzern und Seriennummern ist im Export standardmäßig **abgewählt** – die Doku enthält dann nur zusammengefasste Zahlen. Bei Bedarf unter *Inhalt* aktivieren. Inhalt und Bereiche sind wählbar, Partnername und Autor erscheinen auf der Titelseite.

---

## Ablage

Alles liegt im Ordner **`IntuneInspector-Daten`** neben der Programmdatei:

- `config.json` – Client-ID und Standard-Tenant
- `snapshots\` – ein JSON pro Scan (entfernte landen in `snapshots\_entfernt`)
- `notes\` – Notizen je Mandant

Die Snapshots enthalten die komplette Konfiguration des Kunden. Bitte entsprechend vertraulich behandeln.

---

## Optionen

```
IntuneInspector.exe -port 8401      anderer Port (dann auch die Umleitungs-URI anpassen)
IntuneInspector.exe -no-browser     Browser nicht automatisch öffnen
IntuneInspector.exe -data D:\Doku   anderer Datenordner
```

## Fehlerbehebung

| Meldung | Lösung |
| --- | --- |
| AADSTS50011 (Umleitungs-URI) | `http://localhost:8400/redirect.html` als **SPA** eintragen |
| AADSTS9002326 / Cross-origin | URI ist als *Web* statt *SPA* registriert |
| AADSTS700016 | App nicht mehrinstanzenfähig oder falsche Client-ID |
| AADSTS65001 / Zustimmung | Administratorzustimmung im Kundentenant erteilen (Link oben) |
| Pop-up blockiert | Pop-ups für `localhost` erlauben |
| „Keine Berechtigung (403)“ im Scan-Protokoll | Graph-Berechtigung fehlt oder Zustimmung veraltet (nach Hinzufügen neuer Rechte erneut zustimmen) bzw. Konto ohne Intune-Rolle |
| Port belegt | Läuft das Programm schon? Sonst `-port` nutzen |

## Hinweise

- Verwendet die Microsoft-Graph-**beta**-Schnittstelle, wie das Intune-Portal selbst. Microsoft kann dort Felder ändern; einzelne Bereiche erscheinen dann ggf. im Scan-Protokoll als nicht lesbar, der Rest läuft weiter.
- Konflikterkennung vergleicht Einstellungen gleicher Herkunft (z. B. Settings Catalog untereinander). Eine Gegenüberstellung zwischen alten Vorlagen und Settings Catalog erfolgt nicht.
- Enthaltene Bibliotheken: MSAL.js (MIT), docx (MIT), IBM Plex (OFL) – Lizenzen unter `web/vendor` bzw. `web/fonts` im Quellcode.

Quellcode, ausführliche Dokumentation und neue Versionen: https://github.com/Strychwizzer/intune-inspector

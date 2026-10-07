# Änderungen

## 1.1.0 – 2026-10-07

### Neu
- **Geräteinventar** für Windows, iOS/iPadOS, Android und macOS: Version, Modell, Seriennummer, Benutzer, Besitz, Konformität, Registrierungsart, Join-Typ, Verschlüsselung, Supervised, Jailbreak/Root, Check-in; Filter, Suche, Detailansicht, Versionsverteilung.
- **Windows-Autopilot-Geräte** mit Group Tag, Status und Profilzuweisung.
- **Plattform-Anbindungen:** Apple MDM-Push-Zertifikat, ADE-Token inkl. Registrierungsprofilen, VPP-Token, Managed Google Play, Mobile Threat Defense / Defender for Endpoint, Geräteverwaltungs-Partner.
- Ablaufwarnungen (≤ 60 Tage Mittel, ≤ 30 Tage bzw. abgelaufen Hoch) und Geräte-Befunde (nicht konform, unverschlüsselt, Jailbreak/Root, > 30 Tage inaktiv, Autopilot ohne Profil).
- Export: Abschnitte *Plattform-Anbindungen*, *Geräteinventar*, optionale *Geräteliste* (personenbezogen, standardmäßig aus), CSV „Excel: Geräte“ inkl. Autopilot.
- Untertitel unter dem Logo über `brandLabel` konfigurierbar.

## 1.0.0 – 2026-10-07

Erste Version.

- Lokaler Start per Doppelklick (Go-Webserver auf `localhost`), Anmeldung per MSAL im Browser, nur lesende Graph-Aufrufe.
- Scan: Settings Catalog, Konfigurationsprofile, ADMX, OMA-URI, Endpoint Security, Security Baselines, Compliance, Update-Ringe, Feature-/Quality-/Treiber-Updates, Apps mit Zuweisungsabsicht, App-Schutz, App-Konfiguration, Skripte und Remediations mit Inhalt, Enrollment, Autopilot-Profile, Filter, Scope Tags, Rollen, Mandanteneinstellungen.
- Analyse: Konflikte und Dubletten, Zuweisungen je Gruppe, nicht zugewiesene Objekte, gelöschte Gruppen, Ein-/Ausschluss derselben Gruppe, doppelte Namen, veraltete Objekte.
- Snapshots mit Vergleich, Notizen je Objekt.
- Export: Word, PDF, HTML, Markdown, CSV, JSON.
- Demo-Modus mit Beispieldaten.

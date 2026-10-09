# Änderungen

## 1.2.1 – 2026-10-09

Korrekturen nach dem ersten Test an einem echten Mandanten.

### Behoben
- Zuweisungen zeigten bei Richtlinien die Graph-Absicht „(apply)“ an. Sie wird jetzt ausgeblendet; angezeigt werden nur echte Absichten wie „Erforderlich“, „Verfügbar“ oder „Deinstallieren“.
- Der Befund „Managed Google Play ist nicht verbunden“ erschien auch, wenn nur AOSP-Geräte vorhanden waren (z. B. Teams-Rooms-Konsolen). Er berücksichtigt jetzt nur noch Android-Enterprise-Geräte.
- AOSP-Profile wurden als „Vorlage: Aosp Device Owner Device“ und mit Plattform „Android Enterprise“ geführt. Jetzt: „Geräteeinschränkungen (AOSP)“ bzw. „Android (AOSP)“; ebenso eigene Kategorien für Android-Enterprise- und Arbeitsprofil-Einschränkungen.
- Word-Export: Dokumentsprache wird passend gesetzt und die Rechtschreibprüfung abgeschaltet – keine roten Wellenlinien mehr unter englischen Richtlinien- und Einstellungsnamen.

### Hinweis
- Bereits gespeicherte Snapshots werden beim Öffnen automatisch angeglichen.

## 1.2.0 – 2026-10-07

### Neu
- **Zweisprachig: Deutsch und Englisch.** Umschalter in der Kopfzeile, auf der Anmeldeseite und in den Einstellungen; Startsprache nach Browsersprache, wird gemerkt. Aufruf mit `?lang=en` bzw. `?lang=de` möglich.
- **Sprache der Dokumentation separat wählbar** – z. B. deutsche Oberfläche, englische Kundendoku. Gilt für Word, PDF, HTML, Markdown und CSV (CSV in Englisch mit Komma als Trennzeichen).
- Befunde, Snapshot-Vergleich und alle Bezeichnungen werden in der aktiven Sprache erzeugt; bestehende Snapshots bleiben kompatibel.
- Englische Screenshots, Beispiel-Dokumente (`docs/sample/`) und `README.en.md`.

### Verbessert
- Exporte werden intern aus einer gemeinsamen Blockstruktur erzeugt – jeder Text existiert nur noch einmal.
- Demo-Mandant mit realistischen (englischen) Einstellungsnamen, wie sie Microsoft Graph liefert.

### Behoben
- Klick auf Befunde wie „Objekte ohne Zuweisung“ führte zur Übersicht statt zur gefilterten Objektliste.

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

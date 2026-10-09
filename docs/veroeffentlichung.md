# Checkliste vor der Veröffentlichung

Stand Version 1.2: Code, Oberfläche, Exporte und Scan-Logik sind getestet – mit Demo-Daten, im Browser (Chromium) und gegen eine simulierte Graph-API. Vor einer öffentlichen Freigabe fehlen noch die folgenden Punkte.

## 1. Test gegen echte Mandanten

- [ ] App-Registrierung wie in [Einrichtung](einrichtung.md) anlegen.
- [x] Scan in einem **eigenen Test-/Demo-Tenant** mit möglichst vielen Intune-Objekttypen (09.10.2026, Befunde in 1.2.1 korrigiert).
- [ ] Scan in einem **Kundentenant über GDAP**.
- [ ] *Scan-Protokoll* prüfen: Welche Quellen liefern 403/404? Erwartbar (nicht lizenziert) oder fehlt eine Berechtigung?
- [ ] Stichproben: Werte einzelner Settings-Catalog-, ADMX- und Endpoint-Security-Richtlinien mit dem Intune-Portal vergleichen.
- [ ] Geräteanzahl je Plattform mit *Geräte → Alle Geräte* im Portal vergleichen.
- [ ] APNs-, ADE- und VPP-Ablaufdaten mit *Mandantenverwaltung → Connectors und Token* vergleichen.
- [ ] Konflikte gegen den Intune-Bericht „Konflikte bei Konfigurationsrichtlinien“ plausibilisieren.
- [ ] Großen Mandanten testen (Laufzeit, Drosselung, > 1.000 Geräte).
- [ ] Englische Oberfläche und englischen Export mit echten Daten prüfen (Begriffe, die das Wörterbuch noch nicht kennt, erscheinen deutsch).
- [ ] Word-Export in Microsoft Word öffnen (Inhaltsverzeichnis aktualisieren), PDF aus Edge und Chrome drucken.
- [ ] Windows: Start per Doppelklick, SmartScreen-Verhalten, Firefox als Standardbrowser.
- [ ] macOS: Start, Gatekeeper-Hinweis.

Gefundene Abweichungen als Issues erfassen; Anpassungen erfolgen meist in `web/js/scanner.js` oder `web/js/normalize.js`.

## 2. Inhalt des Repositories prüfen

- [ ] Keine Snapshots, Exporte echter Kunden, `config.json` oder Client-IDs eingecheckt (`.gitignore` deckt `IntuneInspector-Daten/` und `config.json` ab).
- [ ] Screenshots und Beispiel-Dokumente enthalten nur den fiktiven Demo-Mandanten.
- [ ] Branding: Der Untertitel unter dem Logo ist neutral („Intune-Dokumentation & Analyse“) und per `brandLabel` in der `config.json` anpassbar. Farbgebung und Name vor einer Veröffentlichung mit dem Arbeitgeber abstimmen, falls das Projekt in dessen Namen erscheinen soll.

## 3. Lizenz

- [x] **MIT** festgelegt ([LICENSE](../LICENSE)). Vereinbar mit den Lizenzen der Fremdkomponenten (MIT, MIT, OFL), siehe [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md). Die Lizenzdatei wird in jedes Release-Paket mit aufgenommen.

## 4. Optional: Code-Signatur

Unsignierte Programme lösen SmartScreen- bzw. Gatekeeper-Warnungen aus. Für eine breite Verteilung:

- Windows: Signatur mit einem Code-Signing-Zertifikat (z. B. über Azure Trusted Signing) im Release-Workflow ergänzen.
- macOS: Developer-ID-Signatur und Notarisierung.

## 5. Veröffentlichen

1. `CHANGELOG.md` aktualisieren, Version in `main.go` prüfen.
2. Tag setzen: `git tag v1.2.0 && git push origin v1.2.0`
3. GitHub Actions erstellt einen **Release-Entwurf** mit ZIPs für Windows (x64, ARM64), macOS (Apple Silicon, Intel), Linux und `SHA256SUMS.txt`.
4. Release-Text prüfen (Vorlage unten) und veröffentlichen.
5. Repository auf *Public* stellen: *Settings → General → Danger Zone → Change visibility*. *(erledigt 09.10.2026)*
6. *About* setzen (Zahnrad rechts auf der Startseite):
   - Beschreibung: `Read-only Intune documentation & analysis tool – double-click, sign in, get a full Word/PDF/Markdown report of policies, apps, assignments, devices and Autopilot. No PowerShell. German & English.`
   - Topics: `intune microsoft-intune microsoft-graph endpoint-management mdm autopilot entra-id documentation m365 msp gdap go`
7. *Settings → General → Social preview*: `docs/social-preview.png` hochladen.
8. *Settings → Security → Private vulnerability reporting* aktivieren (SECURITY.md verweist darauf).

### Vorlage Release-Text

```markdown
## Intune Inspector 1.2

Komplette Intune-Umgebung per Doppelklick erfassen und dokumentieren – nur lesend, ohne PowerShell. Deutsch und Englisch.

**Neu in 1.2**
- Oberfläche und Dokumentation auf Deutsch und Englisch
- Doku-Sprache unabhängig von der Oberfläche wählbar

**Seit 1.1**
- Geräteinventar für Windows, iOS/iPadOS, Android, macOS inkl. Windows Autopilot
- Plattform-Anbindungen: APNs, ADE, VPP mit Ablaufwarnung, Managed Google Play, Defender/MTD

**Download**
- Windows: `IntuneInspector-1.2.0-windows-x64.zip`
- macOS: `…-macos-apple-silicon.zip` bzw. `…-macos-intel.zip`
- Linux: `…-linux-x64.zip`

Einrichtung: siehe docs/einrichtung.md
```

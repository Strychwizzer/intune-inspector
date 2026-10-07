# Fehlerbehebung

## Anmeldung

| Meldung | Ursache | Lösung |
| --- | --- | --- |
| `AADSTS50011` – Umleitungs-URI stimmt nicht | URI fehlt oder Port weicht ab | In der App-Registrierung unter *Authentifizierung → Single-Page-Anwendung* exakt `http://localhost:8400/redirect.html` eintragen (bzw. den verwendeten Port) |
| `AADSTS9002326` – Cross-origin token redemption | URI ist als *Web* statt *SPA* registriert | URI unter *Web* entfernen und unter *Single-Page-Anwendung* anlegen |
| `AADSTS700016` – Anwendung nicht gefunden | App nicht mehrinstanzenfähig oder Client-ID falsch | Unter *Authentifizierung → Unterstützte Kontotypen* „Mehrinstanzenfähig“ wählen, Client-ID prüfen |
| `AADSTS65001` / „Administratorgenehmigung erforderlich“ | Zustimmung im Kundentenant fehlt | Zustimmungslink verwenden (wird in der Fehlermeldung angezeigt) oder Admin des Kunden zustimmen lassen |
| `AADSTS50020` / `AADSTS90072` – Benutzer existiert nicht im Tenant | falscher Tenant oder GDAP-Beziehung fehlt | Kundentenant auf der Anmeldeseite eintragen; GDAP-Beziehung und Rollen prüfen |
| Anmeldefenster öffnet nicht | Pop-up-Blocker | Pop-ups für `localhost` erlauben |
| Anmeldefenster bleibt hängen | Erweiterungen/Privatsphäre-Einstellungen blockieren `localhost`-Umleitung | anderen Browser testen; Drittanbieter-Cookie-Blocker für `login.microsoftonline.com` deaktivieren |

## Scan

| Symptom | Ursache | Lösung |
| --- | --- | --- |
| „Keine Berechtigung (403)“ im Scan-Protokoll | Graph-Berechtigung fehlt / Zustimmung veraltet / Konto ohne Intune-Rolle | Berechtigungen laut [Einrichtung](einrichtung.md#3-api-berechtigungen) prüfen, nach Ergänzung **erneut zustimmen**; Konto braucht mind. *Globaler Leser* oder *Intune-Administrator* |
| „In diesem Mandanten nicht verfügbar oder nicht lizenziert (404)“ | Funktion nicht lizenziert (z. B. Windows Autopatch-Profile, Remediations ohne passende Lizenz) oder nicht eingerichtet | unkritisch – Bereich ist schlicht nicht vorhanden |
| Gerätenamen fehlen, Inventar leer | `DeviceManagementManagedDevices.Read.All` fehlt | Berechtigung ergänzen und zustimmen |
| Gruppen erscheinen als „Gruppe 1a2b…“ | `Group.Read.All` fehlt | Berechtigung ergänzen und zustimmen |
| „(gelöschte Gruppe …)“ | Zuweisung zeigt auf eine Gruppe, die in Entra ID gelöscht wurde | echter Befund – Zuweisung in Intune bereinigen |
| Scan dauert lange | sehr große Mandanten, Drosselung durch Graph | Das Programm wartet automatisch und wiederholt gedrosselte Anfragen; einfach laufen lassen |
| Einzelne Objekte „ohne vollständige Details“ | Teilabfrage fehlgeschlagen | Neu scannen; tritt es dauerhaft auf, Rohdaten (JSON) des Objekts prüfen und als Issue melden |

## Programm

| Symptom | Lösung |
| --- | --- |
| „Port 8400 ist bereits belegt“ | Läuft das Programm schon (anderes Konsolenfenster)? Sonst mit `-port 8401` starten und die Umleitungs-URI ergänzen |
| Windows SmartScreen blockiert | *Weitere Informationen → Trotzdem ausführen*, siehe [Einrichtung](einrichtung.md#windows-smartscreen) |
| macOS: „kann nicht geöffnet werden“ | Rechtsklick → *Öffnen* oder `xattr -d com.apple.quarantine <Datei>` |
| Browser öffnet sich nicht | Adresse aus dem Konsolenfenster (`http://localhost:8400/`) manuell öffnen |
| Word zeigt kein Inhaltsverzeichnis | beim Öffnen „Felder aktualisieren“ mit *Ja* bestätigen oder im Dokument `F9` |
| CSV in Excel mit falschen Umlauten/Spalten | Datei per Doppelklick öffnen (nicht über „Text importieren“); Trennzeichen ist Semikolon |

## Fehler melden

Bitte ein Issue mit Version (unten in den *Einstellungen*), Browser, Fehlermeldung und – falls möglich – dem betroffenen Abschnitt aus dem Scan-Protokoll anlegen. **Keine Snapshots oder Kundendaten anhängen.**

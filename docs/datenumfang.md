# Datenumfang

Intune Inspector liest ausschließlich über Microsoft Graph (**beta**, wie das Intune-Portal selbst) und nur mit `GET`-Anfragen (einzeln oder gebündelt per `$batch`). Es werden keine Objekte angelegt, geändert oder gelöscht.

Fehlt für eine Quelle die Berechtigung oder ist ein Bereich im Mandanten nicht lizenziert, wird diese Quelle übersprungen und im *Scan-Protokoll* vermerkt – der Rest des Scans läuft weiter.

## Konfiguration & Sicherheit

| Bereich | Graph-Endpunkt (`/beta/…`) | Was dokumentiert wird |
| --- | --- | --- |
| Settings Catalog, Endpoint Security (neu), Security Baselines (neu), Autopilot Device Preparation | `deviceManagement/configurationPolicies` + `/settings?$expand=settingDefinitions` | jede Einstellung mit Anzeigename und Wert, inkl. verschachtelter Untereinstellungen; Vorlage, Technologie, Plattform |
| Compliance (Settings Catalog, z. B. Linux) | `deviceManagement/compliancePolicies` | wie oben |
| Konfigurationsprofile (Vorlagen) | `deviceManagement/deviceConfigurations` | alle konfigurierten Werte; Kategorien WLAN, VPN, E-Mail, Zertifikate, Gerätefunktionen, Geräteeinschränkungen, Kiosk, Domänenbeitritt, Endpoint Protection u. a. |
| Benutzerdefiniert (OMA-URI) | `deviceConfigurations` (Custom) | OMA-URI, Anzeigename, Wert (verschlüsselte Werte nur als „(verschlüsselt)“) |
| Administrative Vorlagen (ADMX) | `deviceManagement/groupPolicyConfigurations` + `/definitionValues` | Richtlinie, Pfad (Computer/Benutzer › Kategorie), aktiviert/deaktiviert, Optionswerte |
| Endpoint Security & Baselines (alte Vorlagen) | `deviceManagement/intents` + `/settings` | Einstellungen, Vorlagenname |
| Compliance-Richtlinien | `deviceManagement/deviceCompliancePolicies` (+ `scheduledActionsForRule`) | Regeln und Aktionen bei Nichtkonformität mit Frist |
| Compliance-Skripte | `deviceManagement/deviceComplianceScripts` | Erkennungsskript |
| Mandanten-Compliance-Einstellungen | `deviceManagement?$select=settings` | z. B. „Geräte ohne Richtlinie als nicht konform markieren“, Check-in-Frist |

## Updates

| Bereich | Endpunkt | Inhalt |
| --- | --- | --- |
| Update-Ringe (Windows) | `deviceConfigurations` (windowsUpdateForBusinessConfiguration) | Rückstellungen, Fristen, Neustartverhalten |
| Apple-Update-Richtlinien | `deviceConfigurations` (iOS/macOS) | Zeitfenster, Verzögerungen |
| Feature-Updates | `deviceManagement/windowsFeatureUpdateProfiles` | Zielversion, Rollout |
| Quality-Updates (beschleunigt) | `deviceManagement/windowsQualityUpdateProfiles` | Release, Neustartfrist |
| Treiber-Updates | `deviceManagement/windowsDriverUpdateProfiles` | Genehmigungsart, Verzögerung |

## Apps

| Bereich | Endpunkt | Inhalt |
| --- | --- | --- |
| Apps (zugewiesen) | `deviceAppManagement/mobileApps?$filter=isAssigned eq true` | Typ (Win32, MSI, MSIX, Store/WinGet, M365 Apps, Edge, VPP, Managed Google Play …), Herausgeber, Version, Installations-/Deinstallationsbefehl, Installationsverhalten, Erkennungs- und Anforderungsregeln inkl. Skript, ausgeschlossene Office-Apps |
| App-Zuweisungen | `…/mobileApps` `$expand=assignments` | **Absicht** (erforderlich, verfügbar, deinstallieren, verfügbar ohne Registrierung), Benachrichtigungen, Stichtag, Delivery-Optimization-Priorität |
| App-Schutz (MAM) | `deviceAppManagement/iosManagedAppProtections`, `androidManagedAppProtections`, `windowsManagedAppProtections` | geschützte Apps, Datenübertragung, PIN, Bedingungen |
| App-Konfiguration | `deviceAppManagement/mobileAppConfigurations`, `targetedManagedAppConfigurations` | Schlüssel/Werte, XML/JSON-Payload, Ziel-Apps |

## Skripte

| Bereich | Endpunkt | Inhalt |
| --- | --- | --- |
| PowerShell (Windows) | `deviceManagement/deviceManagementScripts` | **Skriptinhalt**, Ausführungskontext, Signaturprüfung, 32/64 Bit |
| Shell (macOS) | `deviceManagement/deviceShellScripts` | Skriptinhalt, Intervall |
| Benutzerdefinierte Attribute (macOS) | `deviceManagement/deviceCustomAttributeShellScripts` | Skriptinhalt |
| Remediations | `deviceManagement/deviceHealthScripts` | Erkennungs- und Korrekturskript, **Zeitplan je Zuweisung** |

## Enrollment

| Bereich | Endpunkt | Inhalt |
| --- | --- | --- |
| Autopilot-Profile | `deviceManagement/windowsAutopilotDeploymentProfiles` | Modus, OOBE-Einstellungen, Namensvorlage |
| ESP, Einschränkungen, Gerätelimit, Windows Hello for Business, Co-Management | `deviceManagement/deviceEnrollmentConfigurations` | Einstellungen, Priorität |
| Apple ADE-Registrierungsprofile | `deviceManagement/depOnboardingSettings/{id}/enrollmentProfiles` | Supervised, Authentifizierung, Setup-Assistent |
| Android Enterprise-Profile | `deviceManagement/androidDeviceOwnerEnrollmentProfiles` | Profiltyp, Gültigkeit (Token/QR-Code werden ausgeblendet) |

## Plattform-Anbindungen

| Anbindung | Endpunkt | Inhalt |
| --- | --- | --- |
| Apple MDM-Push-Zertifikat | `deviceManagement/applePushNotificationCertificate` | **Apple-ID**, Ablaufdatum, Topic, Seriennummer |
| Apple ADE-Token | `deviceManagement/depOnboardingSettings` | Apple-ID, Ablauf, letzte Synchronisierung, Fehlercode, Geräteanzahl |
| Apple VPP-Token | `deviceAppManagement/vppTokens` | Organisation, Apple-ID, Status, Ablauf, Sync |
| Managed Google Play | `deviceManagement/androidManagedStoreAccountEnterpriseSettings` | Verbindungsstatus, Google-Konto, Sync |
| Mobile Threat Defense / Defender | `deviceManagement/mobileThreatDefenseConnectors` | Status, Lebenszeichen, aktivierte Plattformen |
| Geräteverwaltungs-Partner | `deviceManagement/deviceManagementPartners` | z. B. Jamf (nur wenn eingerichtet) |

Befunde: Ablauf in ≤ 60 Tagen = *Mittel*, ≤ 30 Tagen oder abgelaufen = *Hoch*; ADE-Sync-Fehler, ungültiger VPP-Token, Apple-Geräte ohne APNs-Zertifikat.

## Geräte

| Bereich | Endpunkt | Inhalt |
| --- | --- | --- |
| Verwaltete Geräte (alle Plattformen) | `deviceManagement/managedDevices?$select=…` | Name, Plattform, OS-Version, Hersteller, Modell, Seriennummer, Benutzer, Besitz, Konformität, Registrierungsart, Join-Typ, Verwaltungskanal, Verschlüsselung, Supervised, Jailbreak/Root, Autopilot, Kategorie, Sicherheitspatch, Speicher, Registrierungs- und Check-in-Datum |
| Autopilot-Geräte | `deviceManagement/windowsAutopilotDeviceIdentities` | Seriennummer, Modell, Group Tag, Bestellnummer, Status, Profilzuweisung, letzter Kontakt |

Nicht gelesen werden u. a. BitLocker-/FileVault-Schlüssel, LAPS-Kennwörter, Aktivierungssperre-Codes, IMEI/Telefonnummern und installierte Apps je Gerät.

## Mandant & Verwaltung

| Bereich | Endpunkt |
| --- | --- |
| Zuweisungsfilter (mit Regel) | `deviceManagement/assignmentFilters` |
| Bereichsmarkierungen | `deviceManagement/roleScopeTags` |
| Intune-Rollen (benutzerdefiniert bzw. mit Zuweisungen) | `deviceManagement/roleDefinitions?$expand=roleAssignments` |
| Gerätekategorien | `deviceManagement/deviceCategories` |
| Nutzungsbedingungen | `deviceManagement/termsAndConditions` |
| Unternehmensportal-Branding | `deviceManagement/intuneBrandingProfiles` |
| Benachrichtigungsvorlagen | `deviceManagement/notificationMessageTemplates` |
| Gruppennamen | `/groups/{id}` (gelöschte Gruppen werden als solche erkannt) |
| Mandantenname | `/v1.0/organization` |

## Ausgeblendete Werte

Werte, deren Schlüssel auf ein Geheimnis hindeutet (z. B. `password`, `preSharedKey`, `sharedKey`, `tokenValue`, `qrCodeContent`, `privateKey`), werden als „(ausgeblendet)“ gespeichert – sowohl in der Anzeige als auch in Snapshots und Exporten. Verschlüsselte OMA-URI-Werte und geheime Settings-Catalog-Werte erscheinen als „(verschlüsselt)“ bzw. „(geheimer Wert)“. Binärdaten (Zertifikate, Icons) werden nicht übernommen.

## Hinweis zur beta-Schnittstelle

Microsoft ändert die beta-Schnittstelle gelegentlich. Fällt dadurch eine Quelle aus, erscheint sie im Scan-Protokoll; die übrigen Bereiche bleiben nutzbar. Anpassungen erfolgen in `web/js/scanner.js` (Quellenliste) bzw. `web/js/normalize.js` (Aufbereitung).

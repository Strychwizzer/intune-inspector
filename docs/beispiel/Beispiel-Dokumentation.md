# Intune-Dokumentation – Demo-Kunde GmbH

- Mandant: demokunde.onmicrosoft.com · 00000000-demo-0000-0000-000000000000
- Stand: 07.10.2026, 15:31
- Erstellt von: Max Mustermann
- Objekte: 41
- Verwaltete Geräte: 37
- Partner: Muster IT-Partner GmbH
- Erstellt mit Intune Inspector

> Beispieldaten (Demo-Modus)

## Management-Zusammenfassung

| Bereich | Objekte | Zugewiesen | Nicht zugewiesen |
| --- | --- | --- | --- |
| Konfiguration | 8 | 7 | 1 |
| Endpoint Security | 3 | 3 | 0 |
| Security Baselines | 1 | 1 | 0 |
| Compliance | 2 | 2 | 0 |
| Windows Updates | 5 | 4 | 1 |
| Apps | 5 | 5 | 0 |
| App-Schutz | 1 | 1 | 0 |
| App-Konfiguration | 1 | 1 | 0 |
| Skripte & Remediations | 3 | 3 | 0 |
| Enrollment | 4 | 3 | 0 |
| Plattform-Anbindungen | 5 | 0 | 0 |
| Mandant & Verwaltung | 3 | 0 | 0 |

### Befunde

- **Hoch:** Apple MDM-Push-Zertifikat läuft in 21 Tagen ab – Mit derselben Apple-ID verlängern, sonst müssen alle Apple-Geräte neu registriert werden.
- **Hoch:** 3 Einstellung(en) mit widersprüchlichen Werten – Dieselbe Einstellung wird von mehreren zugewiesenen Richtlinien unterschiedlich gesetzt.
- **Hoch:** 1 Objekt(e) mit Zuweisung an gelöschte Gruppen – Zuweisungen zeigen auf Gruppen, die es in Entra ID nicht mehr gibt.
- **Hoch:** 1 Gerät(e) mit Jailbreak/Root – Kompromittierte Mobilgeräte.
- **Mittel:** Apple VPP-Token „Demo-Kunde Apps“ läuft in 48 Tagen ab – Verlängerung einplanen.
- **Mittel:** 2 Objekt(e) ohne Zuweisung – Kandidaten zum Aufräumen oder vergessene Tests.
- **Mittel:** 4 Gerät(e) nicht konform – Bedingter Zugriff kann diese Geräte blockieren.
- **Mittel:** 3 Windows-/macOS-Gerät(e) unverschlüsselt – BitLocker bzw. FileVault nicht aktiv.
- **Niedrig:** 2 Einstellung(en) mehrfach mit gleichem Wert gesetzt – Kein Widerspruch, aber Redundanz.
- **Niedrig:** 2 Gerät(e) seit über 30 Tagen ohne Check-in – Kandidaten für Bereinigungsregeln.
- **Niedrig:** 1 Autopilot-Gerät(e) ohne Bereitstellungsprofil – Diese Geräte durchlaufen kein Autopilot-Setup.
- **Info:** 13 Objekt(e) seit über 12 Monaten unverändert – Fachlich prüfen, ob sie noch gebraucht werden.
- **Info:** 3 % der Objekte haben eine Beschreibung – Beschreibungen in Intune oder Notizen hier verbessern die Doku.

## Plattform-Anbindungen & Ablaufdaten

Ablaufende Zertifikate oder Token stoppen die Verwaltung der betroffenen Geräte. Beim Apple MDM-Push-Zertifikat muss die Verlängerung zwingend mit derselben Apple-ID erfolgen.

| Anbindung | Name | Plattform | Gültig bis | Status |
| --- | --- | --- | --- | --- |
| Apple MDM-Push-Zertifikat (APNs) | Apple MDM-Push-Zertifikat | iOS/iPadOS, macOS | 28.10.2026 | noch 21 Tage |
| Apple VPP-Token (Apps & Bücher) | Demo-Kunde Apps | iOS/iPadOS, macOS | 24.11.2026 | noch 48 Tage |
| Apple Automated Device Enrollment (ADE-Token) | Demo-Kunde ABM | iOS/iPadOS, macOS | 07.05.2027 | noch 212 Tage |
| Managed Google Play (Android Enterprise) | Managed Google Play | Android | — | OK |
| Mobile Threat Defense / Defender-Anbindung | Microsoft Defender for Endpoint | Android, iOS, Windows | — | OK |

## Übersicht

### Konfiguration (8)

| Name | Kategorie | Plattform | Zuweisung | Geändert |
| --- | --- | --- | --- | --- |
| ADMX – Office Grundeinstellungen | Administrative Vorlagen | Windows | GRP-Win-Clients | 17.06.2025 |
| WIN – Custom OMA-URI Sperrbildschirm | Benutzerdefiniert (OMA-URI / Profil) | Windows | GRP-Win-Clients | 20.01.2025 |
| iOS – Geräteeinschränkungen | Geräteeinschränkungen | iOS/iPadOS | GRP-iOS-Firmengeräte [Filter Einschluss: iOS – Supervised] | 04.05.2026 |
| Edge – Startseite & Erweiterungen | Settings Catalog | Windows | GRP-Vertrieb | 21.08.2026 |
| Edge Settings (alt) | Settings Catalog | Windows | GRP-Win-Clients | 02.10.2024 |
| Test_Policy_Kopie (2) | Settings Catalog | Windows | Nicht zugewiesen | 11.11.2024 |
| WIN – OneDrive Known Folder Move | Settings Catalog | Windows | GRP-Win-Clients; (gelöschte Gruppe g-old-12…) | 03.04.2026 |
| WLAN – Firmennetz | WLAN | Windows | GRP-Win-Clients | 10.09.2025 |

### Endpoint Security (3)

| Name | Kategorie | Plattform | Zuweisung | Geändert |
| --- | --- | --- | --- | --- |
| AV – Vertrieb | Antivirus | Windows | GRP-Vertrieb | 02.08.2026 |
| WIN – BitLocker Basis | Datenträgerverschlüsselung | Windows | GRP-Win-Clients; Ausgeschlossen: GRP-Kiosk | 29.09.2026 |
| WIN – Firewall Domäne/Privat/Öffentlich | Firewall | Windows | GRP-Win-Clients | 11.05.2026 |

### Security Baselines (1)

| Name | Kategorie | Plattform | Zuweisung | Geändert |
| --- | --- | --- | --- | --- |
| Security Baseline 2024 | Security Baseline for Windows 10 and later | Windows | Alle Geräte | 14.03.2025 |

### Compliance (2)

| Name | Kategorie | Plattform | Zuweisung | Geändert |
| --- | --- | --- | --- | --- |
| iOS – Compliance | Compliance-Richtlinie | iOS/iPadOS | GRP-iOS-Firmengeräte | 12.02.2026 |
| WIN – Compliance Standard | Compliance-Richtlinie | Windows | Alle Geräte | 02.09.2026 |

### Windows Updates (5)

| Name | Kategorie | Plattform | Zuweisung | Geändert |
| --- | --- | --- | --- | --- |
| Feature-Update Windows 11 24H2 | Feature-Updates | Windows | GRP-Win-Clients | 15.01.2026 |
| Treiber – automatische Freigabe | Treiber-Updates | Windows | GRP-Win-Clients | 15.04.2026 |
| WU – Ring 1 Pilot | Update-Ring (Windows) | Windows | Nicht zugewiesen | 09.01.2025 |
| WU – Ring 2 Breit | Update-Ring (Windows) | Windows | Alle Geräte; Ausgeschlossen: GRP-Kiosk | 09.01.2025 |
| WU – Ring IT | Update-Ring (Windows) | Windows | GRP-IT-Admins | 09.03.2026 |

### Apps (5)

| Name | Kategorie | Plattform | Zuweisung | Geändert |
| --- | --- | --- | --- | --- |
| Microsoft 365 Apps for Enterprise | Microsoft 365 Apps | Windows | GRP-Win-Clients (Erforderlich) | 02.02.2026 |
| Company Portal | Microsoft Store (WinGet) | Windows | Alle Benutzer (Verfügbar) | 05.11.2025 |
| Microsoft Outlook (iOS) | Volumenlizenz-App (VPP) | iOS/iPadOS | GRP-iOS-Firmengeräte (Erforderlich) | 01.03.2026 |
| 7-Zip 24.08 | Win32-App | Windows | Alle Geräte (Erforderlich) – Benachrichtigungen: hideAll; Ausgeschlossen: GRP-Kiosk | 22.07.2026 |
| Altes VPN-Tool 3.1 | Win32-App | Windows | GRP-Vertrieb (Deinstallieren) | 01.09.2023 |

### App-Schutz (1)

| Name | Kategorie | Plattform | Zuweisung | Geändert |
| --- | --- | --- | --- | --- |
| iOS – App-Schutz Outlook/Teams | App-Schutz iOS/iPadOS | iOS/iPadOS | Alle Benutzer; Ausgeschlossen: GRP-IT-Admins | 18.06.2026 |

### App-Konfiguration (1)

| Name | Kategorie | Plattform | Zuweisung | Geändert |
| --- | --- | --- | --- | --- |
| Outlook – nur Geschäftskonten | Verwaltete Apps | iOS/iPadOS | Alle Benutzer | 18.06.2026 |

### Skripte & Remediations (3)

| Name | Kategorie | Plattform | Zuweisung | Geändert |
| --- | --- | --- | --- | --- |
| Set-Regionaleinstellungen.ps1 | PowerShell-Skripte (Windows) | Windows | GRP-Win-Clients | 10.04.2025 |
| Remediation – Temp bereinigen | Remediations | Windows | GRP-Win-Clients – täglich 12:00 | 30.07.2026 |
| mac – Dock konfigurieren | Shell-Skripte (macOS) | macOS | GRP-macOS | 01.12.2025 |

### Enrollment (4)

| Name | Kategorie | Plattform | Zuweisung | Geändert |
| --- | --- | --- | --- | --- |
| ADE – Firmengeräte | Apple ADE-Registrierungsprofile | iOS/iPadOS | — | 25.05.2025 |
| Autopilot – Standard (Entra Join) | Autopilot-Profile | Windows | GRP-Autopilot-Geräte | 05.05.2025 |
| ESP – Standard | Enrollment Status Page | Windows | Alle Benutzer | 05.05.2025 |
| Windows Hello for Business | Windows Hello for Business | Windows | Alle Benutzer | 05.08.2024 |

### Plattform-Anbindungen (5)

| Name | Kategorie | Plattform | Zuweisung | Geändert |
| --- | --- | --- | --- | --- |
| Demo-Kunde ABM | Apple Automated Device Enrollment (ADE-Token) | iOS/iPadOS, macOS | — | — |
| Apple MDM-Push-Zertifikat | Apple MDM-Push-Zertifikat (APNs) | iOS/iPadOS, macOS | — | 28.10.2025 |
| Demo-Kunde Apps | Apple VPP-Token (Apps & Bücher) | iOS/iPadOS, macOS | — | — |
| Managed Google Play | Managed Google Play (Android Enterprise) | Android | — | — |
| Microsoft Defender for Endpoint | Mobile Threat Defense / Defender-Anbindung | Android, iOS, Windows | — | — |

### Mandant & Verwaltung (3)

| Name | Kategorie | Plattform | Zuweisung | Geändert |
| --- | --- | --- | --- | --- |
| Helpdesk Level 1 (benutzerdefiniert) | Intune-Rollen | — | — | 01.03.2025 |
| Compliance-Einstellungen des Mandanten | Mandanteneinstellungen | — | — | — |
| iOS – Supervised | Zuweisungsfilter | iOS/iPadOS | — | 01.03.2025 |

## Details je Objekt

### Konfiguration

#### ADMX – Office Grundeinstellungen

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Konfiguration |
| Kategorie | Administrative Vorlagen |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 17.06.2025, 14:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-9 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Eingeschlossen |  |  |  |

**Einstellungen (2)**

| Einstellung | Wert |
| --- | --- |
| Benutzer › Microsoft Word 2016 › Word Options › Security › Block macros from running in Office files from the Internet | Enabled |
| Benutzer › Microsoft Office 2016 › First Run › Disable the Office First Run on application boot | Enabled |

#### WIN – Custom OMA-URI Sperrbildschirm

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Konfiguration |
| Kategorie | Benutzerdefiniert (OMA-URI / Profil) |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 20.01.2025, 11:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-10 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Eingeschlossen |  |  |  |

**Einstellungen (1)**

| Einstellung | Wert |
| --- | --- |
| Lock screen slide show — ./Device/Vendor/MSFT/Policy/Config/DeviceLock/PreventLockScreenSlideShow | 1 |

#### iOS – Geräteeinschränkungen

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Konfiguration |
| Kategorie | Geräteeinschränkungen |
| Plattform | iOS/iPadOS |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 04.05.2026, 11:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-12 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-iOS-Firmengeräte | Eingeschlossen |  | Einschluss: iOS – Supervised |  |

**Einstellungen (3)**

| Einstellung | Wert |
| --- | --- |
| App Store Blocked | Ja |
| Passcode Required | Ja |
| Passcode Minimum Length | 6 |

#### Edge – Startseite & Erweiterungen

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Konfiguration |
| Kategorie | Settings Catalog |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 21.08.2026, 09:45 |
| Status | Zugewiesen |
| Objekt-ID | demo-5 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-Vertrieb | Eingeschlossen |  |  |  |

**Einstellungen (2)**

| Einstellung | Wert |
| --- | --- |
| Configure the home page URL | https://intranet.demokunde.de |
| Control which extensions cannot be installed | * |

#### Edge Settings (alt)

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Konfiguration |
| Kategorie | Settings Catalog |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 02.10.2024, 09:45 |
| Status | Zugewiesen |
| Objekt-ID | demo-6 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Eingeschlossen |  |  |  |

**Einstellungen (1)**

| Einstellung | Wert |
| --- | --- |
| Configure the home page URL | https://intranet.demokunde.de |

#### Test_Policy_Kopie (2)

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Konfiguration |
| Kategorie | Settings Catalog |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 11.11.2024, 17:00 |
| Status | Nicht zugewiesen |
| Objekt-ID | demo-7 |

**Zuweisungen**

_keine Einträge_

**Einstellungen (1)**

| Einstellung | Wert |
| --- | --- |
| Allow Camera | Block |

#### WIN – OneDrive Known Folder Move

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Konfiguration |
| Kategorie | Settings Catalog |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 03.04.2026, 13:10 |
| Status | Zugewiesen |
| Objekt-ID | demo-8 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Eingeschlossen |  |  |  |
| (gelöschte Gruppe g-old-12…) | Eingeschlossen |  |  |  |

**Einstellungen (2)**

| Einstellung | Wert |
| --- | --- |
| Silently move Windows known folders to OneDrive | Enabled |
| ↳ Tenant ID | [TENANT-ID] |

#### WLAN – Firmennetz

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Konfiguration |
| Kategorie | WLAN |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 10.09.2025, 12:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-11 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Eingeschlossen |  |  |  |

**Einstellungen (3)**

| Einstellung | Wert |
| --- | --- |
| Ssid | DEMO-CORP |
| Wifi Security Type | wpa2Enterprise |
| Pre Shared Key | (ausgeblendet) |

### Endpoint Security

#### AV – Vertrieb

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Endpoint Security |
| Kategorie | Antivirus |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 02.08.2026, 15:20 |
| Status | Zugewiesen |
| Objekt-ID | demo-3 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-Vertrieb | Eingeschlossen |  |  |  |

**Einstellungen (2)**

| Einstellung | Wert |
| --- | --- |
| Cloud Block Level | Default |
| Allow Realtime Monitoring | Allowed |

#### WIN – BitLocker Basis

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Endpoint Security |
| Kategorie | Datenträgerverschlüsselung |
| Plattform | Windows |
| Vorlage | BitLocker |
| Beschreibung | Standard-Verschlüsselung für alle Windows-Clients |
| Notiz | Abgestimmt mit Herrn Beispiel (IT-Leitung), Ticket #4711. |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 29.09.2026, 12:12 |
| Status | Zugewiesen |
| Objekt-ID | demo-1 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Eingeschlossen |  |  |  |
| GRP-Kiosk | Ausgeschlossen |  |  |  |

**Einstellungen (4)**

| Einstellung | Wert |
| --- | --- |
| Require Device Encryption | Enabled |
| Select the encryption method for operating system drives | XTS-AES 256-bit |
| Save BitLocker recovery information to Azure Active Directory | Enabled |
| Allow Warning For Other Disk Encryption | Block |

#### WIN – Firewall Domäne/Privat/Öffentlich

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Endpoint Security |
| Kategorie | Firewall |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 11.05.2026, 11:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-4 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Eingeschlossen |  |  |  |

**Einstellungen (3)**

| Einstellung | Wert |
| --- | --- |
| Domain profile: Enable Firewall | True |
| Public profile: Enable Firewall | True |
| Public profile: Default Inbound Action | Block |

### Security Baselines

#### Security Baseline 2024

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Security Baselines |
| Kategorie | Security Baseline for Windows 10 and later |
| Plattform | Windows |
| Vorlage | Security Baseline for Windows 10 and later (Version 24H2) |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 14.03.2025, 09:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-2 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| Alle Geräte | Eingeschlossen |  |  |  |

**Einstellungen (4)**

| Einstellung | Wert |
| --- | --- |
| Select the encryption method for operating system drives | XTS-AES 128-bit |
| Allow Realtime Monitoring | Allowed |
| Cloud Block Level | High |
| Enable insecure guest logons | Disabled |

### Compliance

#### iOS – Compliance

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Compliance |
| Kategorie | Compliance-Richtlinie |
| Plattform | iOS/iPadOS |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 12.02.2026, 10:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-14 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-iOS-Firmengeräte | Eingeschlossen |  |  |  |

**Einstellungen (2)**

| Einstellung | Wert |
| --- | --- |
| Os Minimum Version | 17.0 |
| Security Block Jailbroken Devices | Ja |

#### WIN – Compliance Standard

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Compliance |
| Kategorie | Compliance-Richtlinie |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 02.09.2026, 11:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-13 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| Alle Geräte | Eingeschlossen |  |  |  |

**Einstellungen (4)**

| Einstellung | Wert |
| --- | --- |
| Bit Locker Enabled | Ja |
| Os Minimum Version | 10.0.22631 |
| Firewall Enabled | Ja |
| Aktion bei Nichtkonformität | Block nach 3 Tag(en) |

### Windows Updates

#### Feature-Update Windows 11 24H2

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Windows Updates |
| Kategorie | Feature-Updates |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 15.01.2026, 10:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-18 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Eingeschlossen |  |  |  |

**Einstellungen (1)**

| Einstellung | Wert |
| --- | --- |
| Feature Update Version | Windows 11, version 24H2 |

#### Treiber – automatische Freigabe

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Windows Updates |
| Kategorie | Treiber-Updates |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 15.04.2026, 11:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-19 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Eingeschlossen |  |  |  |

**Einstellungen (2)**

| Einstellung | Wert |
| --- | --- |
| Approval Type | automatic |
| Deployment Deferral In Days | 7 |

#### WU – Ring 1 Pilot

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Windows Updates |
| Kategorie | Update-Ring (Windows) |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 09.01.2025, 10:00 |
| Status | Nicht zugewiesen |
| Objekt-ID | demo-15 |

**Zuweisungen**

_keine Einträge_

**Einstellungen (2)**

| Einstellung | Wert |
| --- | --- |
| Quality Updates Deferral Period In Days | 0 |
| Feature Updates Deferral Period In Days | 0 |

#### WU – Ring 2 Breit

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Windows Updates |
| Kategorie | Update-Ring (Windows) |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 09.01.2025, 10:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-16 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| Alle Geräte | Eingeschlossen |  |  |  |
| GRP-Kiosk | Ausgeschlossen |  |  |  |

**Einstellungen (3)**

| Einstellung | Wert |
| --- | --- |
| Quality Updates Deferral Period In Days | 7 |
| Feature Updates Deferral Period In Days | 30 |
| Deadline For Quality Updates In Days | 2 |

#### WU – Ring IT

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Windows Updates |
| Kategorie | Update-Ring (Windows) |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 09.03.2026, 10:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-17 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-IT-Admins | Eingeschlossen |  |  |  |

**Einstellungen (1)**

| Einstellung | Wert |
| --- | --- |
| Quality Updates Deferral Period In Days | 0 |

### Apps

#### Microsoft 365 Apps for Enterprise

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Apps |
| Kategorie | Microsoft 365 Apps |
| Plattform | Windows |
| Herausgeber | Microsoft |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 02.02.2026, 10:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-20 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Eingeschlossen | Erforderlich |  |  |

**Einstellungen (2)**

| Einstellung | Wert |
| --- | --- |
| Update Channel | monthlyEnterprise |
| Ausgeschlossene Office-Apps | Groove, Lync |

#### Company Portal

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Apps |
| Kategorie | Microsoft Store (WinGet) |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 05.11.2025, 10:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-22 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| Alle Benutzer | Eingeschlossen | Verfügbar |  |  |

**Einstellungen (1)**

| Einstellung | Wert |
| --- | --- |
| Package Identifier | 9WZDNCRFJ3PZ |

#### Microsoft Outlook (iOS)

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Apps |
| Kategorie | Volumenlizenz-App (VPP) |
| Plattform | iOS/iPadOS |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 01.03.2026, 10:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-23 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-iOS-Firmengeräte | Eingeschlossen | Erforderlich |  |  |

**Einstellungen (1)**

| Einstellung | Wert |
| --- | --- |
| Bundle Id | com.microsoft.Office.Outlook |

#### 7-Zip 24.08

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Apps |
| Kategorie | Win32-App |
| Plattform | Windows |
| Herausgeber | Igor Pavlov |
| Version | 24.08 |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 22.07.2026, 11:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-21 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| Alle Geräte | Eingeschlossen | Erforderlich |  | Benachrichtigungen: hideAll |
| GRP-Kiosk | Ausgeschlossen |  |  |  |

**Einstellungen (3)**

| Einstellung | Wert |
| --- | --- |
| Installationsverhalten | Run As Account: system; Device Restart Behavior: suppress |
| Install Command Line | msiexec /i "7z2408-x64.msi" /qn |
| Erkennungsregel | Product Code: {23170F69-40C1-2702-2408-000001000000} |

#### Altes VPN-Tool 3.1

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Apps |
| Kategorie | Win32-App |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 01.09.2023, 11:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-24 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-Vertrieb | Eingeschlossen | Deinstallieren |  |  |

**Einstellungen (1)**

| Einstellung | Wert |
| --- | --- |
| Install Command Line | setup.exe /S |

### App-Schutz

#### iOS – App-Schutz Outlook/Teams

| Eigenschaft | Wert |
| --- | --- |
| Bereich | App-Schutz |
| Kategorie | App-Schutz iOS/iPadOS |
| Plattform | iOS/iPadOS |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 18.06.2026, 11:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-25 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| Alle Benutzer | Eingeschlossen |  |  |  |
| GRP-IT-Admins | Ausgeschlossen |  |  |  |

**Einstellungen (3)**

| Einstellung | Wert |
| --- | --- |
| Geschützte Apps | com.microsoft.Office.Outlook, com.microsoft.skype.teams |
| Allowed Outbound Data Transfer Destinations | managedApps |
| Pin Required | Ja |

### App-Konfiguration

#### Outlook – nur Geschäftskonten

| Eigenschaft | Wert |
| --- | --- |
| Bereich | App-Konfiguration |
| Kategorie | Verwaltete Apps |
| Plattform | iOS/iPadOS |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 18.06.2026, 11:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-26 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| Alle Benutzer | Eingeschlossen |  |  |  |

**Einstellungen (1)**

| Einstellung | Wert |
| --- | --- |
| com.microsoft.outlook.Mail.FocusedInbox | false |

### Skripte & Remediations

#### Set-Regionaleinstellungen.ps1

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Skripte & Remediations |
| Kategorie | PowerShell-Skripte (Windows) |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 10.04.2025, 11:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-27 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Eingeschlossen |  |  |  |

**Einstellungen (2)**

| Einstellung | Wert |
| --- | --- |
| Run As Account | user |
| File Name | Set-Regionaleinstellungen.ps1 |

**Skriptinhalt**

```powershell
Set-WinSystemLocale de-DE
Set-Culture de-DE
Set-WinHomeLocation -GeoId 94
```

#### Remediation – Temp bereinigen

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Skripte & Remediations |
| Kategorie | Remediations |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 30.07.2026, 11:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-28 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Eingeschlossen |  |  | täglich 12:00 |

**Einstellungen (1)**

| Einstellung | Wert |
| --- | --- |
| Run As Account | system |

**Erkennungsskript**

```powershell
$size = (Get-ChildItem $env:TEMP -Recurse -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
if ($size -gt 1GB) { exit 1 } else { exit 0 }
```

**Korrekturskript**

```powershell
Get-ChildItem $env:TEMP -Recurse -ErrorAction SilentlyContinue | Where-Object LastWriteTime -lt (Get-Date).AddDays(-7) | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
```

#### mac – Dock konfigurieren

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Skripte & Remediations |
| Kategorie | Shell-Skripte (macOS) |
| Plattform | macOS |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 01.12.2025, 10:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-29 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-macOS | Eingeschlossen |  |  |  |

**Einstellungen (1)**

| Einstellung | Wert |
| --- | --- |
| Run As Account | user |

**Skriptinhalt**

```bash
#!/bin/zsh
defaults write com.apple.dock autohide -bool true
killall Dock
```

### Enrollment

#### ADE – Firmengeräte

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Enrollment |
| Kategorie | Apple ADE-Registrierungsprofile |
| Plattform | iOS/iPadOS |
| ADE-Token | Demo-Kunde ABM |
| Standardprofil | Ja |
| Zuletzt geändert | 25.05.2025, 15:31 |
| Status | Mandantenweit / nicht zuweisbar |
| Objekt-ID | adep-1 |

**Einstellungen (5)**

| Einstellung | Wert |
| --- | --- |
| Requires User Authentication | Ja |
| Supervised Mode Enabled | Ja |
| Is Mandatory | Ja |
| Apple Id Disabled | Ja |
| Terms And Conditions Disabled | Ja |

#### Autopilot – Standard (Entra Join)

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Enrollment |
| Kategorie | Autopilot-Profile |
| Plattform | Windows |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 05.05.2025, 11:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-30 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| GRP-Autopilot-Geräte | Eingeschlossen |  |  |  |

**Einstellungen (2)**

| Einstellung | Wert |
| --- | --- |
| Device Name Template | DEMO-%SERIAL% |
| Out Of Box Experience Setting | Privacy Settings Hidden: Ja; Eula Hidden: Ja; User Type: standard |

#### ESP – Standard

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Enrollment |
| Kategorie | Enrollment Status Page |
| Plattform | Windows |
| Priorität | Standard (0) |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 05.05.2025, 11:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-31 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| Alle Benutzer | Eingeschlossen |  |  |  |

**Einstellungen (2)**

| Einstellung | Wert |
| --- | --- |
| Show Installation Progress | Ja |
| Install Progress Timeout In Minutes | 60 |

#### Windows Hello for Business

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Enrollment |
| Kategorie | Windows Hello for Business |
| Plattform | Windows |
| Priorität | Standard (0) |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 05.08.2024, 11:00 |
| Status | Zugewiesen |
| Objekt-ID | demo-32 |

**Zuweisungen**

| Ziel | Art | Absicht | Filter | Hinweis |
| --- | --- | --- | --- | --- |
| Alle Benutzer | Eingeschlossen |  |  |  |

**Einstellungen (2)**

| Einstellung | Wert |
| --- | --- |
| State | enabled |
| Pin Minimum Length | 6 |

### Plattform-Anbindungen

#### Demo-Kunde ABM

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Plattform-Anbindungen |
| Kategorie | Apple Automated Device Enrollment (ADE-Token) |
| Plattform | iOS/iPadOS, macOS |
| Status | Mandantenweit / nicht zuweisbar |
| Objekt-ID | ade-1 |

**Einstellungen (7)**

| Einstellung | Wert |
| --- | --- |
| Apple-ID | abm-admin@demokunde.de |
| Typ | Apple Business Manager |
| Token gültig bis | 07.05.2027, 15:31 |
| Letzte erfolgreiche Synchronisierung | 07.10.2026, 08:19 |
| Synchronisierte Geräte | 12 |
| Letzter Sync-Fehlercode | keiner |
| Datenfreigabe an Apple erteilt | Ja |

#### Apple MDM-Push-Zertifikat

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Plattform-Anbindungen |
| Kategorie | Apple MDM-Push-Zertifikat (APNs) |
| Plattform | iOS/iPadOS, macOS |
| Zuletzt geändert | 28.10.2025, 14:31 |
| Status | Mandantenweit / nicht zuweisbar |
| Objekt-ID | apns |

**Einstellungen (5)**

| Einstellung | Wert |
| --- | --- |
| Apple-ID (für die Verlängerung zwingend dieselbe!) | it-apple@demokunde.de |
| Gültig bis | 28.10.2026, 14:31 |
| Topic-ID | com.apple.mgmt.External.4f2c… |
| Seriennummer | 6A1F…C2 |
| Upload-Status | Erfolgreich |

#### Demo-Kunde Apps

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Plattform-Anbindungen |
| Kategorie | Apple VPP-Token (Apps & Bücher) |
| Plattform | iOS/iPadOS, macOS |
| Status | Mandantenweit / nicht zuweisbar |
| Objekt-ID | vpp-1 |

**Einstellungen (9)**

| Einstellung | Wert |
| --- | --- |
| Organisation | Demo-Kunde GmbH |
| Apple-ID | abm-admin@demokunde.de |
| Standort | Hauptsitz |
| Status | Gültig |
| Gültig bis | 24.11.2026, 14:31 |
| Letzte Synchronisierung | 07.10.2026, 03:31 |
| Sync-Status | completed |
| Apps automatisch aktualisieren | Ja |
| Land/Region | de |

#### Managed Google Play

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Plattform-Anbindungen |
| Kategorie | Managed Google Play (Android Enterprise) |
| Plattform | Android |
| Status | Mandantenweit / nicht zuweisbar |
| Objekt-ID | mgp |

**Einstellungen (7)**

| Einstellung | Wert |
| --- | --- |
| Verbindungsstatus | Verbunden und geprüft |
| Verknüpftes Google-Konto (Besitzer) | android-admin@demokunde.de |
| Organisation | Demo-Kunde GmbH |
| Letzte App-Synchronisierung | 07.10.2026, 10:43 |
| Sync-Status | success |
| Arbeitsprofil-Registrierung erlaubt für | All |
| Vollständig verwaltete Geräte erlaubt | Ja |

#### Microsoft Defender for Endpoint

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Plattform-Anbindungen |
| Kategorie | Mobile Threat Defense / Defender-Anbindung |
| Plattform | Android, iOS, Windows |
| Status | Mandantenweit / nicht zuweisbar |
| Objekt-ID | fc780465-2017-40d4-a0c5-307022471b92 |

**Einstellungen (7)**

| Einstellung | Wert |
| --- | --- |
| Status | Aktiv |
| Letztes Lebenszeichen | 07.10.2026, 15:02 |
| Android-Geräte verbinden | Ja |
| iOS-Geräte verbinden | Ja |
| Windows-Geräte verbinden | Ja |
| macOS-Geräte verbinden | Nein |
| Geräte ohne Unterstützung blockieren | Nein |

### Mandant & Verwaltung

#### Helpdesk Level 1 (benutzerdefiniert)

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Mandant & Verwaltung |
| Kategorie | Intune-Rollen |
| Typ | Benutzerdefinierte Rolle |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 01.03.2025, 10:00 |
| Status | Mandantenweit / nicht zuweisbar |
| Objekt-ID | demo-34 |

**Einstellungen (2)**

| Einstellung | Wert |
| --- | --- |
| Berechtigungen (6) | ManagedDevices Read, ManagedDevices RemoteLock, ManagedDevices Sync, ManagedApps Read, DeviceConfigurations Read, Audit Read |
| Zuweisung „Helpdesk“ | Mitglieder: GRP-IT-Admins · Bereich: Alle Geräte |

#### Compliance-Einstellungen des Mandanten

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Mandant & Verwaltung |
| Kategorie | Mandanteneinstellungen |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Status | Mandantenweit / nicht zuweisbar |
| Objekt-ID | demo-35 |

**Einstellungen (2)**

| Einstellung | Wert |
| --- | --- |
| Secure By Default | Ja |
| Device Compliance Checkin Threshold Days | 30 |

#### iOS – Supervised

| Eigenschaft | Wert |
| --- | --- |
| Bereich | Mandant & Verwaltung |
| Kategorie | Zuweisungsfilter |
| Plattform | iOS/iPadOS |
| Bereichsmarkierungen | Default |
| Erstellt | 01.02.2024, 10:00 |
| Zuletzt geändert | 01.03.2025, 10:00 |
| Status | Mandantenweit / nicht zuweisbar |
| Objekt-ID | f1 |

**Einstellungen (1)**

| Einstellung | Wert |
| --- | --- |
| Regel | (device.deviceOwnership -eq "Corporate") and (device.enrollmentProfileName -startsWith "ADE") |

## Zuweisungen nach Gruppe

### Alle Geräte

| Objekt | Bereich / Kategorie | Art | Absicht | Filter |
| --- | --- | --- | --- | --- |
| Security Baseline 2024 | Security Baselines / Security Baseline for Windows 10 and later | Eingeschlossen |  |  |
| WIN – Compliance Standard | Compliance / Compliance-Richtlinie | Eingeschlossen |  |  |
| WU – Ring 2 Breit | Windows Updates / Update-Ring (Windows) | Eingeschlossen |  |  |
| 7-Zip 24.08 | Apps / Win32-App | Eingeschlossen | Erforderlich |  |

### Alle Benutzer

| Objekt | Bereich / Kategorie | Art | Absicht | Filter |
| --- | --- | --- | --- | --- |
| Company Portal | Apps / Microsoft Store (WinGet) | Eingeschlossen | Verfügbar |  |
| iOS – App-Schutz Outlook/Teams | App-Schutz / App-Schutz iOS/iPadOS | Eingeschlossen |  |  |
| Outlook – nur Geschäftskonten | App-Konfiguration / Verwaltete Apps | Eingeschlossen |  |  |
| ESP – Standard | Enrollment / Enrollment Status Page | Eingeschlossen |  |  |
| Windows Hello for Business | Enrollment / Windows Hello for Business | Eingeschlossen |  |  |

### GRP-Win-Clients

| Objekt | Bereich / Kategorie | Art | Absicht | Filter |
| --- | --- | --- | --- | --- |
| WIN – BitLocker Basis | Endpoint Security / Datenträgerverschlüsselung | Eingeschlossen |  |  |
| WIN – Firewall Domäne/Privat/Öffentlich | Endpoint Security / Firewall | Eingeschlossen |  |  |
| Edge Settings (alt) | Konfiguration / Settings Catalog | Eingeschlossen |  |  |
| WIN – OneDrive Known Folder Move | Konfiguration / Settings Catalog | Eingeschlossen |  |  |
| ADMX – Office Grundeinstellungen | Konfiguration / Administrative Vorlagen | Eingeschlossen |  |  |
| WIN – Custom OMA-URI Sperrbildschirm | Konfiguration / Benutzerdefiniert (OMA-URI / Profil) | Eingeschlossen |  |  |
| WLAN – Firmennetz | Konfiguration / WLAN | Eingeschlossen |  |  |
| Feature-Update Windows 11 24H2 | Windows Updates / Feature-Updates | Eingeschlossen |  |  |
| Treiber – automatische Freigabe | Windows Updates / Treiber-Updates | Eingeschlossen |  |  |
| Microsoft 365 Apps for Enterprise | Apps / Microsoft 365 Apps | Eingeschlossen | Erforderlich |  |
| Set-Regionaleinstellungen.ps1 | Skripte & Remediations / PowerShell-Skripte (Windows) | Eingeschlossen |  |  |
| Remediation – Temp bereinigen | Skripte & Remediations / Remediations | Eingeschlossen |  |  |

### GRP-iOS-Firmengeräte

| Objekt | Bereich / Kategorie | Art | Absicht | Filter |
| --- | --- | --- | --- | --- |
| iOS – Geräteeinschränkungen | Konfiguration / Geräteeinschränkungen | Eingeschlossen |  | Einschluss: iOS – Supervised |
| iOS – Compliance | Compliance / Compliance-Richtlinie | Eingeschlossen |  |  |
| Microsoft Outlook (iOS) | Apps / Volumenlizenz-App (VPP) | Eingeschlossen | Erforderlich |  |

### GRP-Kiosk

| Objekt | Bereich / Kategorie | Art | Absicht | Filter |
| --- | --- | --- | --- | --- |
| WIN – BitLocker Basis | Endpoint Security / Datenträgerverschlüsselung | Ausgeschlossen |  |  |
| WU – Ring 2 Breit | Windows Updates / Update-Ring (Windows) | Ausgeschlossen |  |  |
| 7-Zip 24.08 | Apps / Win32-App | Ausgeschlossen |  |  |

### GRP-Vertrieb

| Objekt | Bereich / Kategorie | Art | Absicht | Filter |
| --- | --- | --- | --- | --- |
| AV – Vertrieb | Endpoint Security / Antivirus | Eingeschlossen |  |  |
| Edge – Startseite & Erweiterungen | Konfiguration / Settings Catalog | Eingeschlossen |  |  |
| Altes VPN-Tool 3.1 | Apps / Win32-App | Eingeschlossen | Deinstallieren |  |

### GRP-IT-Admins

| Objekt | Bereich / Kategorie | Art | Absicht | Filter |
| --- | --- | --- | --- | --- |
| WU – Ring IT | Windows Updates / Update-Ring (Windows) | Eingeschlossen |  |  |
| iOS – App-Schutz Outlook/Teams | App-Schutz / App-Schutz iOS/iPadOS | Ausgeschlossen |  |  |

### (gelöschte Gruppe g-old-12…)

| Objekt | Bereich / Kategorie | Art | Absicht | Filter |
| --- | --- | --- | --- | --- |
| WIN – OneDrive Known Folder Move | Konfiguration / Settings Catalog | Eingeschlossen |  |  |

### GRP-Autopilot-Geräte (dynamisch)

| Objekt | Bereich / Kategorie | Art | Absicht | Filter |
| --- | --- | --- | --- | --- |
| Autopilot – Standard (Entra Join) | Enrollment / Autopilot-Profile | Eingeschlossen |  |  |

### GRP-macOS

| Objekt | Bereich / Kategorie | Art | Absicht | Filter |
| --- | --- | --- | --- | --- |
| mac – Dock konfigurieren | Skripte & Remediations / Shell-Skripte (macOS) | Eingeschlossen |  |  |

## Konflikte & Dubletten

### Konflikt (Hoch): Cloud Block Level

| Richtlinie | Wert | Zuweisung |
| --- | --- | --- |
| Security Baseline 2024 | High | Alle Geräte |
| AV – Vertrieb | Default | GRP-Vertrieb |

### Konflikt (Hoch): Quality Updates Deferral Period In Days

| Richtlinie | Wert | Zuweisung |
| --- | --- | --- |
| WU – Ring 2 Breit | 7 | Alle Geräte |
| WU – Ring IT | 0 | GRP-IT-Admins |

### Konflikt (Hoch): Select the encryption method for operating system drives

| Richtlinie | Wert | Zuweisung |
| --- | --- | --- |
| WIN – BitLocker Basis | XTS-AES 256-bit | GRP-Win-Clients |
| Security Baseline 2024 | XTS-AES 128-bit | Alle Geräte |

### Dublette (Niedrig): Allow Realtime Monitoring

| Richtlinie | Wert | Zuweisung |
| --- | --- | --- |
| Security Baseline 2024 | Allowed | Alle Geräte |
| AV – Vertrieb | Allowed | GRP-Vertrieb |

### Dublette (Niedrig): Configure the home page URL

| Richtlinie | Wert | Zuweisung |
| --- | --- | --- |
| Edge – Startseite & Erweiterungen | https://intranet.demokunde.de | GRP-Vertrieb |
| Edge Settings (alt) | https://intranet.demokunde.de | GRP-Win-Clients |

## Nicht zugewiesene Objekte

| Name | Bereich | Kategorie | Geändert |
| --- | --- | --- | --- |
| Test_Policy_Kopie (2) | Konfiguration | Settings Catalog | 11.11.2024 |
| WU – Ring 1 Pilot | Windows Updates | Update-Ring (Windows) | 09.01.2025 |

## Geräteinventar

### Geräte je Plattform

| Plattform | Geräte | Nicht konform | Ohne Check-in > 30 Tage | Unverschlüsselt | Privat |
| --- | --- | --- | --- | --- | --- |
| Windows | 18 | 2 | 1 | 2 | 0 |
| iOS/iPadOS | 9 | 1 | 1 | — | 1 |
| Android | 7 | 1 | 0 | — | 1 |
| macOS | 3 | 0 | 0 | 1 | 0 |
| Gesamt | 37 | 4 | 2 | 3 | 2 |

### Konformität

| Status | Geräte |
| --- | --- |
| Konform | 32 |
| Nicht konform | 4 |
| Kulanzzeitraum | 1 |

### Registrierungsart

| Art | Geräte |
| --- | --- |
| Entra Join | 12 |
| Apple ADE mit Benutzer | 11 |
| Co-Management | 4 |
| Android Enterprise – vollständig verwaltet | 4 |
| Automatische Registrierung | 2 |
| Android Enterprise – dediziert | 2 |
| Apple Benutzerregistrierung | 1 |
| Benutzerregistrierung | 1 |

### Windows: Join-Typ

| Join-Typ | Geräte |
| --- | --- |
| Entra Join | 12 |
| Hybrid Entra Join | 6 |

### Betriebssystem-Versionen

| Plattform | Version | Geräte |
| --- | --- | --- |
| Windows | 10.0.26100.6584 | 9 |
| Windows | 10.0.26100.4946 | 3 |
| Windows | 10.0.22631.5909 | 3 |
| Windows | 10.0.19045.6332 | 3 |
| iOS/iPadOS | 26.0.1 | 4 |
| iOS/iPadOS | 18.6.2 | 4 |
| iOS/iPadOS | 17.7.10 | 1 |
| Android | 16 | 2 |
| Android | 15 | 2 |
| Android | 13 | 2 |
| Android | 14 | 1 |
| macOS | 15.6.1 | 2 |
| macOS | 26.0.1 | 1 |

### Häufigste Modelle

| Hersteller / Modell | Geräte |
| --- | --- |
| Dell Inc. Latitude 7450 | 12 |
| Microsoft Corporation Surface Laptop 6 | 6 |
| Apple iPhone 15 | 3 |
| Apple iPhone 16 | 3 |
| Apple iPad Air (M2) | 3 |
| Apple MacBook Pro (14-inch, M4) | 3 |
| Zebra Technologies TC52 | 2 |
| Google Pixel 9 | 1 |
| samsung Galaxy S24 | 1 |
| samsung Galaxy A55 | 1 |
| Google Pixel 8a | 1 |
| samsung Galaxy S23 | 1 |

### Windows Autopilot

| Group Tag | Geräte |
| --- | --- |
| Standard | 10 |
| Vertrieb | 3 |
| (ohne Group Tag) | 1 |

## Änderungen seit Demo-Snapshot vom 15.09.2026

| Art | Objekt | Bereich | Details |
| --- | --- | --- | --- |
| Geändert | Microsoft Defender for Endpoint | Plattform-Anbindungen | Letztes Lebenszeichen: 07.10.2026, 15:03 → 07.10.2026, 15:02 |
| Geändert | WIN – BitLocker Basis | Endpoint Security | Select the encryption method for operating system drives: XTS-AES 128-bit → XTS-AES 256-bit |
| Zuweisung | WU – Ring 1 Pilot | Windows Updates | − Zuweisung GRP-Update-Pilot |
| Neu | AV – Vertrieb | Endpoint Security | 2 Einstellungen, 1 Zuweisungen |
| Neu | Remediation – Temp bereinigen | Skripte & Remediations | 1 Einstellungen, 1 Zuweisungen |
| Entfernt | Teams Classic | Apps |  |

## Scan-Hinweise

| Quelle | Hinweis |
| --- | --- |
| Demo | Beispieldaten – kein echter Mandant. |


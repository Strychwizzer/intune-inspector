# Intune documentation – Demo-Kunde GmbH

- Tenant: demokunde.onmicrosoft.com · 00000000-demo-0000-0000-000000000000
- As of: 07/10/2026, 15:32
- Created by: Jane Doe
- Objects: 41
- Managed devices: 37
- Partner: Example IT Partner Ltd
- Created with Intune Inspector

> Sample data (demo mode)

## Management summary

| Area | Objects | Assigned | Unassigned |
| --- | --- | --- | --- |
| Configuration | 8 | 7 | 1 |
| Endpoint Security | 3 | 3 | 0 |
| Security Baselines | 1 | 1 | 0 |
| Compliance | 2 | 2 | 0 |
| Windows Updates | 5 | 4 | 1 |
| Apps | 5 | 5 | 0 |
| App protection | 1 | 1 | 0 |
| App configuration | 1 | 1 | 0 |
| Scripts & remediations | 3 | 3 | 0 |
| Enrollment | 4 | 3 | 0 |
| Platform connectors | 5 | 0 | 0 |
| Tenant & administration | 3 | 0 | 0 |

### Findings

- **High:** Apple MDM push certificate expires in 21 days – Renew with the same Apple ID, otherwise all Apple devices must be re-enrolled.
- **High:** 3 setting(s) with contradicting values – The same setting is configured differently by several assigned policies.
- **High:** 1 object(s) assigned to deleted groups – Assignments point to groups that no longer exist in Entra ID.
- **High:** 1 jailbroken/rooted device(s) – Compromised mobile devices.
- **Medium:** Apple VPP token “Demo-Kunde Apps” expires in 48 days – Plan the renewal.
- **Medium:** 2 unassigned object(s) – Clean-up candidates or forgotten tests.
- **Medium:** 4 noncompliant device(s) – Conditional Access may block these devices.
- **Medium:** 3 unencrypted Windows/macOS device(s) – BitLocker or FileVault not active.
- **Low:** 2 setting(s) configured several times with the same value – No contradiction, but redundant.
- **Low:** 2 device(s) without check-in for over 30 days – Candidates for device clean-up rules.
- **Low:** 1 Autopilot device(s) without deployment profile – These devices will not go through Autopilot setup.
- **Info:** 13 object(s) unchanged for over 12 months – Check whether they are still needed.
- **Info:** 3 % of objects have a description – Descriptions in Intune or notes here improve the documentation.

## Platform connectors & expiry dates

Expiring certificates or tokens stop management of the affected devices. The Apple MDM push certificate must be renewed with the same Apple ID.

| Connector | Name | Platform | Valid until | Status |
| --- | --- | --- | --- | --- |
| Apple MDM push certificate (APNs) | Apple MDM push certificate | iOS/iPadOS, macOS | 28/10/2026 | 21 days left |
| Apple VPP token (apps & books) | Demo-Kunde Apps | iOS/iPadOS, macOS | 24/11/2026 | 48 days left |
| Apple Automated Device Enrollment (ADE token) | Demo-Kunde ABM | iOS/iPadOS, macOS | 07/05/2027 | 212 days left |
| Managed Google Play (Android Enterprise) | Managed Google Play | Android | — | OK |
| Mobile Threat Defense / Defender connector | Microsoft Defender for Endpoint | Android, iOS, Windows | — | OK |

## Overview

### Configuration (8)

| Name | Category | Platform | Assignment | Modified |
| --- | --- | --- | --- | --- |
| ADMX – Office Grundeinstellungen | Administrative templates | Windows | GRP-Win-Clients | 17/06/2025 |
| WIN – Custom OMA-URI Sperrbildschirm | Custom (OMA-URI / profile) | Windows | GRP-Win-Clients | 20/01/2025 |
| iOS – Geräteeinschränkungen | Device restrictions | iOS/iPadOS | GRP-iOS-Firmengeräte [Filter Include: iOS – Supervised] | 04/05/2026 |
| Edge – Startseite & Erweiterungen | Settings Catalog | Windows | GRP-Vertrieb | 21/08/2026 |
| Edge Settings (alt) | Settings Catalog | Windows | GRP-Win-Clients | 02/10/2024 |
| Test_Policy_Kopie (2) | Settings Catalog | Windows | Unassigned | 11/11/2024 |
| WIN – OneDrive Known Folder Move | Settings Catalog | Windows | GRP-Win-Clients; (deleted group g-old-12…) | 03/04/2026 |
| WLAN – Firmennetz | Wi-Fi | Windows | GRP-Win-Clients | 10/09/2025 |

### Endpoint Security (3)

| Name | Category | Platform | Assignment | Modified |
| --- | --- | --- | --- | --- |
| AV – Vertrieb | Antivirus | Windows | GRP-Vertrieb | 02/08/2026 |
| WIN – BitLocker Basis | Disk encryption | Windows | GRP-Win-Clients; Excluded: GRP-Kiosk | 29/09/2026 |
| WIN – Firewall Domäne/Privat/Öffentlich | Firewall | Windows | GRP-Win-Clients | 11/05/2026 |

### Security Baselines (1)

| Name | Category | Platform | Assignment | Modified |
| --- | --- | --- | --- | --- |
| Security Baseline 2024 | Security Baseline for Windows 10 and later | Windows | All devices | 14/03/2025 |

### Compliance (2)

| Name | Category | Platform | Assignment | Modified |
| --- | --- | --- | --- | --- |
| iOS – Compliance | Compliance policy | iOS/iPadOS | GRP-iOS-Firmengeräte | 12/02/2026 |
| WIN – Compliance Standard | Compliance policy | Windows | All devices | 02/09/2026 |

### Windows Updates (5)

| Name | Category | Platform | Assignment | Modified |
| --- | --- | --- | --- | --- |
| Treiber – automatische Freigabe | Driver updates | Windows | GRP-Win-Clients | 15/04/2026 |
| Feature-Update Windows 11 24H2 | Feature updates | Windows | GRP-Win-Clients | 15/01/2026 |
| WU – Ring 1 Pilot | Update ring (Windows) | Windows | Unassigned | 09/01/2025 |
| WU – Ring 2 Breit | Update ring (Windows) | Windows | All devices; Excluded: GRP-Kiosk | 09/01/2025 |
| WU – Ring IT | Update ring (Windows) | Windows | GRP-IT-Admins | 09/03/2026 |

### Apps (5)

| Name | Category | Platform | Assignment | Modified |
| --- | --- | --- | --- | --- |
| Microsoft 365 Apps for Enterprise | Microsoft 365 Apps | Windows | GRP-Win-Clients (Required) | 02/02/2026 |
| Company Portal | Microsoft Store (WinGet) | Windows | All users (Available) | 05/11/2025 |
| Microsoft Outlook (iOS) | Volume-purchased app (VPP) | iOS/iPadOS | GRP-iOS-Firmengeräte (Required) | 01/03/2026 |
| 7-Zip 24.08 | Win32 app | Windows | All devices (Required) – Notifications: hideAll; Excluded: GRP-Kiosk | 22/07/2026 |
| Altes VPN-Tool 3.1 | Win32 app | Windows | GRP-Vertrieb (Uninstall) | 01/09/2023 |

### App protection (1)

| Name | Category | Platform | Assignment | Modified |
| --- | --- | --- | --- | --- |
| iOS – App-Schutz Outlook/Teams | App protection iOS/iPadOS | iOS/iPadOS | All users; Excluded: GRP-IT-Admins | 18/06/2026 |

### App configuration (1)

| Name | Category | Platform | Assignment | Modified |
| --- | --- | --- | --- | --- |
| Outlook – nur Geschäftskonten | Managed apps | iOS/iPadOS | All users | 18/06/2026 |

### Scripts & remediations (3)

| Name | Category | Platform | Assignment | Modified |
| --- | --- | --- | --- | --- |
| Set-Regionaleinstellungen.ps1 | PowerShell scripts (Windows) | Windows | GRP-Win-Clients | 10/04/2025 |
| Remediation – Temp bereinigen | Remediations | Windows | GRP-Win-Clients – daily 12:00 | 30/07/2026 |
| mac – Dock konfigurieren | Shell scripts (macOS) | macOS | GRP-macOS | 01/12/2025 |

### Enrollment (4)

| Name | Category | Platform | Assignment | Modified |
| --- | --- | --- | --- | --- |
| ADE – Firmengeräte | Apple ADE enrollment profiles | iOS/iPadOS | — | 25/05/2025 |
| Autopilot – Standard (Entra Join) | Autopilot profiles | Windows | GRP-Autopilot-Geräte | 05/05/2025 |
| ESP – Standard | Enrollment Status Page | Windows | All users | 05/05/2025 |
| Windows Hello for Business | Windows Hello for Business | Windows | All users | 05/08/2024 |

### Platform connectors (5)

| Name | Category | Platform | Assignment | Modified |
| --- | --- | --- | --- | --- |
| Demo-Kunde ABM | Apple Automated Device Enrollment (ADE token) | iOS/iPadOS, macOS | — | — |
| Apple MDM push certificate | Apple MDM push certificate (APNs) | iOS/iPadOS, macOS | — | 28/10/2025 |
| Demo-Kunde Apps | Apple VPP token (apps & books) | iOS/iPadOS, macOS | — | — |
| Managed Google Play | Managed Google Play (Android Enterprise) | Android | — | — |
| Microsoft Defender for Endpoint | Mobile Threat Defense / Defender connector | Android, iOS, Windows | — | — |

### Tenant & administration (3)

| Name | Category | Platform | Assignment | Modified |
| --- | --- | --- | --- | --- |
| iOS – Supervised | Assignment filters | iOS/iPadOS | — | 01/03/2025 |
| Helpdesk Level 1 (benutzerdefiniert) | Intune roles | — | — | 01/03/2025 |
| Tenant compliance settings | Tenant settings | — | — | — |

## Details per object

### Configuration

#### ADMX – Office Grundeinstellungen

| Property | Value |
| --- | --- |
| Area | Configuration |
| Category | Administrative templates |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 17/06/2025, 14:00 |
| Status | Assigned |
| Object ID | demo-9 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Included |  |  |  |

**Settings (2)**

| Setting | Value |
| --- | --- |
| User › Microsoft Word 2016 › Word Options › Security › Block macros from running in Office files from the Internet | Enabled |
| User › Microsoft Office 2016 › First Run › Disable the Office First Run on application boot | Enabled |

#### WIN – Custom OMA-URI Sperrbildschirm

| Property | Value |
| --- | --- |
| Area | Configuration |
| Category | Custom (OMA-URI / profile) |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 20/01/2025, 11:00 |
| Status | Assigned |
| Object ID | demo-10 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Included |  |  |  |

**Settings (1)**

| Setting | Value |
| --- | --- |
| Lock screen slide show — ./Device/Vendor/MSFT/Policy/Config/DeviceLock/PreventLockScreenSlideShow | 1 |

#### iOS – Geräteeinschränkungen

| Property | Value |
| --- | --- |
| Area | Configuration |
| Category | Device restrictions |
| Platform | iOS/iPadOS |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 04/05/2026, 11:00 |
| Status | Assigned |
| Object ID | demo-12 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-iOS-Firmengeräte | Included |  | Include: iOS – Supervised |  |

**Settings (3)**

| Setting | Value |
| --- | --- |
| App Store Blocked | Yes |
| Passcode Required | Yes |
| Passcode Minimum Length | 6 |

#### Edge – Startseite & Erweiterungen

| Property | Value |
| --- | --- |
| Area | Configuration |
| Category | Settings Catalog |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 21/08/2026, 09:45 |
| Status | Assigned |
| Object ID | demo-5 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-Vertrieb | Included |  |  |  |

**Settings (2)**

| Setting | Value |
| --- | --- |
| Configure the home page URL | https://intranet.demokunde.de |
| Control which extensions cannot be installed | * |

#### Edge Settings (alt)

| Property | Value |
| --- | --- |
| Area | Configuration |
| Category | Settings Catalog |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 02/10/2024, 09:45 |
| Status | Assigned |
| Object ID | demo-6 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Included |  |  |  |

**Settings (1)**

| Setting | Value |
| --- | --- |
| Configure the home page URL | https://intranet.demokunde.de |

#### Test_Policy_Kopie (2)

| Property | Value |
| --- | --- |
| Area | Configuration |
| Category | Settings Catalog |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 11/11/2024, 17:00 |
| Status | Unassigned |
| Object ID | demo-7 |

**Assignments**

_no entries_

**Settings (1)**

| Setting | Value |
| --- | --- |
| Allow Camera | Block |

#### WIN – OneDrive Known Folder Move

| Property | Value |
| --- | --- |
| Area | Configuration |
| Category | Settings Catalog |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 03/04/2026, 13:10 |
| Status | Assigned |
| Object ID | demo-8 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Included |  |  |  |
| (deleted group g-old-12…) | Included |  |  |  |

**Settings (2)**

| Setting | Value |
| --- | --- |
| Silently move Windows known folders to OneDrive | Enabled |
| ↳ Tenant ID | [TENANT-ID] |

#### WLAN – Firmennetz

| Property | Value |
| --- | --- |
| Area | Configuration |
| Category | Wi-Fi |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 10/09/2025, 12:00 |
| Status | Assigned |
| Object ID | demo-11 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Included |  |  |  |

**Settings (3)**

| Setting | Value |
| --- | --- |
| Ssid | DEMO-CORP |
| Wifi Security Type | wpa2Enterprise |
| Pre Shared Key | (hidden) |

### Endpoint Security

#### AV – Vertrieb

| Property | Value |
| --- | --- |
| Area | Endpoint Security |
| Category | Antivirus |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 02/08/2026, 15:20 |
| Status | Assigned |
| Object ID | demo-3 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-Vertrieb | Included |  |  |  |

**Settings (2)**

| Setting | Value |
| --- | --- |
| Cloud Block Level | Default |
| Allow Realtime Monitoring | Allowed |

#### WIN – BitLocker Basis

| Property | Value |
| --- | --- |
| Area | Endpoint Security |
| Category | Disk encryption |
| Platform | Windows |
| Template | BitLocker |
| Description | Standard-Verschlüsselung für alle Windows-Clients |
| Note | Agreed with Mr Example (head of IT), ticket #4711. |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 29/09/2026, 12:12 |
| Status | Assigned |
| Object ID | demo-1 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Included |  |  |  |
| GRP-Kiosk | Excluded |  |  |  |

**Settings (4)**

| Setting | Value |
| --- | --- |
| Require Device Encryption | Enabled |
| Select the encryption method for operating system drives | XTS-AES 256-bit |
| Save BitLocker recovery information to Azure Active Directory | Enabled |
| Allow Warning For Other Disk Encryption | Block |

#### WIN – Firewall Domäne/Privat/Öffentlich

| Property | Value |
| --- | --- |
| Area | Endpoint Security |
| Category | Firewall |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 11/05/2026, 11:00 |
| Status | Assigned |
| Object ID | demo-4 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Included |  |  |  |

**Settings (3)**

| Setting | Value |
| --- | --- |
| Domain profile: Enable Firewall | True |
| Public profile: Enable Firewall | True |
| Public profile: Default Inbound Action | Block |

### Security Baselines

#### Security Baseline 2024

| Property | Value |
| --- | --- |
| Area | Security Baselines |
| Category | Security Baseline for Windows 10 and later |
| Platform | Windows |
| Template | Security Baseline for Windows 10 and later (Version 24H2) |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 14/03/2025, 09:00 |
| Status | Assigned |
| Object ID | demo-2 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| All devices | Included |  |  |  |

**Settings (4)**

| Setting | Value |
| --- | --- |
| Select the encryption method for operating system drives | XTS-AES 128-bit |
| Allow Realtime Monitoring | Allowed |
| Cloud Block Level | High |
| Enable insecure guest logons | Disabled |

### Compliance

#### iOS – Compliance

| Property | Value |
| --- | --- |
| Area | Compliance |
| Category | Compliance policy |
| Platform | iOS/iPadOS |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 12/02/2026, 10:00 |
| Status | Assigned |
| Object ID | demo-14 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-iOS-Firmengeräte | Included |  |  |  |

**Settings (2)**

| Setting | Value |
| --- | --- |
| Os Minimum Version | 17.0 |
| Security Block Jailbroken Devices | Yes |

#### WIN – Compliance Standard

| Property | Value |
| --- | --- |
| Area | Compliance |
| Category | Compliance policy |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 02/09/2026, 11:00 |
| Status | Assigned |
| Object ID | demo-13 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| All devices | Included |  |  |  |

**Settings (4)**

| Setting | Value |
| --- | --- |
| Bit Locker Enabled | Yes |
| Os Minimum Version | 10.0.22631 |
| Firewall Enabled | Yes |
| Action for noncompliance | Block after 3 day(s) |

### Windows Updates

#### Treiber – automatische Freigabe

| Property | Value |
| --- | --- |
| Area | Windows Updates |
| Category | Driver updates |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 15/04/2026, 11:00 |
| Status | Assigned |
| Object ID | demo-19 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Included |  |  |  |

**Settings (2)**

| Setting | Value |
| --- | --- |
| Approval Type | automatic |
| Deployment Deferral In Days | 7 |

#### Feature-Update Windows 11 24H2

| Property | Value |
| --- | --- |
| Area | Windows Updates |
| Category | Feature updates |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 15/01/2026, 10:00 |
| Status | Assigned |
| Object ID | demo-18 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Included |  |  |  |

**Settings (1)**

| Setting | Value |
| --- | --- |
| Feature Update Version | Windows 11, version 24H2 |

#### WU – Ring 1 Pilot

| Property | Value |
| --- | --- |
| Area | Windows Updates |
| Category | Update ring (Windows) |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 09/01/2025, 10:00 |
| Status | Unassigned |
| Object ID | demo-15 |

**Assignments**

_no entries_

**Settings (2)**

| Setting | Value |
| --- | --- |
| Quality Updates Deferral Period In Days | 0 |
| Feature Updates Deferral Period In Days | 0 |

#### WU – Ring 2 Breit

| Property | Value |
| --- | --- |
| Area | Windows Updates |
| Category | Update ring (Windows) |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 09/01/2025, 10:00 |
| Status | Assigned |
| Object ID | demo-16 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| All devices | Included |  |  |  |
| GRP-Kiosk | Excluded |  |  |  |

**Settings (3)**

| Setting | Value |
| --- | --- |
| Quality Updates Deferral Period In Days | 7 |
| Feature Updates Deferral Period In Days | 30 |
| Deadline For Quality Updates In Days | 2 |

#### WU – Ring IT

| Property | Value |
| --- | --- |
| Area | Windows Updates |
| Category | Update ring (Windows) |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 09/03/2026, 10:00 |
| Status | Assigned |
| Object ID | demo-17 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-IT-Admins | Included |  |  |  |

**Settings (1)**

| Setting | Value |
| --- | --- |
| Quality Updates Deferral Period In Days | 0 |

### Apps

#### Microsoft 365 Apps for Enterprise

| Property | Value |
| --- | --- |
| Area | Apps |
| Category | Microsoft 365 Apps |
| Platform | Windows |
| Publisher | Microsoft |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 02/02/2026, 10:00 |
| Status | Assigned |
| Object ID | demo-20 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Included | Required |  |  |

**Settings (2)**

| Setting | Value |
| --- | --- |
| Update Channel | monthlyEnterprise |
| Excluded Office apps | Groove, Lync |

#### Company Portal

| Property | Value |
| --- | --- |
| Area | Apps |
| Category | Microsoft Store (WinGet) |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 05/11/2025, 10:00 |
| Status | Assigned |
| Object ID | demo-22 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| All users | Included | Available |  |  |

**Settings (1)**

| Setting | Value |
| --- | --- |
| Package Identifier | 9WZDNCRFJ3PZ |

#### Microsoft Outlook (iOS)

| Property | Value |
| --- | --- |
| Area | Apps |
| Category | Volume-purchased app (VPP) |
| Platform | iOS/iPadOS |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 01/03/2026, 10:00 |
| Status | Assigned |
| Object ID | demo-23 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-iOS-Firmengeräte | Included | Required |  |  |

**Settings (1)**

| Setting | Value |
| --- | --- |
| Bundle Id | com.microsoft.Office.Outlook |

#### 7-Zip 24.08

| Property | Value |
| --- | --- |
| Area | Apps |
| Category | Win32 app |
| Platform | Windows |
| Publisher | Igor Pavlov |
| Version | 24.08 |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 22/07/2026, 11:00 |
| Status | Assigned |
| Object ID | demo-21 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| All devices | Included | Required |  | Notifications: hideAll |
| GRP-Kiosk | Excluded |  |  |  |

**Settings (3)**

| Setting | Value |
| --- | --- |
| Install behavior | Run As Account: system; Device Restart Behavior: suppress |
| Install Command Line | msiexec /i "7z2408-x64.msi" /qn |
| Detection rule | Product Code: {23170F69-40C1-2702-2408-000001000000} |

#### Altes VPN-Tool 3.1

| Property | Value |
| --- | --- |
| Area | Apps |
| Category | Win32 app |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 01/09/2023, 11:00 |
| Status | Assigned |
| Object ID | demo-24 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-Vertrieb | Included | Uninstall |  |  |

**Settings (1)**

| Setting | Value |
| --- | --- |
| Install Command Line | setup.exe /S |

### App protection

#### iOS – App-Schutz Outlook/Teams

| Property | Value |
| --- | --- |
| Area | App protection |
| Category | App protection iOS/iPadOS |
| Platform | iOS/iPadOS |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 18/06/2026, 11:00 |
| Status | Assigned |
| Object ID | demo-25 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| All users | Included |  |  |  |
| GRP-IT-Admins | Excluded |  |  |  |

**Settings (3)**

| Setting | Value |
| --- | --- |
| Protected apps | com.microsoft.Office.Outlook, com.microsoft.skype.teams |
| Allowed Outbound Data Transfer Destinations | managedApps |
| Pin Required | Yes |

### App configuration

#### Outlook – nur Geschäftskonten

| Property | Value |
| --- | --- |
| Area | App configuration |
| Category | Managed apps |
| Platform | iOS/iPadOS |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 18/06/2026, 11:00 |
| Status | Assigned |
| Object ID | demo-26 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| All users | Included |  |  |  |

**Settings (1)**

| Setting | Value |
| --- | --- |
| com.microsoft.outlook.Mail.FocusedInbox | false |

### Scripts & remediations

#### Set-Regionaleinstellungen.ps1

| Property | Value |
| --- | --- |
| Area | Scripts & remediations |
| Category | PowerShell scripts (Windows) |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 10/04/2025, 11:00 |
| Status | Assigned |
| Object ID | demo-27 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Included |  |  |  |

**Settings (2)**

| Setting | Value |
| --- | --- |
| Run As Account | user |
| File Name | Set-Regionaleinstellungen.ps1 |

**Script content**

```powershell
Set-WinSystemLocale de-DE
Set-Culture de-DE
Set-WinHomeLocation -GeoId 94
```

#### Remediation – Temp bereinigen

| Property | Value |
| --- | --- |
| Area | Scripts & remediations |
| Category | Remediations |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 30/07/2026, 11:00 |
| Status | Assigned |
| Object ID | demo-28 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-Win-Clients | Included |  |  | daily 12:00 |

**Settings (1)**

| Setting | Value |
| --- | --- |
| Run As Account | system |

**Detection script**

```powershell
$size = (Get-ChildItem $env:TEMP -Recurse -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
if ($size -gt 1GB) { exit 1 } else { exit 0 }
```

**Remediation script**

```powershell
Get-ChildItem $env:TEMP -Recurse -ErrorAction SilentlyContinue | Where-Object LastWriteTime -lt (Get-Date).AddDays(-7) | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
```

#### mac – Dock konfigurieren

| Property | Value |
| --- | --- |
| Area | Scripts & remediations |
| Category | Shell scripts (macOS) |
| Platform | macOS |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 01/12/2025, 10:00 |
| Status | Assigned |
| Object ID | demo-29 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-macOS | Included |  |  |  |

**Settings (1)**

| Setting | Value |
| --- | --- |
| Run As Account | user |

**Script content**

```bash
#!/bin/zsh
defaults write com.apple.dock autohide -bool true
killall Dock
```

### Enrollment

#### ADE – Firmengeräte

| Property | Value |
| --- | --- |
| Area | Enrollment |
| Category | Apple ADE enrollment profiles |
| Platform | iOS/iPadOS |
| ADE token | Demo-Kunde ABM |
| Default profile | Yes |
| Last modified | 25/05/2025, 15:32 |
| Status | Tenant-wide / not assignable |
| Object ID | adep-1 |

**Settings (5)**

| Setting | Value |
| --- | --- |
| Requires User Authentication | Yes |
| Supervised Mode Enabled | Yes |
| Is Mandatory | Yes |
| Apple Id Disabled | Yes |
| Terms And Conditions Disabled | Yes |

#### Autopilot – Standard (Entra Join)

| Property | Value |
| --- | --- |
| Area | Enrollment |
| Category | Autopilot profiles |
| Platform | Windows |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 05/05/2025, 11:00 |
| Status | Assigned |
| Object ID | demo-30 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| GRP-Autopilot-Geräte | Included |  |  |  |

**Settings (2)**

| Setting | Value |
| --- | --- |
| Device Name Template | DEMO-%SERIAL% |
| Out Of Box Experience Setting | Privacy Settings Hidden: Yes; Eula Hidden: Yes; User Type: standard |

#### ESP – Standard

| Property | Value |
| --- | --- |
| Area | Enrollment |
| Category | Enrollment Status Page |
| Platform | Windows |
| Priority | Default (0) |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 05/05/2025, 11:00 |
| Status | Assigned |
| Object ID | demo-31 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| All users | Included |  |  |  |

**Settings (2)**

| Setting | Value |
| --- | --- |
| Show Installation Progress | Yes |
| Install Progress Timeout In Minutes | 60 |

#### Windows Hello for Business

| Property | Value |
| --- | --- |
| Area | Enrollment |
| Category | Windows Hello for Business |
| Platform | Windows |
| Priority | Default (0) |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 05/08/2024, 11:00 |
| Status | Assigned |
| Object ID | demo-32 |

**Assignments**

| Target | Mode | Intent | Filter | Note |
| --- | --- | --- | --- | --- |
| All users | Included |  |  |  |

**Settings (2)**

| Setting | Value |
| --- | --- |
| State | enabled |
| Pin Minimum Length | 6 |

### Platform connectors

#### Demo-Kunde ABM

| Property | Value |
| --- | --- |
| Area | Platform connectors |
| Category | Apple Automated Device Enrollment (ADE token) |
| Platform | iOS/iPadOS, macOS |
| Status | Tenant-wide / not assignable |
| Object ID | ade-1 |

**Settings (7)**

| Setting | Value |
| --- | --- |
| Apple ID | abm-admin@demokunde.de |
| Type | Apple Business Manager |
| Token valid until | 07/05/2027 15:32 |
| Last successful sync | 07/10/2026 08:20 |
| Synced devices | 12 |
| Last sync error code | none |
| Data sharing with Apple consented | Yes |

#### Apple MDM push certificate

| Property | Value |
| --- | --- |
| Area | Platform connectors |
| Category | Apple MDM push certificate (APNs) |
| Platform | iOS/iPadOS, macOS |
| Last modified | 28/10/2025, 14:32 |
| Status | Tenant-wide / not assignable |
| Object ID | apns |

**Settings (5)**

| Setting | Value |
| --- | --- |
| Apple ID (renewal must use the same one!) | it-apple@demokunde.de |
| Valid until | 28/10/2026 14:32 |
| Topic ID | com.apple.mgmt.External.4f2c… |
| Serial number | 6A1F…C2 |
| Upload status | Erfolgreich |

#### Demo-Kunde Apps

| Property | Value |
| --- | --- |
| Area | Platform connectors |
| Category | Apple VPP token (apps & books) |
| Platform | iOS/iPadOS, macOS |
| Status | Tenant-wide / not assignable |
| Object ID | vpp-1 |

**Settings (9)**

| Setting | Value |
| --- | --- |
| Organization | Demo-Kunde GmbH |
| Apple ID | abm-admin@demokunde.de |
| Location | Hauptsitz |
| Status | Valid |
| Valid until | 24/11/2026 14:32 |
| Last sync | 07/10/2026 03:32 |
| Sync status | completed |
| Update apps automatically | Yes |
| Country/region | de |

#### Managed Google Play

| Property | Value |
| --- | --- |
| Area | Platform connectors |
| Category | Managed Google Play (Android Enterprise) |
| Platform | Android |
| Status | Tenant-wide / not assignable |
| Object ID | mgp |

**Settings (7)**

| Setting | Value |
| --- | --- |
| Binding status | Bound and validated |
| Linked Google account (owner) | android-admin@demokunde.de |
| Organization | Demo-Kunde GmbH |
| Last app sync | 07/10/2026 10:44 |
| Sync status | success |
| Work profile enrollment allowed for | All |
| Fully managed devices allowed | Yes |

#### Microsoft Defender for Endpoint

| Property | Value |
| --- | --- |
| Area | Platform connectors |
| Category | Mobile Threat Defense / Defender connector |
| Platform | Android, iOS, Windows |
| Status | Tenant-wide / not assignable |
| Object ID | fc780465-2017-40d4-a0c5-307022471b92 |

**Settings (7)**

| Setting | Value |
| --- | --- |
| Status | Enabled |
| Last heartbeat | 07/10/2026 15:03 |
| Connect Android devices | Yes |
| Connect iOS devices | Yes |
| Connect Windows devices | Yes |
| Connect macOS devices | No |
| Block unsupported devices | No |

### Tenant & administration

#### iOS – Supervised

| Property | Value |
| --- | --- |
| Area | Tenant & administration |
| Category | Assignment filters |
| Platform | iOS/iPadOS |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 01/03/2025, 10:00 |
| Status | Tenant-wide / not assignable |
| Object ID | f1 |

**Settings (1)**

| Setting | Value |
| --- | --- |
| Rule | (device.deviceOwnership -eq "Corporate") and (device.enrollmentProfileName -startsWith "ADE") |

#### Helpdesk Level 1 (benutzerdefiniert)

| Property | Value |
| --- | --- |
| Area | Tenant & administration |
| Category | Intune roles |
| Type | Custom role |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Last modified | 01/03/2025, 10:00 |
| Status | Tenant-wide / not assignable |
| Object ID | demo-34 |

**Settings (2)**

| Setting | Value |
| --- | --- |
| Permissions (6) | ManagedDevices Read, ManagedDevices RemoteLock, ManagedDevices Sync, ManagedApps Read, DeviceConfigurations Read, Audit Read |
| Assignment “Helpdesk” | Members: GRP-IT-Admins · Scope: All devices |

#### Tenant compliance settings

| Property | Value |
| --- | --- |
| Area | Tenant & administration |
| Category | Tenant settings |
| Scope tags | Default |
| Created | 01/02/2024, 10:00 |
| Status | Tenant-wide / not assignable |
| Object ID | demo-35 |

**Settings (2)**

| Setting | Value |
| --- | --- |
| Secure By Default | Yes |
| Device Compliance Checkin Threshold Days | 30 |

## Assignments by group

### All devices

| Object | Area / category | Mode | Intent | Filter |
| --- | --- | --- | --- | --- |
| Security Baseline 2024 | Security Baselines / Security Baseline for Windows 10 and later | Included |  |  |
| WIN – Compliance Standard | Compliance / Compliance policy | Included |  |  |
| WU – Ring 2 Breit | Windows Updates / Update ring (Windows) | Included |  |  |
| 7-Zip 24.08 | Apps / Win32 app | Included | Required |  |

### All users

| Object | Area / category | Mode | Intent | Filter |
| --- | --- | --- | --- | --- |
| Company Portal | Apps / Microsoft Store (WinGet) | Included | Available |  |
| iOS – App-Schutz Outlook/Teams | App protection / App protection iOS/iPadOS | Included |  |  |
| Outlook – nur Geschäftskonten | App configuration / Managed apps | Included |  |  |
| ESP – Standard | Enrollment / Enrollment Status Page | Included |  |  |
| Windows Hello for Business | Enrollment / Windows Hello for Business | Included |  |  |

### GRP-Win-Clients

| Object | Area / category | Mode | Intent | Filter |
| --- | --- | --- | --- | --- |
| WIN – BitLocker Basis | Endpoint Security / Disk encryption | Included |  |  |
| WIN – Firewall Domäne/Privat/Öffentlich | Endpoint Security / Firewall | Included |  |  |
| Edge Settings (alt) | Configuration / Settings Catalog | Included |  |  |
| WIN – OneDrive Known Folder Move | Configuration / Settings Catalog | Included |  |  |
| ADMX – Office Grundeinstellungen | Configuration / Administrative templates | Included |  |  |
| WIN – Custom OMA-URI Sperrbildschirm | Configuration / Custom (OMA-URI / profile) | Included |  |  |
| WLAN – Firmennetz | Configuration / Wi-Fi | Included |  |  |
| Feature-Update Windows 11 24H2 | Windows Updates / Feature updates | Included |  |  |
| Treiber – automatische Freigabe | Windows Updates / Driver updates | Included |  |  |
| Microsoft 365 Apps for Enterprise | Apps / Microsoft 365 Apps | Included | Required |  |
| Set-Regionaleinstellungen.ps1 | Scripts & remediations / PowerShell scripts (Windows) | Included |  |  |
| Remediation – Temp bereinigen | Scripts & remediations / Remediations | Included |  |  |

### GRP-iOS-Firmengeräte

| Object | Area / category | Mode | Intent | Filter |
| --- | --- | --- | --- | --- |
| iOS – Geräteeinschränkungen | Configuration / Device restrictions | Included |  | Include: iOS – Supervised |
| iOS – Compliance | Compliance / Compliance policy | Included |  |  |
| Microsoft Outlook (iOS) | Apps / Volume-purchased app (VPP) | Included | Required |  |

### GRP-Kiosk

| Object | Area / category | Mode | Intent | Filter |
| --- | --- | --- | --- | --- |
| WIN – BitLocker Basis | Endpoint Security / Disk encryption | Excluded |  |  |
| WU – Ring 2 Breit | Windows Updates / Update ring (Windows) | Excluded |  |  |
| 7-Zip 24.08 | Apps / Win32 app | Excluded |  |  |

### GRP-Vertrieb

| Object | Area / category | Mode | Intent | Filter |
| --- | --- | --- | --- | --- |
| AV – Vertrieb | Endpoint Security / Antivirus | Included |  |  |
| Edge – Startseite & Erweiterungen | Configuration / Settings Catalog | Included |  |  |
| Altes VPN-Tool 3.1 | Apps / Win32 app | Included | Uninstall |  |

### GRP-IT-Admins

| Object | Area / category | Mode | Intent | Filter |
| --- | --- | --- | --- | --- |
| WU – Ring IT | Windows Updates / Update ring (Windows) | Included |  |  |
| iOS – App-Schutz Outlook/Teams | App protection / App protection iOS/iPadOS | Excluded |  |  |

### (deleted group g-old-12…)

| Object | Area / category | Mode | Intent | Filter |
| --- | --- | --- | --- | --- |
| WIN – OneDrive Known Folder Move | Configuration / Settings Catalog | Included |  |  |

### GRP-Autopilot-Geräte (dynamic)

| Object | Area / category | Mode | Intent | Filter |
| --- | --- | --- | --- | --- |
| Autopilot – Standard (Entra Join) | Enrollment / Autopilot profiles | Included |  |  |

### GRP-macOS

| Object | Area / category | Mode | Intent | Filter |
| --- | --- | --- | --- | --- |
| mac – Dock konfigurieren | Scripts & remediations / Shell scripts (macOS) | Included |  |  |

## Conflicts & duplicates

### Conflict (High): Cloud Block Level

| Policy | Value | Assignment |
| --- | --- | --- |
| Security Baseline 2024 | High | All devices |
| AV – Vertrieb | Default | GRP-Vertrieb |

### Conflict (High): Quality Updates Deferral Period In Days

| Policy | Value | Assignment |
| --- | --- | --- |
| WU – Ring 2 Breit | 7 | All devices |
| WU – Ring IT | 0 | GRP-IT-Admins |

### Conflict (High): Select the encryption method for operating system drives

| Policy | Value | Assignment |
| --- | --- | --- |
| WIN – BitLocker Basis | XTS-AES 256-bit | GRP-Win-Clients |
| Security Baseline 2024 | XTS-AES 128-bit | All devices |

### Duplicate (Low): Allow Realtime Monitoring

| Policy | Value | Assignment |
| --- | --- | --- |
| Security Baseline 2024 | Allowed | All devices |
| AV – Vertrieb | Allowed | GRP-Vertrieb |

### Duplicate (Low): Configure the home page URL

| Policy | Value | Assignment |
| --- | --- | --- |
| Edge – Startseite & Erweiterungen | https://intranet.demokunde.de | GRP-Vertrieb |
| Edge Settings (alt) | https://intranet.demokunde.de | GRP-Win-Clients |

## Unassigned objects

| Name | Area | Category | Modified |
| --- | --- | --- | --- |
| Test_Policy_Kopie (2) | Configuration | Settings Catalog | 11/11/2024 |
| WU – Ring 1 Pilot | Windows Updates | Update ring (Windows) | 09/01/2025 |

## Device inventory

### Devices per platform

| Platform | Devices | Noncompliant | No check-in > 30 days | Unencrypted | Personal |
| --- | --- | --- | --- | --- | --- |
| Windows | 18 | 2 | 1 | 2 | 0 |
| iOS/iPadOS | 9 | 1 | 1 | — | 1 |
| Android | 7 | 1 | 0 | — | 1 |
| macOS | 3 | 0 | 0 | 1 | 0 |
| Total | 37 | 4 | 2 | 3 | 2 |

### Compliance

| Status | Devices |
| --- | --- |
| Compliant | 32 |
| Noncompliant | 4 |
| In grace period | 1 |

### Enrollment type

| Type | Devices |
| --- | --- |
| Entra join | 12 |
| Apple ADE with user | 11 |
| Co-management | 4 |
| Android Enterprise – fully managed | 4 |
| Automatic enrollment | 2 |
| Android Enterprise – dedicated | 2 |
| Apple user enrollment | 1 |
| User enrollment | 1 |

### Windows: join type

| Join type | Devices |
| --- | --- |
| Entra join | 12 |
| Hybrid Entra join | 6 |

### Operating system versions

| Platform | Version | Devices |
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

### Most common models

| Manufacturer / model | Devices |
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

| Group Tag | Devices |
| --- | --- |
| Standard | 10 |
| Vertrieb | 3 |
| (no group tag) | 1 |

## Changes since demo snapshot of 15/09/2026

| Kind | Object | Area | Details |
| --- | --- | --- | --- |
| Changed | WIN – BitLocker Basis | Endpoint Security | Select the encryption method for operating system drives: XTS-AES 128-bit → XTS-AES 256-bit |
| Assignment | WU – Ring 1 Pilot | Windows Updates | − Assignment GRP-Update-Pilot |
| New | AV – Vertrieb | Endpoint Security | 2 settings, 1 assignments |
| New | Remediation – Temp bereinigen | Scripts & remediations | 1 settings, 1 assignments |
| Removed | Teams Classic | Apps |  |

## Scan notes

| Source | Note |
| --- | --- |
| Demo | Sample data – not a real tenant. |


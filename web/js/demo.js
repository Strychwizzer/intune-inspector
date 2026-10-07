// Beispieldaten für den Demo-Modus (fiktiver Mandant). Gleiches Format wie ein echter Scan.
import { normalizeDevice, normalizeAutopilot, apnsObject, adeObject, adeProfileObject, vppObject, mgpObject, mtdObject } from './devices.js';

const DAYMS = 86400000;
const ago = (d) => new Date(Date.now() - d * DAYMS).toISOString();
const ahead = (d) => new Date(Date.now() + d * DAYMS).toISOString();
const FIRST = ['Anna', 'Ben', 'Clara', 'David', 'Eva', 'Felix', 'Greta', 'Hannes', 'Ida', 'Jonas', 'Kira', 'Lukas', 'Mia', 'Noah', 'Olivia', 'Paul', 'Rosa', 'Simon'];
const LAST = ['Becker', 'Schulz', 'Wagner', 'Hoffmann', 'Koch', 'Richter', 'Klein', 'Wolf', 'Neumann', 'Braun'];

function demoDevices() {
  const out = [];
  let i = 0;
  const user = () => { const f = FIRST[i % FIRST.length], l = LAST[(i * 7) % LAST.length]; return { upn: (f + '.' + l).toLowerCase() + '@demokunde.de', name: f + ' ' + l }; };
  const push = (raw) => { i++; out.push(normalizeDevice(Object.assign({ id: 'dev-' + i, managementAgent: 'mdm', managementState: 'managed' }, raw))); };
  const winVers = ['10.0.26100.6584', '10.0.26100.6584', '10.0.26100.6584', '10.0.26100.4946', '10.0.22631.5909', '10.0.19045.6332'];
  for (let k = 0; k < 18; k++) {
    const u = user();
    push({ deviceName: 'DEMO-' + String(4711 + k * 13).padStart(5, '0'), operatingSystem: 'Windows', osVersion: winVers[k % winVers.length], model: k % 3 ? 'Latitude 7450' : 'Surface Laptop 6', manufacturer: k % 3 ? 'Dell Inc.' : 'Microsoft Corporation',
      serialNumber: 'SN' + (830000 + k * 37), userPrincipalName: u.upn, userDisplayName: u.name, managedDeviceOwnerType: 'company', complianceState: k === 4 || k === 11 ? 'noncompliant' : k === 7 ? 'inGracePeriod' : 'compliant',
      deviceEnrollmentType: k < 12 ? 'windowsAzureADJoin' : k < 16 ? 'windowsCoManagement' : 'windowsAutoEnrollment', joinType: k < 12 ? 'azureADJoined' : 'hybridAzureADJoined', autopilotEnrolled: k < 12,
      managementAgent: k >= 12 && k < 16 ? 'configurationManagerClientMdm' : 'mdm', enrolledDateTime: ago(400 - k * 17), lastSyncDateTime: k === 15 ? ago(46) : ago(k % 4),
      isEncrypted: k !== 11 && k !== 16, totalStorageSpaceInBytes: 512 * 1073741824, freeStorageSpaceInBytes: (120 + k * 9) * 1073741824, skuFamily: 'Enterprise', chassisType: 'laptop' });
  }
  for (let k = 0; k < 9; k++) {
    const u = user();
    push({ deviceName: (k % 3 === 2 ? 'iPad' : 'iPhone') + ' von ' + u.name.split(' ')[0], operatingSystem: k % 3 === 2 ? 'iPadOS' : 'iOS', osVersion: ['26.0.1', '18.6.2', '26.0.1', '18.6.2', '17.7.10'][k % 5], model: k % 3 === 2 ? 'iPad Air (M2)' : ['iPhone 15', 'iPhone 16', 'iPhone 14'][k % 3], manufacturer: 'Apple',
      serialNumber: 'F' + (17000 + k * 91), userPrincipalName: u.upn, userDisplayName: u.name, managedDeviceOwnerType: k === 8 ? 'personal' : 'company', complianceState: k === 6 ? 'noncompliant' : 'compliant',
      deviceEnrollmentType: k === 8 ? 'appleUserEnrollment' : 'appleBulkWithUser', isSupervised: k !== 8, enrolledDateTime: ago(300 - k * 20), lastSyncDateTime: k === 5 ? ago(63) : ago(1), enrollmentProfileName: k === 8 ? '' : 'ADE – Firmengeräte', isEncrypted: true });
  }
  for (let k = 0; k < 7; k++) {
    const u = user();
    push({ deviceName: 'Android_' + ['Pixel', 'Galaxy', 'Galaxy', 'Pixel', 'Galaxy', 'TC52', 'TC52'][k] + '_' + (k + 1), operatingSystem: 'Android', osVersion: ['16', '15', '15', '16', '14', '13', '13'][k], model: ['Pixel 9', 'Galaxy S24', 'Galaxy A55', 'Pixel 8a', 'Galaxy S23', 'TC52', 'TC52'][k], manufacturer: k >= 5 ? 'Zebra Technologies' : k % 3 === 0 ? 'Google' : 'samsung',
      serialNumber: 'R5C' + (9000 + k * 17), userPrincipalName: k >= 5 ? '' : u.upn, userDisplayName: k >= 5 ? '' : u.name, managedDeviceOwnerType: k === 4 ? 'personal' : 'company', complianceState: k === 2 ? 'noncompliant' : 'compliant',
      deviceEnrollmentType: k >= 5 ? 'androidEnterpriseDedicatedDevice' : k === 4 ? 'userEnrollment' : 'androidEnterpriseFullyManaged', jailBroken: k === 4 ? 'True' : 'False', enrolledDateTime: ago(200 - k * 11), lastSyncDateTime: ago(k), androidSecurityPatchLevel: ['2026-09-01', '2026-08-01', '2026-03-01', '2026-09-01', '2025-11-01', '2025-06-01', '2025-06-01'][k], isEncrypted: true });
  }
  for (let k = 0; k < 3; k++) {
    const u = user();
    push({ deviceName: 'MacBook von ' + u.name.split(' ')[0], operatingSystem: 'macOS', osVersion: ['26.0.1', '15.6.1', '15.6.1'][k], model: 'MacBook Pro (14-inch, M4)', manufacturer: 'Apple', serialNumber: 'C02' + (5000 + k), userPrincipalName: u.upn, userDisplayName: u.name,
      managedDeviceOwnerType: 'company', complianceState: 'compliant', deviceEnrollmentType: 'appleBulkWithUser', enrolledDateTime: ago(150), lastSyncDateTime: ago(2), isEncrypted: k !== 2 });
  }
  return out;
}

function demoAutopilot(devices) {
  const win = devices.filter((d) => d.platform === 'Windows' && d.autopilot);
  const out = win.map((d, k) => normalizeAutopilot({ id: 'ap-' + k, serialNumber: d.serial, model: d.model, manufacturer: d.manufacturer, groupTag: k % 4 === 0 ? 'Vertrieb' : 'Standard', enrollmentState: 'enrolled', deploymentProfileAssignmentStatus: 'assignedInSync', lastContactedDateTime: d.lastSync, managedDeviceId: d.id, displayName: d.name }));
  out.push(normalizeAutopilot({ id: 'ap-new1', serialNumber: 'SN999101', model: 'Latitude 7450', manufacturer: 'Dell Inc.', groupTag: 'Standard', enrollmentState: 'notContacted', deploymentProfileAssignmentStatus: 'assignedInSync' }));
  out.push(normalizeAutopilot({ id: 'ap-new2', serialNumber: 'SN999102', model: 'Latitude 7450', manufacturer: 'Dell Inc.', groupTag: '', enrollmentState: 'notContacted', deploymentProfileAssignmentStatus: 'notAssigned' }));
  return out;
}

function demoConnectors() {
  const ade = { id: 'ade-1', tokenName: 'Demo-Kunde ABM', appleIdentifier: 'abm-admin@demokunde.de', tokenType: 'dep', tokenExpirationDateTime: ahead(212), lastSuccessfulSyncDateTime: ago(0.3), syncedDeviceCount: 12, lastSyncErrorCode: 0, dataSharingConsentGranted: true };
  return [
    apnsObject({ appleIdentifier: 'it-apple@demokunde.de', expirationDateTime: ahead(21), topicIdentifier: 'com.apple.mgmt.External.4f2c…', certificateSerialNumber: '6A1F…C2', certificateUploadStatus: 'Erfolgreich', lastModifiedDateTime: ago(344) }),
    adeObject(ade),
    adeProfileObject({ '@odata.type': '#microsoft.graph.depIOSEnrollmentProfile', id: 'adep-1', displayName: 'ADE – Firmengeräte', isDefault: true, requiresUserAuthentication: true, supervisedModeEnabled: true, isMandatory: true, locationServicesDisabled: false, appleIdDisabled: true, termsAndConditionsDisabled: true, enableAuthenticationViaCompanyPortal: false, lastModifiedDateTime: ago(500) }, ade.tokenName),
    vppObject({ id: 'vpp-1', displayName: 'Demo-Kunde Apps', organizationName: 'Demo-Kunde GmbH', appleId: 'abm-admin@demokunde.de', locationName: 'Hauptsitz', state: 'valid', expirationDateTime: ahead(48), lastSyncDateTime: ago(0.5), lastSyncStatus: 'completed', automaticallyUpdateApps: true, countryOrRegion: 'de' }),
    mgpObject({ bindStatus: 'boundAndValidated', ownerUserPrincipalName: 'android-admin@demokunde.de', ownerOrganizationName: 'Demo-Kunde GmbH', lastAppSyncDateTime: ago(0.2), lastAppSyncStatus: 'success', enrollmentTarget: 'all', androidDeviceOwnerFullyManagedEnrollmentEnabled: true }),
    mtdObject({ id: 'fc780465-2017-40d4-a0c5-307022471b92', partnerState: 'enabled', lastHeartbeatDateTime: ago(0.02), androidEnabled: true, iosEnabled: true, windowsEnabled: true, macEnabled: false })
  ];
}

const G = {
  win: { groupId: 'g-win', label: 'GRP-Win-Clients' },
  sales: { groupId: 'g-sales', label: 'GRP-Vertrieb' },
  kiosk: { groupId: 'g-kiosk', label: 'GRP-Kiosk' },
  ios: { groupId: 'g-ios', label: 'GRP-iOS-Firmengeräte' },
  pilot: { groupId: 'g-pilot', label: 'GRP-Update-Pilot' },
  it: { groupId: 'g-it', label: 'GRP-IT-Admins' },
  mac: { groupId: 'g-mac', label: 'GRP-macOS' },
  old: { groupId: 'g-old-1234', label: '(gelöschte Gruppe g-old-12…)', deletedGroup: true }
};
const inc = (g, extra) => Object.assign({ mode: 'include', target: 'group', filterId: null, filterMode: null, intent: null, extra: '' }, g, extra || {});
const exc = (g) => Object.assign({ mode: 'exclude', target: 'group', filterId: null, filterMode: null, intent: null, extra: '' }, g);
const allDev = (extra) => Object.assign({ mode: 'include', target: 'allDevices', label: 'Alle Geräte', groupId: null, filterId: null, filterMode: null, intent: null, extra: '' }, extra || {});
const allUsr = (extra) => Object.assign({ mode: 'include', target: 'allUsers', label: 'Alle Benutzer', groupId: null, filterId: null, filterMode: null, intent: null, extra: '' }, extra || {});
const S = (key, label, value, extra) => Object.assign({ key, label, value }, extra || {});

let n = 0;
function obj(sourceKey, area, category, name, platform, modified, assignments, settings, extra) {
  n++;
  return Object.assign({
    uid: sourceKey + ':demo-' + n, id: 'demo-' + n, sourceKey, area, category, name, description: '', platform,
    odataType: '', created: '2024-02-01T09:00:00Z', modified, scopeTags: ['Default'], assignable: true,
    assignments, settings, code: [], meta: [], raw: null
  }, extra || {});
}

export function demoSnapshot() {
  n = 0;
  const objects = [
    obj('catalog', 'Endpoint Security', 'Datenträgerverschlüsselung', 'WIN – BitLocker Basis', 'Windows', '2026-09-29T10:12:00Z',
      [inc(G.win), exc(G.kiosk)],
      [S('device_vendor_msft_bitlocker_requiredeviceencryption', 'Require Device Encryption', 'Enabled'),
        S('device_vendor_msft_bitlocker_encryptionmethodbydrivetype_osencryptiontypedropdown_name', 'Select the encryption method for operating system drives', 'XTS-AES 256-bit'),
        S('device_vendor_msft_bitlocker_systemdrivesrecoveryoptions_osactivedirectorybackup_name', 'Save BitLocker recovery information to Azure Active Directory', 'Enabled'),
        S('device_vendor_msft_bitlocker_allowwarningforotherdiskencryption', 'Allow Warning For Other Disk Encryption', 'Block')],
      { description: 'Standard-Verschlüsselung für alle Windows-Clients', meta: [['Vorlage', 'BitLocker']] }),
    obj('catalog', 'Security Baselines', 'Security Baseline for Windows 10 and later', 'Security Baseline 2024', 'Windows', '2025-03-14T08:00:00Z',
      [allDev()],
      [S('device_vendor_msft_bitlocker_encryptionmethodbydrivetype_osencryptiontypedropdown_name', 'Select the encryption method for operating system drives', 'XTS-AES 128-bit'),
        S('device_vendor_msft_policy_config_defender_allowrealtimemonitoring', 'Allow Realtime Monitoring', 'Allowed'),
        S('device_vendor_msft_policy_config_defender_cloudblocklevel', 'Cloud Block Level', 'High'),
        S('device_vendor_msft_policy_config_lanmanworkstation_enableinsecureguestlogons', 'Enable insecure guest logons', 'Disabled')],
      { meta: [['Vorlage', 'Security Baseline for Windows 10 and later (Version 24H2)']] }),
    obj('catalog', 'Endpoint Security', 'Antivirus', 'AV – Vertrieb', 'Windows', '2026-08-02T13:20:00Z',
      [inc(G.sales)],
      [S('device_vendor_msft_policy_config_defender_cloudblocklevel', 'Cloud Block Level', 'Default'),
        S('device_vendor_msft_policy_config_defender_allowrealtimemonitoring', 'Allow Realtime Monitoring', 'Allowed')]),
    obj('catalog', 'Endpoint Security', 'Firewall', 'WIN – Firewall Domäne/Privat/Öffentlich', 'Windows', '2026-05-11T09:00:00Z',
      [inc(G.win)],
      [S('vendor_msft_firewall_mdmstore_domainprofile_enablefirewall', 'Domain profile: Enable Firewall', 'True'),
        S('vendor_msft_firewall_mdmstore_publicprofile_enablefirewall', 'Public profile: Enable Firewall', 'True'),
        S('vendor_msft_firewall_mdmstore_publicprofile_defaultinboundaction', 'Public profile: Default Inbound Action', 'Block')]),
    obj('catalog', 'Konfiguration', 'Settings Catalog', 'Edge – Startseite & Erweiterungen', 'Windows', '2026-08-21T07:45:00Z',
      [inc(G.sales)],
      [S('device_vendor_msft_policy_config_microsoft_edgev80diff~policy~microsoft_edge~startup_homepagelocation', 'Configure the home page URL', 'https://intranet.demokunde.de'),
        S('device_vendor_msft_policy_config_microsoft_edge~policy~microsoft_edge~extensions_extensioninstallblocklist', 'Control which extensions cannot be installed', '*')]),
    obj('catalog', 'Konfiguration', 'Settings Catalog', 'Edge Settings (alt)', 'Windows', '2024-10-02T07:45:00Z',
      [inc(G.win)],
      [S('device_vendor_msft_policy_config_microsoft_edgev80diff~policy~microsoft_edge~startup_homepagelocation', 'Configure the home page URL', 'https://intranet.demokunde.de')]),
    obj('catalog', 'Konfiguration', 'Settings Catalog', 'Test_Policy_Kopie (2)', 'Windows', '2024-11-11T16:00:00Z', [],
      [S('device_vendor_msft_policy_config_camera_allowcamera', 'Allow Camera', 'Block')]),
    obj('catalog', 'Konfiguration', 'Settings Catalog', 'WIN – OneDrive Known Folder Move', 'Windows', '2026-04-03T11:10:00Z',
      [inc(G.win), inc(G.old)],
      [S('device_vendor_msft_policy_config_onedrivengscv2~policy~onedrivengsc_kfmsilentoptin', 'Silently move Windows known folders to OneDrive', 'Enabled'),
        S('device_vendor_msft_policy_config_onedrivengscv2~policy~onedrivengsc_kfmsilentoptin_kfmsilentoptin_textbox', 'Tenant ID', '[TENANT-ID]', { depth: 1 })]),
    obj('admx', 'Konfiguration', 'Administrative Vorlagen', 'ADMX – Office Grundeinstellungen', 'Windows', '2025-06-17T12:00:00Z',
      [inc(G.win)],
      [S('admx:office-macro', 'Block macros from running in Office files from the Internet', 'Enabled', { path: 'Benutzer › Microsoft Word 2016 › Word Options › Security' }),
        S('admx:office-firstrun', 'Disable the Office First Run on application boot', 'Enabled', { path: 'Benutzer › Microsoft Office 2016 › First Run' })]),
    obj('deviceconfig', 'Konfiguration', 'Benutzerdefiniert (OMA-URI / Profil)', 'WIN – Custom OMA-URI Sperrbildschirm', 'Windows', '2025-01-20T10:00:00Z',
      [inc(G.win)],
      [S('oma:./Device/Vendor/MSFT/Policy/Config/DeviceLock/PreventLockScreenSlideShow', 'Lock screen slide show — ./Device/Vendor/MSFT/Policy/Config/DeviceLock/PreventLockScreenSlideShow', '1')]),
    obj('deviceconfig', 'Konfiguration', 'WLAN', 'WLAN – Firmennetz', 'Windows', '2025-09-10T10:00:00Z',
      [inc(G.win)],
      [S('wifi.ssid', 'Ssid', 'DEMO-CORP'), S('wifi.wifiSecurityType', 'Wifi Security Type', 'wpa2Enterprise'), S('wifi.preSharedKey', 'Pre Shared Key', '(ausgeblendet)')]),
    obj('deviceconfig', 'Konfiguration', 'Geräteeinschränkungen', 'iOS – Geräteeinschränkungen', 'iOS/iPadOS', '2026-05-04T09:00:00Z',
      [inc(G.ios, { filterId: 'f1', filterMode: 'include', filterName: 'iOS – Supervised' })],
      [S('ios.appStoreBlocked', 'App Store Blocked', 'Ja'), S('ios.passcodeRequired', 'Passcode Required', 'Ja'), S('ios.passcodeMinimumLength', 'Passcode Minimum Length', '6')]),
    obj('compliance', 'Compliance', 'Compliance-Richtlinie', 'WIN – Compliance Standard', 'Windows', '2026-09-02T09:00:00Z',
      [allDev()],
      [S('c.bitLockerEnabled', 'Bit Locker Enabled', 'Ja'), S('c.osMinimumVersion', 'Os Minimum Version', '10.0.22631'), S('c.firewallEnabled', 'Firewall Enabled', 'Ja'),
        S('action:block', 'Aktion bei Nichtkonformität', 'Block nach 3 Tag(en)')]),
    obj('compliance', 'Compliance', 'Compliance-Richtlinie', 'iOS – Compliance', 'iOS/iPadOS', '2026-02-12T09:00:00Z',
      [inc(G.ios)],
      [S('ci.osMinimumVersion', 'Os Minimum Version', '17.0'), S('ci.securityBlockJailbrokenDevices', 'Security Block Jailbroken Devices', 'Ja')]),
    obj('deviceconfig', 'Windows Updates', 'Update-Ring (Windows)', 'WU – Ring 1 Pilot', 'Windows', '2025-01-09T09:00:00Z', [],
      [S('windowsUpdateForBusinessConfiguration.qualityUpdatesDeferralPeriodInDays', 'Quality Updates Deferral Period In Days', '0'),
        S('windowsUpdateForBusinessConfiguration.featureUpdatesDeferralPeriodInDays', 'Feature Updates Deferral Period In Days', '0')]),
    obj('deviceconfig', 'Windows Updates', 'Update-Ring (Windows)', 'WU – Ring 2 Breit', 'Windows', '2025-01-09T09:00:00Z',
      [allDev(), exc(G.kiosk)],
      [S('windowsUpdateForBusinessConfiguration.qualityUpdatesDeferralPeriodInDays', 'Quality Updates Deferral Period In Days', '7'),
        S('windowsUpdateForBusinessConfiguration.featureUpdatesDeferralPeriodInDays', 'Feature Updates Deferral Period In Days', '30'),
        S('windowsUpdateForBusinessConfiguration.deadlineForQualityUpdatesInDays', 'Deadline For Quality Updates In Days', '2')]),
    obj('deviceconfig', 'Windows Updates', 'Update-Ring (Windows)', 'WU – Ring IT', 'Windows', '2026-03-09T09:00:00Z',
      [inc(G.it)],
      [S('windowsUpdateForBusinessConfiguration.qualityUpdatesDeferralPeriodInDays', 'Quality Updates Deferral Period In Days', '0')]),
    obj('featureupdate', 'Windows Updates', 'Feature-Updates', 'Feature-Update Windows 11 24H2', 'Windows', '2026-01-15T09:00:00Z',
      [inc(G.win)], [S('featureUpdateVersion', 'Feature Update Version', 'Windows 11, version 24H2')]),
    obj('driverupdate', 'Windows Updates', 'Treiber-Updates', 'Treiber – automatische Freigabe', 'Windows', '2026-04-15T09:00:00Z',
      [inc(G.win)], [S('approvalType', 'Approval Type', 'automatic'), S('deploymentDeferralInDays', 'Deployment Deferral In Days', '7')]),
    obj('apps', 'Apps', 'Microsoft 365 Apps', 'Microsoft 365 Apps for Enterprise', 'Windows', '2026-02-02T09:00:00Z',
      [inc(G.win, { intent: 'Erforderlich' })],
      [S('app.updateChannel', 'Update Channel', 'monthlyEnterprise'), S('excludedApps', 'Ausgeschlossene Office-Apps', 'Groove, Lync')], { meta: [['Herausgeber', 'Microsoft']] }),
    obj('apps', 'Apps', 'Win32-App', '7-Zip 24.08', 'Windows', '2026-07-22T09:00:00Z',
      [allDev({ intent: 'Erforderlich', extra: 'Benachrichtigungen: hideAll' }), exc(G.kiosk)],
      [S('installExperience', 'Installationsverhalten', 'Run As Account: system; Device Restart Behavior: suppress'),
        S('app.installCommandLine', 'Install Command Line', 'msiexec /i "7z2408-x64.msi" /qn'),
        S('rule:Erkennung:MSI', 'Erkennungsregel', 'Product Code: {23170F69-40C1-2702-2408-000001000000}')], { meta: [['Herausgeber', 'Igor Pavlov'], ['Version', '24.08']] }),
    obj('apps', 'Apps', 'Microsoft Store (WinGet)', 'Company Portal', 'Windows', '2025-11-05T09:00:00Z',
      [allUsr({ intent: 'Verfügbar' })], [S('app.packageIdentifier', 'Package Identifier', '9WZDNCRFJ3PZ')]),
    obj('apps', 'Apps', 'Volumenlizenz-App (VPP)', 'Microsoft Outlook (iOS)', 'iOS/iPadOS', '2026-03-01T09:00:00Z',
      [inc(G.ios, { intent: 'Erforderlich' })], [S('app.bundleId', 'Bundle Id', 'com.microsoft.Office.Outlook')]),
    obj('apps', 'Apps', 'Win32-App', 'Altes VPN-Tool 3.1', 'Windows', '2023-09-01T09:00:00Z',
      [inc(G.sales, { intent: 'Deinstallieren' })], [S('app.installCommandLine', 'Install Command Line', 'setup.exe /S')]),
    obj('mam-ios', 'App-Schutz', 'App-Schutz iOS/iPadOS', 'iOS – App-Schutz Outlook/Teams', 'iOS/iPadOS', '2026-06-18T09:00:00Z',
      [allUsr(), exc(G.it)],
      [S('apps', 'Geschützte Apps', 'com.microsoft.Office.Outlook, com.microsoft.skype.teams'),
        S('mam.allowedOutboundDataTransferDestinations', 'Allowed Outbound Data Transfer Destinations', 'managedApps'),
        S('mam.pinRequired', 'Pin Required', 'Ja')]),
    obj('appconfig-app', 'App-Konfiguration', 'Verwaltete Apps', 'Outlook – nur Geschäftskonten', 'iOS/iPadOS', '2026-06-18T09:00:00Z',
      [allUsr()], [S('cfg:com.microsoft.outlook.Mail.FocusedInbox', 'com.microsoft.outlook.Mail.FocusedInbox', 'false')]),
    obj('ps', 'Skripte & Remediations', 'PowerShell-Skripte (Windows)', 'Set-Regionaleinstellungen.ps1', 'Windows', '2025-04-10T09:00:00Z',
      [inc(G.win)], [S('ps.runAsAccount', 'Run As Account', 'user'), S('ps.fileName', 'File Name', 'Set-Regionaleinstellungen.ps1')],
      { code: [{ title: 'Skriptinhalt', lang: 'powershell', content: 'Set-WinSystemLocale de-DE\nSet-Culture de-DE\nSet-WinHomeLocation -GeoId 94' }] }),
    obj('remediation', 'Skripte & Remediations', 'Remediations', 'Remediation – Temp bereinigen', 'Windows', '2026-07-30T09:00:00Z',
      [inc(G.win, { extra: 'täglich 12:00' })], [S('remediation.runAsAccount', 'Run As Account', 'system')],
      { code: [{ title: 'Erkennungsskript', lang: 'powershell', content: '$size = (Get-ChildItem $env:TEMP -Recurse -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum\nif ($size -gt 1GB) { exit 1 } else { exit 0 }' },
        { title: 'Korrekturskript', lang: 'powershell', content: 'Get-ChildItem $env:TEMP -Recurse -ErrorAction SilentlyContinue | Where-Object LastWriteTime -lt (Get-Date).AddDays(-7) | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue' }] }),
    obj('sh', 'Skripte & Remediations', 'Shell-Skripte (macOS)', 'mac – Dock konfigurieren', 'macOS', '2025-12-01T09:00:00Z',
      [inc(G.mac)], [S('sh.runAsAccount', 'Run As Account', 'user')], { code: [{ title: 'Skriptinhalt', lang: 'bash', content: '#!/bin/zsh\ndefaults write com.apple.dock autohide -bool true\nkillall Dock' }] }),
    obj('autopilot', 'Enrollment', 'Autopilot-Profile', 'Autopilot – Standard (Entra Join)', 'Windows', '2025-05-05T09:00:00Z',
      [inc({ groupId: 'g-ap', label: 'GRP-Autopilot-Geräte' }, { dynamic: true })],
      [S('autopilot.deviceNameTemplate', 'Device Name Template', 'DEMO-%SERIAL%'), S('autopilot.outOfBoxExperienceSetting', 'Out Of Box Experience Setting', 'Privacy Settings Hidden: Ja; Eula Hidden: Ja; User Type: standard')]),
    obj('enrollment', 'Enrollment', 'Enrollment Status Page', 'ESP – Standard', 'Windows', '2025-05-05T09:00:00Z',
      [allUsr()], [S('esp.showInstallationProgress', 'Show Installation Progress', 'Ja'), S('esp.installProgressTimeoutInMinutes', 'Install Progress Timeout In Minutes', '60')], { meta: [['Priorität', 'Standard (0)']] }),
    obj('enrollment', 'Enrollment', 'Windows Hello for Business', 'Windows Hello for Business', 'Windows', '2024-08-05T09:00:00Z',
      [allUsr()], [S('whfb.state', 'State', 'enabled'), S('whfb.pinMinimumLength', 'Pin Minimum Length', '6')], { meta: [['Priorität', 'Standard (0)']] }),
    obj('filters', 'Mandant & Verwaltung', 'Zuweisungsfilter', 'iOS – Supervised', 'iOS/iPadOS', '2025-03-01T09:00:00Z', [],
      [S('rule', 'Regel', '(device.deviceOwnership -eq "Corporate") and (device.enrollmentProfileName -startsWith "ADE")')], { assignable: false, uid: 'filters:f1', id: 'f1' }),
    obj('roles', 'Mandant & Verwaltung', 'Intune-Rollen', 'Helpdesk Level 1 (benutzerdefiniert)', '', '2025-03-01T09:00:00Z', [],
      [S('perms', 'Berechtigungen (6)', 'ManagedDevices Read, ManagedDevices RemoteLock, ManagedDevices Sync, ManagedApps Read, DeviceConfigurations Read, Audit Read'),
        S('ra:1', 'Zuweisung „Helpdesk“', 'Mitglieder: GRP-IT-Admins · Bereich: Alle Geräte')], { assignable: false, meta: [['Typ', 'Benutzerdefinierte Rolle']] }),
    obj('tenantsettings', 'Mandant & Verwaltung', 'Mandanteneinstellungen', 'Compliance-Einstellungen des Mandanten', '', '', [],
      [S('tenant.secureByDefault', 'Secure By Default', 'Ja'), S('tenant.deviceComplianceCheckinThresholdDays', 'Device Compliance Checkin Threshold Days', '30')], { assignable: false })
  ].concat(demoConnectors());
  const devices = demoDevices();
  return {
    app: 'Intune Inspector',
    formatVersion: 1,
    demo: true,
    tenant: { id: '00000000-demo-0000-0000-000000000000', displayName: 'Demo-Kunde GmbH', domain: 'demokunde.onmicrosoft.com' },
    scannedAt: new Date().toISOString(),
    scannedBy: 'demo@demokunde.onmicrosoft.com',
    groups: {},
    warnings: [{ source: 'Demo', message: 'Beispieldaten – kein echter Mandant.' }],
    counts: {},
    objects,
    devices,
    autopilot: demoAutopilot(devices)
  };
}

export function demoOlderSnapshot() {
  const s = demoSnapshot();
  s.scannedAt = new Date(Date.now() - 22 * 86400000).toISOString();
  s.objects = s.objects.filter((o) => o.name !== 'Remediation – Temp bereinigen' && o.name !== 'AV – Vertrieb');
  const bl = s.objects.find((o) => o.name === 'WIN – BitLocker Basis');
  bl.settings = bl.settings.map((x) => x.label.startsWith('Select the encryption method') ? Object.assign({}, x, { value: 'XTS-AES 128-bit' }) : x);
  const p = s.objects.find((o) => o.name === 'WU – Ring 1 Pilot');
  p.assignments = [{ mode: 'include', target: 'group', groupId: 'g-pilot', label: 'GRP-Update-Pilot', filterId: null, filterMode: null, intent: null, extra: '' }];
  s.objects.push({ uid: 'apps:old-teams', id: 'old-teams', sourceKey: 'apps', area: 'Apps', category: 'Win32-App', name: 'Teams Classic', description: '', platform: 'Windows', odataType: '', created: '', modified: '2023-01-01T00:00:00Z', scopeTags: [], assignable: true, assignments: [], settings: [], code: [], meta: [], raw: null });
  return s;
}

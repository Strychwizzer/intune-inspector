// Geräteinventar und Plattform-Anbindungen (APNs, ADE, VPP, Managed Google Play, MTD, Partner).
// Reine Funktionen ohne Netzwerkzugriff.
import { baseObject, flattenProps, humanize } from './normalize.js';

const DAY = 86400000;
const dt = (iso) => { if (!iso) return '—'; const d = new Date(iso); return isNaN(d) ? String(iso) : d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };

export const DEVICE_SELECT = [
  'id', 'deviceName', 'operatingSystem', 'osVersion', 'model', 'manufacturer', 'serialNumber', 'userPrincipalName', 'userDisplayName',
  'managedDeviceOwnerType', 'complianceState', 'deviceEnrollmentType', 'joinType', 'managementAgent', 'enrolledDateTime', 'lastSyncDateTime',
  'isEncrypted', 'isSupervised', 'jailBroken', 'autopilotEnrolled', 'deviceCategoryDisplayName', 'managementState', 'totalStorageSpaceInBytes',
  'freeStorageSpaceInBytes', 'securityPatchLevel', 'androidSecurityPatchLevel', 'enrollmentProfileName', 'azureADDeviceId', 'skuFamily', 'chassisType', 'deviceType'
].join(',');

export function devicePlatform(os, deviceType) {
  const s = String(os || '').toLowerCase();
  if (s.startsWith('windows')) return 'Windows';
  if (s === 'ios' || s === 'ipados' || s.startsWith('ios') || s.startsWith('ipad')) return 'iOS/iPadOS';
  if (s.startsWith('android')) return 'Android';
  if (s.startsWith('mac')) return 'macOS';
  if (s.startsWith('linux') || s.includes('ubuntu') || s.includes('redhat')) return 'Linux';
  if (s.includes('chrome')) return 'ChromeOS';
  return os || humanize(deviceType || 'Unbekannt');
}

const OWNER = { company: 'Firma', personal: 'Privat', unknown: 'Unbekannt' };
export const COMPLIANCE = { compliant: 'Konform', noncompliant: 'Nicht konform', inGracePeriod: 'Kulanzzeitraum', conflict: 'Konflikt', error: 'Fehler', unknown: 'Unbekannt', configManager: 'ConfigMgr' };
const ENROLL = {
  userEnrollment: 'Benutzerregistrierung', deviceEnrollmentManager: 'Geräteregistrierungs-Manager (DEM)', appleBulkWithUser: 'Apple ADE mit Benutzer',
  appleBulkWithoutUser: 'Apple ADE ohne Benutzer', windowsAzureADJoin: 'Entra Join', windowsBulkUserless: 'Windows Bulk (Paket)', windowsAutoEnrollment: 'Automatische Registrierung',
  windowsBulkAzureDomainJoin: 'Windows Bulk Entra Join', windowsCoManagement: 'Co-Management', windowsAzureADJoinUsingDeviceAuth: 'Entra Join (Geräteauth., z. B. Autopilot Self-Deploying)',
  appleUserEnrollment: 'Apple Benutzerregistrierung', appleUserEnrollmentWithServiceAccount: 'Apple Benutzerregistrierung (Dienstkonto)', azureAdJoinUsingAzureVmExtension: 'Entra Join (Azure-VM)',
  androidEnterpriseDedicatedDevice: 'Android Enterprise – dediziert', androidEnterpriseFullyManaged: 'Android Enterprise – vollständig verwaltet',
  androidEnterpriseCorporateWorkProfile: 'Android Enterprise – Firmen-Arbeitsprofil', androidAOSPUserOwnedDeviceEnrollment: 'Android AOSP – benutzerzugeordnet', androidAOSPUserlessDeviceEnrollment: 'Android AOSP – ohne Benutzer',
  appleACMEBasicBYOD: 'Apple BYOD', appleACMEDEPUserless: 'Apple ADE ohne Benutzer', appleACMEDEPUDACompanyPortal: 'Apple ADE (Unternehmensportal)', appleACMEDEPUDASetupAsstLegacy: 'Apple ADE (Setup-Assistent)', appleACMEDEPUDAModernAuth: 'Apple ADE (moderne Authentifizierung)', unknown: 'Unbekannt'
};
const JOIN = { azureADJoined: 'Entra Join', azureADRegistered: 'Entra registriert', hybridAzureADJoined: 'Hybrid Entra Join', unknown: '' };
const AGENT = { mdm: 'Intune (MDM)', eas: 'Exchange ActiveSync', easMdm: 'MDM + EAS', intuneClient: 'Intune-Agent (PC)', configurationManagerClient: 'ConfigMgr', configurationManagerClientMdm: 'Co-Management', configurationManagerClientMdmEas: 'Co-Management + EAS', jamf: 'Jamf', googleCloudDevicePolicyController: 'Google', msSense: 'Defender for Endpoint (Sicherheitsverwaltung)', intuneAosp: 'Intune AOSP', microsoft365ManagedMdm: 'Microsoft 365 verwaltet', unknown: '' };

export function normalizeDevice(d) {
  const platform = devicePlatform(d.operatingSystem, d.deviceType);
  const patch = d.securityPatchLevel || d.androidSecurityPatchLevel || '';
  return {
    id: d.id,
    name: d.deviceName || '(ohne Namen)',
    platform,
    os: d.operatingSystem || '',
    osVersion: d.osVersion || '',
    model: d.model || '',
    manufacturer: d.manufacturer || '',
    serial: d.serialNumber || '',
    user: d.userPrincipalName || '',
    userName: d.userDisplayName || '',
    owner: OWNER[d.managedDeviceOwnerType] || OWNER.unknown,
    compliance: d.complianceState || 'unknown',
    enrollType: ENROLL[d.deviceEnrollmentType] || humanize(d.deviceEnrollmentType || 'unknown'),
    join: JOIN[d.joinType] || '',
    agent: AGENT[d.managementAgent] || humanize(d.managementAgent || ''),
    enrolled: d.enrolledDateTime || '',
    lastSync: d.lastSyncDateTime || '',
    encrypted: d.isEncrypted === true,
    supervised: d.isSupervised === true,
    jailbroken: String(d.jailBroken || '').toLowerCase() === 'true',
    autopilot: d.autopilotEnrolled === true,
    category: d.deviceCategoryDisplayName && d.deviceCategoryDisplayName !== 'Unknown' ? d.deviceCategoryDisplayName : '',
    state: ({ managed: 'Verwaltet', retirePending: 'Abkoppeln ausstehend', retireFailed: 'Abkoppeln fehlgeschlagen', wipePending: 'Zurücksetzen ausstehend', wipeFailed: 'Zurücksetzen fehlgeschlagen', unhealthy: 'Fehlerhaft', deletePending: 'Löschen ausstehend', discovered: 'Erkannt' })[d.managementState] || d.managementState || '',
    storageTotal: d.totalStorageSpaceInBytes || 0,
    storageFree: d.freeStorageSpaceInBytes || 0,
    patch,
    profile: d.enrollmentProfileName || '',
    sku: d.skuFamily || '',
    entraId: d.azureADDeviceId && d.azureADDeviceId !== '00000000-0000-0000-0000-000000000000' ? d.azureADDeviceId : ''
  };
}

const AP_STATE = { enrolled: 'Registriert', notContacted: 'Noch nicht gestartet', pendingReset: 'Zurücksetzen ausstehend', failed: 'Fehlgeschlagen', blocked: 'Blockiert', unknown: 'Unbekannt' };
const AP_PROFILE = { assignedUnkownSyncState: 'Zugewiesen', assignedInSync: 'Zugewiesen', assignedOutOfSync: 'Zugewiesen (nicht synchron)', notAssigned: 'Kein Profil', pending: 'Ausstehend', failed: 'Fehlgeschlagen', unknown: 'Unbekannt' };
export function normalizeAutopilot(a) {
  return {
    id: a.id,
    serial: a.serialNumber || '',
    model: a.model || '',
    manufacturer: a.manufacturer || '',
    groupTag: a.groupTag || '',
    order: a.purchaseOrderIdentifier || '',
    state: AP_STATE[a.enrollmentState] || humanize(a.enrollmentState || 'unknown'),
    profile: AP_PROFILE[a.deploymentProfileAssignmentStatus] || humanize(a.deploymentProfileAssignmentStatus || ''),
    lastContact: a.lastContactedDateTime && !String(a.lastContactedDateTime).startsWith('0001') ? a.lastContactedDateTime : '',
    user: a.userPrincipalName || '',
    displayName: a.displayName || '',
    managedDeviceId: a.managedDeviceId && a.managedDeviceId !== '00000000-0000-0000-0000-000000000000' ? a.managedDeviceId : ''
  };
}

// ---------- Plattform-Anbindungen ----------
const AREA = 'Plattform-Anbindungen';
const MTD_NAMES = { 'fc780465-2017-40d4-a0c5-307022471b92': 'Microsoft Defender for Endpoint' };
const VPP_STATE = { valid: 'Gültig', expired: 'Abgelaufen', invalid: 'Ungültig', assignedToExternalMDM: 'Anderem MDM zugeordnet', duplicateLocationId: 'Doppelte Standort-ID', unknown: 'Unbekannt' };
const MGP_BIND = { notBound: 'Nicht verbunden', bound: 'Verbunden', boundAndValidated: 'Verbunden und geprüft', unbinding: 'Wird getrennt' };
const MTD_STATE = { unavailable: 'Nicht verfügbar', available: 'Verfügbar', enabled: 'Aktiv', unresponsive: 'Antwortet nicht', notSetUp: 'Nicht eingerichtet', error: 'Fehler' };

function conn(sourceKey, item, category, name, platform, extra) {
  const o = baseObject(sourceKey, item, AREA, category, extra);
  o.name = name;
  o.platform = platform;
  o.assignable = false;
  o.health = [];
  o.meta = [];
  return o;
}

export function apnsObject(c) {
  const o = conn('apns', Object.assign({ id: 'apns' }, c), 'Apple MDM-Push-Zertifikat (APNs)', 'Apple MDM-Push-Zertifikat', 'iOS/iPadOS, macOS');
  o.expiry = c.expirationDateTime || '';
  o.settings = [
    { key: 'apns.appleId', label: 'Apple-ID (für die Verlängerung zwingend dieselbe!)', value: c.appleIdentifier || '—' },
    { key: 'apns.expires', label: 'Gültig bis', value: dt(c.expirationDateTime) },
    { key: 'apns.topic', label: 'Topic-ID', value: c.topicIdentifier || '—' },
    { key: 'apns.serial', label: 'Seriennummer', value: c.certificateSerialNumber || '—' },
    { key: 'apns.status', label: 'Upload-Status', value: c.certificateUploadStatus || '—' }
  ];
  o.raw = Object.assign({}, c, { certificate: undefined });
  return o;
}

export function adeObject(t) {
  const o = conn('ade', t, 'Apple Automated Device Enrollment (ADE-Token)', t.tokenName || 'ADE-Token', 'iOS/iPadOS, macOS');
  o.expiry = t.tokenExpirationDateTime || '';
  o.settings = [
    { key: 'ade.appleId', label: 'Apple-ID', value: t.appleIdentifier || '—' },
    { key: 'ade.type', label: 'Typ', value: t.tokenType === 'appleSchoolManager' ? 'Apple School Manager' : 'Apple Business Manager' },
    { key: 'ade.expires', label: 'Token gültig bis', value: dt(t.tokenExpirationDateTime) },
    { key: 'ade.lastSync', label: 'Letzte erfolgreiche Synchronisierung', value: dt(t.lastSuccessfulSyncDateTime) },
    { key: 'ade.devices', label: 'Synchronisierte Geräte', value: String(t.syncedDeviceCount ?? '—') },
    { key: 'ade.err', label: 'Letzter Sync-Fehlercode', value: t.lastSyncErrorCode ? String(t.lastSyncErrorCode) : 'keiner' },
    { key: 'ade.consent', label: 'Datenfreigabe an Apple erteilt', value: t.dataSharingConsentGranted ? 'Ja' : 'Nein' }
  ];
  if (t.lastSyncErrorCode) o.health.push({ sev: 'medium', text: 'Letzte ADE-Synchronisierung meldet Fehlercode ' + t.lastSyncErrorCode + '.' });
  if (t.lastSuccessfulSyncDateTime && Date.now() - Date.parse(t.lastSuccessfulSyncDateTime) > 7 * DAY) o.health.push({ sev: 'medium', text: 'ADE-Token wurde seit über 7 Tagen nicht erfolgreich synchronisiert.' });
  o.raw = Object.assign({}, t, { enrollmentProfiles: undefined });
  return o;
}

export function adeProfileObject(p, tokenName) {
  const o = baseObject('adeprofile', p, 'Enrollment', 'Apple ADE-Registrierungsprofile');
  o.platform = String(p['@odata.type'] || '').toLowerCase().includes('macos') ? 'macOS' : 'iOS/iPadOS';
  o.assignable = false;
  o.meta = [['ADE-Token', tokenName || '—']];
  if (p.isDefault) o.meta.push(['Standardprofil', 'Ja']);
  o.settings = flattenProps(p, new Set(['isDefault'])).map((r) => Object.assign(r, { key: 'adeprofile.' + r.key }));
  o.raw = p;
  return o;
}

export function vppObject(t) {
  const o = conn('vpp', t, 'Apple VPP-Token (Apps & Bücher)', t.displayName || t.organizationName || 'VPP-Token', 'iOS/iPadOS, macOS');
  o.expiry = t.expirationDateTime || '';
  o.settings = [
    { key: 'vpp.org', label: 'Organisation', value: t.organizationName || '—' },
    { key: 'vpp.appleId', label: 'Apple-ID', value: t.appleId || '—' },
    { key: 'vpp.location', label: 'Standort', value: t.locationName || '—' },
    { key: 'vpp.state', label: 'Status', value: VPP_STATE[t.state] || t.state || '—' },
    { key: 'vpp.expires', label: 'Gültig bis', value: dt(t.expirationDateTime) },
    { key: 'vpp.lastSync', label: 'Letzte Synchronisierung', value: dt(t.lastSyncDateTime) },
    { key: 'vpp.syncStatus', label: 'Sync-Status', value: t.lastSyncStatus || '—' },
    { key: 'vpp.autoUpdate', label: 'Apps automatisch aktualisieren', value: t.automaticallyUpdateApps ? 'Ja' : 'Nein' },
    { key: 'vpp.country', label: 'Land/Region', value: t.countryOrRegion || '—' }
  ];
  if (t.state && t.state !== 'valid') o.health.push({ sev: 'high', text: 'VPP-Token-Status: ' + (VPP_STATE[t.state] || t.state) + '.' });
  o.raw = t;
  return o;
}

export function mgpObject(s) {
  const o = conn('mgp', Object.assign({ id: 'mgp' }, s), 'Managed Google Play (Android Enterprise)', 'Managed Google Play', 'Android');
  o.settings = [
    { key: 'mgp.bind', label: 'Verbindungsstatus', value: MGP_BIND[s.bindStatus] || s.bindStatus || '—' },
    { key: 'mgp.owner', label: 'Verknüpftes Google-Konto (Besitzer)', value: s.ownerUserPrincipalName || '—' },
    { key: 'mgp.org', label: 'Organisation', value: s.ownerOrganizationName || '—' },
    { key: 'mgp.lastSync', label: 'Letzte App-Synchronisierung', value: dt(s.lastAppSyncDateTime) },
    { key: 'mgp.syncStatus', label: 'Sync-Status', value: s.lastAppSyncStatus || '—' },
    { key: 'mgp.target', label: 'Arbeitsprofil-Registrierung erlaubt für', value: humanize(s.enrollmentTarget || '—') },
    { key: 'mgp.fully', label: 'Vollständig verwaltete Geräte erlaubt', value: s.androidDeviceOwnerFullyManagedEnrollmentEnabled ? 'Ja' : 'Nein' }
  ];
  o.bound = s.bindStatus === 'bound' || s.bindStatus === 'boundAndValidated';
  if (s.lastAppSyncStatus && !/success/i.test(s.lastAppSyncStatus) && o.bound) o.health.push({ sev: 'medium', text: 'Letzte Managed-Google-Play-Synchronisierung: ' + s.lastAppSyncStatus + '.' });
  o.raw = s;
  return o;
}

export function mtdObject(c) {
  const name = MTD_NAMES[c.id] || 'Mobile Threat Defense-Partner';
  const o = conn('mtd', c, 'Mobile Threat Defense / Defender-Anbindung', name, ['androidEnabled', 'iosEnabled', 'windowsEnabled', 'macEnabled'].filter((k) => c[k]).map((k) => ({ androidEnabled: 'Android', iosEnabled: 'iOS', windowsEnabled: 'Windows', macEnabled: 'macOS' })[k]).join(', '));
  o.settings = [
    { key: 'mtd.state', label: 'Status', value: MTD_STATE[c.partnerState] || c.partnerState || '—' },
    { key: 'mtd.hb', label: 'Letztes Lebenszeichen', value: dt(c.lastHeartbeatDateTime) },
    { key: 'mtd.android', label: 'Android-Geräte verbinden', value: c.androidEnabled ? 'Ja' : 'Nein' },
    { key: 'mtd.ios', label: 'iOS-Geräte verbinden', value: c.iosEnabled ? 'Ja' : 'Nein' },
    { key: 'mtd.win', label: 'Windows-Geräte verbinden', value: c.windowsEnabled ? 'Ja' : 'Nein' },
    { key: 'mtd.mac', label: 'macOS-Geräte verbinden', value: c.macEnabled ? 'Ja' : 'Nein' },
    { key: 'mtd.block', label: 'Geräte ohne Unterstützung blockieren', value: c.partnerUnsupportedOsVersionBlocked ? 'Ja' : 'Nein' }
  ];
  if (c.partnerState === 'unresponsive' || c.partnerState === 'error') o.health.push({ sev: 'medium', text: name + ' meldet Status „' + (MTD_STATE[c.partnerState] || c.partnerState) + '“.' });
  o.raw = c;
  return o;
}

export function partnerObject(p) {
  const o = conn('partner', p, 'Geräteverwaltungs-Partner', p.displayName || humanize(p.partnerAppType || 'Partner'), '');
  o.settings = flattenProps(p).map((r) => Object.assign(r, { key: 'partner.' + r.key }));
  return o;
}

// ---------- Auswertung ----------
export function analyzeConnectors(objs, devices, now) {
  now = now || Date.now();
  const conns = objs.filter((o) => o.area === AREA);
  const rows = [];
  const findings = [];
  for (const o of conns) {
    let days = null;
    if (o.expiry) days = Math.round((Date.parse(o.expiry) - now) / DAY);
    const short = o.category.split(' (')[0];
    const label = short === o.name || o.category.startsWith(o.name) ? o.name : short + ' „' + o.name + '“';
    let sev = 'ok';
    if (days !== null) {
      if (days < 0) { sev = 'high'; findings.push({ sev: 'high', title: label + ' ist abgelaufen', text: 'Seit ' + Math.abs(days) + ' Tagen. Verwaltung bzw. Synchronisierung funktioniert nicht mehr.', view: 'objects', uid: o.uid }); }
      else if (days <= 30) { sev = 'high'; findings.push({ sev: 'high', title: label + ' läuft in ' + days + ' Tagen ab', text: o.sourceKey === 'apns' ? 'Mit derselben Apple-ID verlängern, sonst müssen alle Apple-Geräte neu registriert werden.' : 'Rechtzeitig verlängern.', view: 'objects', uid: o.uid }); }
      else if (days <= 60) { sev = 'medium'; findings.push({ sev: 'medium', title: label + ' läuft in ' + days + ' Tagen ab', text: 'Verlängerung einplanen.', view: 'objects', uid: o.uid }); }
    }
    for (const h of o.health || []) { findings.push({ sev: h.sev, title: h.text, text: o.name, view: 'objects', uid: o.uid }); if (sev === 'ok' || (sev === 'medium' && h.sev === 'high')) sev = h.sev; }
    if (o.sourceKey === 'mgp' && !o.bound) sev = 'info';
    rows.push({ uid: o.uid, name: o.name, category: o.category, platform: o.platform, expiry: o.expiry || '', days, sev });
  }
  const apple = devices.filter((d) => d.platform === 'iOS/iPadOS' || d.platform === 'macOS').length;
  const android = devices.filter((d) => d.platform === 'Android').length;
  if (apple && !conns.some((o) => o.sourceKey === 'apns')) findings.push({ sev: 'high', title: 'Kein Apple MDM-Push-Zertifikat gefunden', text: apple + ' Apple-Geräte sind registriert – Zertifikat prüfen.', view: 'devices' });
  const mgp = conns.find((o) => o.sourceKey === 'mgp');
  if (android && mgp && !mgp.bound) findings.push({ sev: 'info', title: 'Managed Google Play ist nicht verbunden', text: android + ' Android-Geräte vorhanden; ohne Verbindung keine Android-Enterprise-Verwaltung.', view: 'objects', uid: mgp.uid });
  rows.sort((a, b) => (a.days === null) - (b.days === null) || (a.days || 0) - (b.days || 0));
  return { rows, findings };
}

export function analyzeDevices(devices, autopilot, now) {
  now = now || Date.now();
  const count = (arr, fn) => { const m = new Map(); for (const x of arr) { const k = fn(x) || '—'; m.set(k, (m.get(k) || 0) + 1); } return [...m.entries()].sort((a, b) => b[1] - a[1]); };
  const stale = devices.filter((d) => d.lastSync && now - Date.parse(d.lastSync) > 30 * DAY);
  const noncompliant = devices.filter((d) => d.compliance === 'noncompliant' || d.compliance === 'error' || d.compliance === 'conflict');
  const grace = devices.filter((d) => d.compliance === 'inGracePeriod');
  const unencrypted = devices.filter((d) => (d.platform === 'Windows' || d.platform === 'macOS') && !d.encrypted);
  const jailbroken = devices.filter((d) => d.jailbroken);
  const personal = devices.filter((d) => d.owner === 'Privat');
  const byPlatform = count(devices, (d) => d.platform);
  const versions = {};
  for (const [p] of byPlatform) versions[p] = count(devices.filter((d) => d.platform === p), (d) => d.osVersion).slice(0, 10);
  const findings = [];
  if (noncompliant.length) findings.push({ sev: 'medium', title: noncompliant.length + ' Gerät(e) nicht konform', text: 'Bedingter Zugriff kann diese Geräte blockieren.', view: 'devices', dfilter: 'noncompliant' });
  if (jailbroken.length) findings.push({ sev: 'high', title: jailbroken.length + ' Gerät(e) mit Jailbreak/Root', text: 'Kompromittierte Mobilgeräte.', view: 'devices', dfilter: 'jailbroken' });
  if (unencrypted.length) findings.push({ sev: 'medium', title: unencrypted.length + ' Windows-/macOS-Gerät(e) unverschlüsselt', text: 'BitLocker bzw. FileVault nicht aktiv.', view: 'devices', dfilter: 'unencrypted' });
  if (stale.length) findings.push({ sev: 'low', title: stale.length + ' Gerät(e) seit über 30 Tagen ohne Check-in', text: 'Kandidaten für Bereinigungsregeln.', view: 'devices', dfilter: 'stale' });
  const apNoProfile = (autopilot || []).filter((a) => a.profile === 'Kein Profil');
  if (apNoProfile.length) findings.push({ sev: 'low', title: apNoProfile.length + ' Autopilot-Gerät(e) ohne Bereitstellungsprofil', text: 'Diese Geräte durchlaufen kein Autopilot-Setup.', view: 'devices', dfilter: 'autopilot' });
  return {
    total: devices.length, byPlatform, versions,
    byCompliance: count(devices, (d) => COMPLIANCE[d.compliance] || d.compliance),
    byOwner: count(devices, (d) => d.owner),
    byEnroll: count(devices, (d) => d.enrollType),
    byJoin: count(devices.filter((d) => d.platform === 'Windows'), (d) => d.join || 'Unbekannt'),
    byModel: count(devices, (d) => (d.manufacturer ? d.manufacturer + ' ' : '') + d.model).slice(0, 12),
    byGroupTag: count(autopilot || [], (a) => a.groupTag || '(ohne Group Tag)'),
    stale, noncompliant, grace, unencrypted, jailbroken, personal,
    autopilotCount: (autopilot || []).length,
    flags: {
      noncompliant: new Set(noncompliant.map((d) => d.id)), stale: new Set(stale.map((d) => d.id)), unencrypted: new Set(unencrypted.map((d) => d.id)),
      jailbroken: new Set(jailbroken.map((d) => d.id)), personal: new Set(personal.map((d) => d.id)), grace: new Set(grace.map((d) => d.id))
    },
    findings
  };
}

export function fmtBytes(b) {
  if (!b) return '—';
  const gb = b / 1073741824;
  return gb >= 1 ? gb.toFixed(gb >= 100 ? 0 : 1).replace('.', ',') + ' GB' : Math.round(b / 1048576) + ' MB';
}

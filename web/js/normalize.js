// Reine Funktionen: Graph-Objekte → einheitliches Dokumentationsmodell.
// Keine Netzwerkzugriffe, damit sie sich isoliert testen lassen.

export const AREAS = [
  'Konfiguration', 'Endpoint Security', 'Security Baselines', 'Compliance', 'Windows Updates',
  'Apps', 'App-Schutz', 'App-Konfiguration', 'Skripte & Remediations', 'Enrollment', 'Plattform-Anbindungen', 'Mandant & Verwaltung'
];

const META_KEYS = new Set([
  'id', 'displayName', 'name', 'description', 'createdDateTime', 'lastModifiedDateTime', 'version', 'roleScopeTagIds',
  'roleScopeTags', 'assignments', 'groupAssignments', 'supportsScopeTags', 'deviceManagementApplicabilityRuleOsEdition',
  'deviceManagementApplicabilityRuleOsVersion', 'deviceManagementApplicabilityRuleDeviceMode', 'isAssigned', 'settings',
  'settingCount', 'creationSource', 'templateReference', 'scheduledActionsForRule', 'apps', 'largeIcon', 'uploadState',
  'publishingState', 'committedContentVersion', 'dependentAppCount', 'supersedingAppCount', 'supersededAppCount',
  'isAssigned', 'deployedAppCount', 'driverInventories', 'localizedNotificationMessages', 'roleAssignments',
  'scriptContent', 'detectionScriptContent', 'remediationScriptContent', 'payload', 'omaSettings', 'customSettings',
  'payloadJson', 'encodedSettingXml', 'targetedMobileApps', 'createdBy', 'lastModifiedBy', 'priority',
  'themeColorLogo', 'lightBackgroundLogo', 'landingPageCustomizedImage', 'isDefaultProfile', 'isDefault'
]);
// Nur Zeichenketten-Werte, deren Schlüssel auf ein Geheimnis endet (passwordRequired o. Ä. bleibt sichtbar).
const SECRET_KEY = /(password|secret|presharedkey|sharedkey|tokenvalue|qrcodecontent|qrcodeimage|privatekey|passphrase|enrollmenttoken|clientsecret)$/i;
const isSecret = (k, v) => typeof v === 'string' && v !== '' && SECRET_KEY.test(k);
const SKIP_VALUES = new Set(['notConfigured', 'userDefined', 'deviceDefault', '']);

export function humanize(key) {
  const s = String(key).replace(/^.*[.\/]/, '').replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function fmtValue(v) {
  if (v === true) return 'Ja';
  if (v === false) return 'Nein';
  if (v === null || v === undefined) return '';
  if (Array.isArray(v)) {
    if (v.every((x) => x === null || typeof x !== 'object')) return v.join(', ');
    return v.map((x) => compactObj(x)).join(' | ');
  }
  if (typeof v === 'object') return compactObj(v);
  return String(v);
}

function compactObj(o) {
  if (o === null || typeof o !== 'object') return String(o);
  const parts = [];
  for (const [k, val] of Object.entries(o)) {
    if (k.startsWith('@odata') || val === null || val === '' || (Array.isArray(val) && !val.length)) continue;
    if (isSecret(k, val)) { parts.push(humanize(k) + ': (ausgeblendet)'); continue; }
    parts.push(humanize(k) + ': ' + (typeof val === 'object' ? fmtValue(val) : fmtValue(val)));
  }
  return parts.join('; ');
}

export function shortType(odataType) {
  return String(odataType || '').replace('#microsoft.graph.', '');
}

export function platformFromType(t) {
  t = shortType(t).toLowerCase();
  if (/^(windows|win32|win|officesuite|microsoftstore|edition|sharedpc|windowsphone)/.test(t) || t.includes('windows')) return 'Windows';
  if (t.startsWith('ios') || t.startsWith('managedios')) return 'iOS/iPadOS';
  if (t.startsWith('macos')) return 'macOS';
  if (t.startsWith('androidworkprofile')) return 'Android (Work Profile)';
  if (t.startsWith('aosp')) return 'Android (AOSP)';
  if (t.startsWith('androiddeviceowner') || t.startsWith('androidmanagedstore')) return 'Android Enterprise';
  if (t.startsWith('android') || t.startsWith('managedandroid')) return 'Android';
  if (t.startsWith('webapp')) return 'Alle';
  return '';
}

const PLATFORM_FIELD = { windows10: 'Windows', windows10x: 'Windows', windows10AndLater: 'Windows', windows81AndLater: 'Windows', windows: 'Windows', macOS: 'macOS', iOS: 'iOS/iPadOS', ios: 'iOS/iPadOS', android: 'Android', androidAOSP: 'Android (AOSP)', androidForWork: 'Android (Work Profile)', androidWorkProfile: 'Android (Work Profile)', androidEnterprise: 'Android Enterprise', androidMobileApplicationManagement: 'Android', iOSMobileApplicationManagement: 'iOS/iPadOS', aosp: 'Android (AOSP)', linux: 'Linux', unknownFutureValue: '' };
export function platformFromField(p) {
  if (!p) return '';
  return String(p).split(',').map((x) => PLATFORM_FIELD[x.trim()] || x.trim()).join(', ');
}

// Allgemeines „Abflachen“ von Vorlagen-Objekten: nur konfigurierte Werte.
export function flattenProps(obj, extraSkip) {
  const rows = [];
  for (const [k, v] of Object.entries(obj || {})) {
    if (k.startsWith('@odata') || k.endsWith('@odata.type') || META_KEYS.has(k) || (extraSkip && extraSkip.has(k))) continue;
    if (v === null || v === undefined || v === false) continue;
    if (typeof v === 'string' && SKIP_VALUES.has(v)) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).filter((x) => !x.startsWith('@odata')).length === 0) continue;
    let value;
    if (isSecret(k, v)) value = '(ausgeblendet)';
    else if (typeof v === 'string' && v.length > 1500 && /^[A-Za-z0-9+/=\s]+$/.test(v)) value = '(Binärdaten, ' + v.length + ' Zeichen)';
    else value = fmtValue(v);
    if (value === '') continue;
    rows.push({ key: k, label: humanize(k), value });
  }
  return rows;
}

// ---------- Settings Catalog ----------
export function flattenCatalog(settings) {
  const rows = [];
  for (const s of settings || []) {
    const defs = new Map();
    for (const d of s.settingDefinitions || []) defs.set(d.id, d);
    walkInstance(s.settingInstance, defs, rows, 0, '');
  }
  return rows;
}

function defLabel(defs, id) {
  const d = defs.get(id);
  return (d && (d.displayName || d.name)) || humanize(String(id || '').split('_').slice(-1)[0] || id);
}
function optionLabel(defs, defId, value) {
  const d = defs.get(defId);
  if (d && Array.isArray(d.options)) {
    const o = d.options.find((x) => x.itemId === value);
    if (o) return o.displayName || o.name || value;
  }
  // Fallback: Suffix nach letztem "_"
  const m = String(value || '').match(/_([^_]+)$/);
  if (m) return m[1] === '1' ? 'Aktiviert' : m[1] === '0' ? 'Deaktiviert' : m[1];
  return String(value);
}
function simpleVal(v) {
  if (!v) return '';
  if (v['@odata.type'] && v['@odata.type'].includes('Secret')) return '(geheimer Wert)';
  return v.value === undefined || v.value === null ? '' : String(v.value);
}

function walkInstance(inst, defs, rows, depth, path) {
  if (!inst) return;
  const t = shortType(inst['@odata.type']);
  const id = inst.settingDefinitionId;
  const label = defLabel(defs, id);
  const push = (value) => rows.push({ key: id, label, value, depth, path });
  if (t.startsWith('deviceManagementConfigurationChoiceSettingInstance')) {
    const cv = inst.choiceSettingValue || {};
    push(optionLabel(defs, id, cv.value));
    for (const c of cv.children || []) walkInstance(c, defs, rows, depth + 1, label);
  } else if (t.startsWith('deviceManagementConfigurationChoiceSettingCollectionInstance')) {
    const vals = inst.choiceSettingCollectionValue || [];
    push(vals.map((v) => optionLabel(defs, id, v.value)).join(', '));
    for (const v of vals) for (const c of v.children || []) walkInstance(c, defs, rows, depth + 1, label);
  } else if (t.startsWith('deviceManagementConfigurationSimpleSettingInstance')) {
    push(simpleVal(inst.simpleSettingValue));
  } else if (t.startsWith('deviceManagementConfigurationSimpleSettingCollectionInstance')) {
    push((inst.simpleSettingCollectionValue || []).map(simpleVal).join(', '));
  } else if (t.startsWith('deviceManagementConfigurationGroupSettingCollectionInstance')) {
    const groups = inst.groupSettingCollectionValue || [];
    if (!(groups.length === 1 && depth === 0)) push(groups.length + ' Einträge');
    groups.forEach((g, i) => {
      for (const c of g.children || []) walkInstance(c, defs, rows, depth + (groups.length === 1 && depth === 0 ? 0 : 1), label + (groups.length > 1 ? ' #' + (i + 1) : ''));
    });
  } else if (t.startsWith('deviceManagementConfigurationGroupSettingInstance')) {
    for (const c of (inst.groupSettingValue && inst.groupSettingValue.children) || []) walkInstance(c, defs, rows, depth, path || label);
  } else {
    push(fmtValue(inst));
  }
}

// ---------- Zuweisungen ----------
const INTENT = { required: 'Erforderlich', available: 'Verfügbar', uninstall: 'Deinstallieren', availableWithoutEnrollment: 'Verfügbar ohne Registrierung', remove: 'Entfernen' };
// „apply“ ist bei Richtlinien der Normalfall und wird nicht angezeigt.
const HIDDEN_INTENTS = new Set(['apply', 'include', 'none', 'unknownFutureValue']);

export function normalizeAssignment(a) {
  const target = a.target || a; // Skripte (groupAssignments) haben kein target-Objekt
  const t = shortType(target['@odata.type']);
  const out = { mode: 'include', target: 'group', groupId: null, filterId: null, filterMode: null, intent: null, extra: '' };
  if (t === 'exclusionGroupAssignmentTarget') { out.mode = 'exclude'; out.groupId = target.groupId; }
  else if (t === 'allDevicesAssignmentTarget') out.target = 'allDevices';
  else if (t === 'allLicensedUsersAssignmentTarget') out.target = 'allUsers';
  else if (target.groupId || target.targetGroupId) out.groupId = target.groupId || target.targetGroupId;
  else if (t === 'configurationManagerCollectionAssignmentTarget') { out.target = 'collection'; out.groupId = target.collectionId; }
  const fId = target.deviceAndAppManagementAssignmentFilterId;
  const fType = target.deviceAndAppManagementAssignmentFilterType;
  if (fId && fType && fType !== 'none') { out.filterId = fId; out.filterMode = fType; }
  if (a.intent && !HIDDEN_INTENTS.has(a.intent)) out.intent = INTENT[a.intent] || a.intent;
  const extras = [];
  if (a.runSchedule) {
    const rs = a.runSchedule; const st = shortType(rs['@odata.type']);
    const time = rs.time ? String(rs.time).slice(0, 5) : '';
    if (st.includes('Daily')) extras.push('täglich' + (rs.interval > 1 ? ' (alle ' + rs.interval + ' Tage)' : '') + (time ? ' ' + time : ''));
    else if (st.includes('Hourly')) extras.push('alle ' + (rs.interval || 1) + ' Std.');
    else if (st.includes('RunOnce')) extras.push('einmalig ' + (rs.date || '') + (time ? ' ' + time : ''));
  }
  if (a.settings) {
    const s = a.settings;
    if (s.notifications && s.notifications !== 'showAll') extras.push('Benachrichtigungen: ' + s.notifications);
    if (s.deliveryOptimizationPriority && s.deliveryOptimizationPriority !== 'notConfigured') extras.push('Delivery Optimization: ' + s.deliveryOptimizationPriority);
    if (s.installTimeSettings && s.installTimeSettings.deadlineDateTime) extras.push('Stichtag ' + String(s.installTimeSettings.deadlineDateTime).slice(0, 10));
    if (s.vpnConfigurationId) extras.push('VPN zugewiesen');
  }
  out.extra = extras.join(' · ');
  return out;
}

// ---------- Kategorien ----------
const FAMILY = {
  none: ['Konfiguration', 'Settings Catalog'],
  endpointSecurityAntivirus: ['Endpoint Security', 'Antivirus'],
  endpointSecurityDiskEncryption: ['Endpoint Security', 'Datenträgerverschlüsselung'],
  endpointSecurityFirewall: ['Endpoint Security', 'Firewall'],
  endpointSecurityEndpointDetectionAndResponse: ['Endpoint Security', 'Endpunkterkennung und -reaktion (EDR)'],
  endpointSecurityAttackSurfaceReduction: ['Endpoint Security', 'Verringerung der Angriffsfläche'],
  endpointSecurityAccountProtection: ['Endpoint Security', 'Kontoschutz'],
  endpointSecurityApplicationControl: ['Endpoint Security', 'App-Steuerung'],
  endpointSecurityEndpointPrivilegeManagement: ['Endpoint Security', 'Endpoint Privilege Management'],
  baseline: ['Security Baselines', 'Security Baseline'],
  enrollmentConfiguration: ['Enrollment', 'Enrollment-Konfiguration'],
  deviceConfigurationPolicies: ['Konfiguration', 'Settings Catalog'],
  companyPortal: ['Konfiguration', 'Unternehmensportal'],
  appQuietTime: ['Konfiguration', 'Ruhezeiten'],
  windowsOsRecoveryPolicies: ['Windows Updates', 'Windows-Wiederherstellung']
};
export function catalogCategory(p) {
  const fam = (p.templateReference && p.templateReference.templateFamily) || 'none';
  const tech = String(p.technologies || '');
  if (FAMILY[fam]) {
    const [area, cat] = FAMILY[fam];
    if (fam === 'baseline') return [area, (p.templateReference && p.templateReference.templateDisplayName) || cat];
    if (fam === 'none' && tech.includes('enrollment')) return ['Enrollment', 'Autopilot Device Preparation'];
    return [area, cat];
  }
  if (fam.startsWith('endpointSecurity')) return ['Endpoint Security', humanize(fam.replace('endpointSecurity', ''))];
  return ['Konfiguration', humanize(fam)];
}

const DC_RULES = [
  [/windowsUpdateForBusinessConfiguration/, 'Windows Updates', 'Update-Ring (Windows)'],
  [/(iosUpdateConfiguration|macOSSoftwareUpdateConfiguration)/, 'Windows Updates', 'Update-Richtlinie (Apple)'],
  [/CustomConfiguration|CustomProfile/i, 'Konfiguration', 'Benutzerdefiniert (OMA-URI / Profil)'],
  [/EndpointProtection/, 'Konfiguration', 'Endpoint Protection (Vorlage)'],
  [/IdentityProtection/, 'Konfiguration', 'Identity Protection'],
  [/(Certificate|Scep|Pkcs)/i, 'Konfiguration', 'Zertifikate'],
  [/WiFi|Wifi/, 'Konfiguration', 'WLAN'],
  [/Vpn/i, 'Konfiguration', 'VPN'],
  [/Email|Eas/i, 'Konfiguration', 'E-Mail'],
  [/DeviceFeatures/, 'Konfiguration', 'Gerätefunktionen'],
  [/Kiosk/i, 'Konfiguration', 'Kiosk'],
  [/HealthMonitoring/, 'Konfiguration', 'Integritätsüberwachung'],
  [/DomainJoin/, 'Konfiguration', 'Domänenbeitritt (Hybrid)'],
  [/editionUpgrade/i, 'Konfiguration', 'Edition-Upgrade'],
  [/sharedPC/i, 'Konfiguration', 'Freigegebener PC'],
  [/DeliveryOptimization/, 'Konfiguration', 'Übermittlungsoptimierung'],
  [/^aospDeviceOwnerDeviceConfiguration$/, 'Konfiguration', 'Geräteeinschränkungen (AOSP)'],
  [/^androidDeviceOwnerGeneralDeviceConfiguration$/, 'Konfiguration', 'Geräteeinschränkungen (Android Enterprise)'],
  [/^androidWorkProfileGeneralDeviceConfiguration$/, 'Konfiguration', 'Geräteeinschränkungen (Arbeitsprofil)'],
  [/(GeneralConfiguration|GeneralDeviceConfiguration|Restriction)/, 'Konfiguration', 'Geräteeinschränkungen'],
  [/ExtensionsConfiguration/, 'Konfiguration', 'Erweiterungen'],
  [/TeamGeneral|Holographic/, 'Konfiguration', 'Spezialgeräte']
];
export function deviceConfigCategory(odataType) {
  const t = shortType(odataType);
  for (const [re, area, cat] of DC_RULES) if (re.test(t)) return [area, cat];
  return ['Konfiguration', 'Vorlage: ' + humanize(t.replace(/Configuration$/, ''))];
}

const APP_TYPES = {
  win32LobApp: 'Win32-App', win32CatalogApp: 'Win32 (Enterprise App Catalog)', winGetApp: 'Microsoft Store (WinGet)',
  windowsMobileMSI: 'MSI (Branchen-App)', windowsUniversalAppX: 'AppX / MSIX', windowsAppX: 'AppX / MSIX', officeSuiteApp: 'Microsoft 365 Apps',
  windowsMicrosoftEdgeApp: 'Microsoft Edge', macOSMicrosoftEdgeApp: 'Microsoft Edge', macOSMicrosoftDefenderApp: 'Microsoft Defender',
  macOSOfficeSuiteApp: 'Microsoft 365 Apps', windowsStoreApp: 'Microsoft Store (alt)', microsoftStoreForBusinessApp: 'Microsoft Store für Unternehmen',
  iosVppApp: 'Volumenlizenz-App (VPP)', macOsVppApp: 'Volumenlizenz-App (VPP)', iosStoreApp: 'Store-App', iosLobApp: 'Branchen-App (LOB)',
  managedIOSStoreApp: 'Store-App (verwaltet)', managedIOSLobApp: 'Branchen-App (verwaltet)', androidManagedStoreApp: 'Managed Google Play',
  androidManagedStoreWebApp: 'Managed Google Play Web-App', androidStoreApp: 'Store-App', androidLobApp: 'Branchen-App (LOB)',
  managedAndroidStoreApp: 'Store-App (verwaltet)', managedAndroidLobApp: 'Branchen-App (verwaltet)', macOSLobApp: 'Branchen-App (LOB)',
  macOSPkgApp: 'PKG-App', macOSDmgApp: 'DMG-App', macOSWebClip: 'Web-Clip', webApp: 'Web-Link', windowsWebApp: 'Web-Link'
};
export function appCategory(odataType) {
  const t = shortType(odataType);
  return APP_TYPES[t] || humanize(t);
}

const ENROLL = {
  windows10EnrollmentCompletionPageConfiguration: 'Enrollment Status Page',
  deviceEnrollmentPlatformRestrictionsConfiguration: 'Registrierungseinschränkungen (Plattform)',
  deviceEnrollmentPlatformRestrictionConfiguration: 'Registrierungseinschränkungen (Plattform)',
  deviceEnrollmentLimitConfiguration: 'Gerätelimit',
  deviceEnrollmentWindowsHelloForBusinessConfiguration: 'Windows Hello for Business',
  windowsRestoreDeviceEnrollmentConfiguration: 'Windows-Wiederherstellung',
  deviceComanagementAuthorityConfiguration: 'Co-Management',
  enrollmentNotificationsConfiguration: 'Registrierungsbenachrichtigung',
  singlePlatformRestriction: 'Registrierungseinschränkungen'
};
export function enrollmentCategory(odataType) {
  const t = shortType(odataType);
  return ENROLL[t] || humanize(t.replace(/^deviceEnrollment/, '').replace(/Configuration$/, ''));
}

export function decodeB64(s) {
  if (!s) return '';
  try {
    const bin = atob(s);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    let txt = new TextDecoder('utf-8').decode(bytes);
    if (txt.charCodeAt(0) === 0xFEFF) txt = txt.slice(1);
    return txt;
  } catch (e) { return '(Inhalt nicht lesbar)'; }
}

// Grundgerüst eines dokumentierten Objekts
export function baseObject(sourceKey, item, area, category, extra) {
  return Object.assign({
    uid: sourceKey + ':' + item.id,
    id: item.id,
    sourceKey,
    area,
    category,
    name: item.displayName || item.name || '(ohne Namen)',
    description: item.description || '',
    platform: '',
    odataType: shortType(item['@odata.type']),
    created: item.createdDateTime || '',
    modified: item.lastModifiedDateTime || item.createdDateTime || '',
    scopeTagIds: item.roleScopeTagIds || [],
    assignable: true,
    rawAssignments: item.assignments || item.groupAssignments || [],
    assignments: [],
    settings: [],
    code: [],
    raw: null
  }, extra || {});
}

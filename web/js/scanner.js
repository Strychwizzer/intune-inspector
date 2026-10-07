// Liest alle Intune-Bereiche über Microsoft Graph (beta) und erzeugt einen Snapshot.
import { get, getAll, batchGet, GraphError } from './graph.js';
import {
  baseObject, flattenProps, flattenCatalog, normalizeAssignment, catalogCategory, deviceConfigCategory,
  appCategory, enrollmentCategory, platformFromType, platformFromField, decodeB64, fmtValue, humanize, shortType
} from './normalize.js';
import { DEVICE_SELECT, normalizeDevice, normalizeAutopilot, apnsObject, adeObject, adeProfileObject, vppObject, mgpObject, mtdObject, partnerObject } from './devices.js';

const DM = '/deviceManagement';
const DAM = '/deviceAppManagement';

// Quellen. kind steuert Nachladen und Aufbereitung.
export const SOURCES = [
  { key: 'catalog', label: 'Settings Catalog, Endpoint Security & Baselines', path: DM + '/configurationPolicies', expand: 'assignments', kind: 'catalog' },
  { key: 'compliancecatalog', label: 'Compliance (Settings Catalog)', path: DM + '/compliancePolicies', expand: 'assignments', kind: 'catalog', fixed: ['Compliance', 'Compliance (Settings Catalog)'] },
  { key: 'deviceconfig', label: 'Konfigurationsprofile, Custom & Update-Ringe', path: DM + '/deviceConfigurations', expand: 'assignments', kind: 'deviceconfig' },
  { key: 'admx', label: 'Administrative Vorlagen (ADMX)', path: DM + '/groupPolicyConfigurations', expand: 'assignments', kind: 'admx', fixed: ['Konfiguration', 'Administrative Vorlagen'], platform: 'Windows' },
  { key: 'intent', label: 'Endpoint Security & Baselines (ältere Vorlagen)', path: DM + '/intents', expand: null, kind: 'intent' },
  { key: 'compliance', label: 'Compliance-Richtlinien', path: DM + '/deviceCompliancePolicies', expand: 'assignments,scheduledActionsForRule($expand=scheduledActionConfigurations)', kind: 'compliance' },
  { key: 'compliancescript', label: 'Compliance-Skripte', path: DM + '/deviceComplianceScripts', expand: null, kind: 'script', content: ['detectionScriptContent'], assignable: false, fixed: ['Compliance', 'Benutzerdefinierte Compliance-Skripte'], platform: 'Windows' },
  { key: 'featureupdate', label: 'Feature-Updates', path: DM + '/windowsFeatureUpdateProfiles', expand: 'assignments', kind: 'generic', fixed: ['Windows Updates', 'Feature-Updates'], platform: 'Windows' },
  { key: 'qualityupdate', label: 'Quality-Updates', path: DM + '/windowsQualityUpdateProfiles', expand: 'assignments', kind: 'generic', fixed: ['Windows Updates', 'Quality-Updates (beschleunigt)'], platform: 'Windows' },
  { key: 'driverupdate', label: 'Treiber-Updates', path: DM + '/windowsDriverUpdateProfiles', expand: 'assignments', kind: 'generic', fixed: ['Windows Updates', 'Treiber-Updates'], platform: 'Windows' },
  { key: 'apps', label: 'Apps (zugewiesen)', path: DAM + '/mobileApps', filter: 'isAssigned eq true', expand: 'assignments', kind: 'app' },
  { key: 'mam-ios', label: 'App-Schutz iOS/iPadOS', path: DAM + '/iosManagedAppProtections', expand: 'assignments,apps', kind: 'mam', fixed: ['App-Schutz', 'App-Schutz iOS/iPadOS'], platform: 'iOS/iPadOS' },
  { key: 'mam-android', label: 'App-Schutz Android', path: DAM + '/androidManagedAppProtections', expand: 'assignments,apps', kind: 'mam', fixed: ['App-Schutz', 'App-Schutz Android'], platform: 'Android' },
  { key: 'mam-windows', label: 'App-Schutz Windows', path: DAM + '/windowsManagedAppProtections', expand: 'assignments,apps', kind: 'mam', fixed: ['App-Schutz', 'App-Schutz Windows (Edge)'], platform: 'Windows' },
  { key: 'appconfig-device', label: 'App-Konfiguration (Geräte)', path: DAM + '/mobileAppConfigurations', expand: 'assignments', kind: 'appconfig', fixed: ['App-Konfiguration', 'Verwaltete Geräte'] },
  { key: 'appconfig-app', label: 'App-Konfiguration (Apps)', path: DAM + '/targetedManagedAppConfigurations', expand: 'assignments,apps', kind: 'appconfigmam', fixed: ['App-Konfiguration', 'Verwaltete Apps'] },
  { key: 'ps', label: 'PowerShell-Skripte', path: DM + '/deviceManagementScripts', expand: 'assignments', kind: 'script', content: ['scriptContent'], fixed: ['Skripte & Remediations', 'PowerShell-Skripte (Windows)'], platform: 'Windows' },
  { key: 'sh', label: 'Shell-Skripte (macOS)', path: DM + '/deviceShellScripts', expand: 'assignments', kind: 'script', content: ['scriptContent'], fixed: ['Skripte & Remediations', 'Shell-Skripte (macOS)'], platform: 'macOS' },
  { key: 'customattr', label: 'Benutzerdefinierte Attribute (macOS)', path: DM + '/deviceCustomAttributeShellScripts', expand: 'assignments', kind: 'script', content: ['scriptContent'], fixed: ['Skripte & Remediations', 'Benutzerdefinierte Attribute (macOS)'], platform: 'macOS' },
  { key: 'remediation', label: 'Remediations', path: DM + '/deviceHealthScripts', expand: 'assignments', kind: 'script', content: ['detectionScriptContent', 'remediationScriptContent'], fixed: ['Skripte & Remediations', 'Remediations'], platform: 'Windows' },
  { key: 'autopilot', label: 'Autopilot-Profile', path: DM + '/windowsAutopilotDeploymentProfiles', expand: 'assignments', kind: 'generic', fixed: ['Enrollment', 'Autopilot-Profile'], platform: 'Windows' },
  { key: 'enrollment', label: 'Registrierung (ESP, Einschränkungen, Windows Hello)', path: DM + '/deviceEnrollmentConfigurations', expand: 'assignments', kind: 'enrollment' },
  { key: 'aeprofiles', label: 'Android Enterprise-Registrierungsprofile', path: DM + '/androidDeviceOwnerEnrollmentProfiles', expand: null, kind: 'generic', assignable: false, fixed: ['Enrollment', 'Android Enterprise-Registrierungsprofile'], platform: 'Android Enterprise' },
  { key: 'apns', label: 'Apple MDM-Push-Zertifikat (APNs)', path: DM + '/applePushNotificationCertificate', kind: 'apns', single: true },
  { key: 'ade', label: 'Apple ADE-Token & Registrierungsprofile', path: DM + '/depOnboardingSettings', kind: 'ade' },
  { key: 'vpp', label: 'Apple VPP-Token', path: DAM + '/vppTokens', kind: 'vpp' },
  { key: 'mgp', label: 'Managed Google Play', path: DM + '/androidManagedStoreAccountEnterpriseSettings', kind: 'mgp', single: true },
  { key: 'mtd', label: 'Mobile Threat Defense / Defender for Endpoint', path: DM + '/mobileThreatDefenseConnectors', kind: 'mtd' },
  { key: 'partner', label: 'Geräteverwaltungs-Partner (z. B. Jamf)', path: DM + '/deviceManagementPartners', kind: 'partner' },
  { key: 'filters', label: 'Zuweisungsfilter', path: DM + '/assignmentFilters', expand: null, kind: 'filter', assignable: false, fixed: ['Mandant & Verwaltung', 'Zuweisungsfilter'] },
  { key: 'scopetags', label: 'Bereichsmarkierungen (Scope Tags)', path: DM + '/roleScopeTags', expand: 'assignments', kind: 'generic', assignable: false, fixed: ['Mandant & Verwaltung', 'Bereichsmarkierungen (Scope Tags)'] },
  { key: 'roles', label: 'Intune-Rollen', path: DM + '/roleDefinitions', expand: 'roleAssignments', kind: 'role', assignable: false, fixed: ['Mandant & Verwaltung', 'Intune-Rollen'] },
  { key: 'categories', label: 'Gerätekategorien', path: DM + '/deviceCategories', expand: null, kind: 'generic', assignable: false, fixed: ['Mandant & Verwaltung', 'Gerätekategorien'] },
  { key: 'terms', label: 'Nutzungsbedingungen', path: DM + '/termsAndConditions', expand: 'assignments', kind: 'generic', fixed: ['Mandant & Verwaltung', 'Nutzungsbedingungen'] },
  { key: 'branding', label: 'Unternehmensportal-Branding', path: DM + '/intuneBrandingProfiles', expand: 'assignments', kind: 'generic', fixed: ['Mandant & Verwaltung', 'Unternehmensportal-Branding'] },
  { key: 'notifications', label: 'Benachrichtigungsvorlagen', path: DM + '/notificationMessageTemplates', expand: 'localizedNotificationMessages', kind: 'notification', assignable: false, fixed: ['Mandant & Verwaltung', 'Benachrichtigungsvorlagen'] },
  { key: 'tenantsettings', label: 'Mandanteneinstellungen', path: DM, kind: 'single', assignable: false, fixed: ['Mandant & Verwaltung', 'Mandanteneinstellungen'] },
  { key: 'devices', label: 'Geräteinventar (Windows, iOS, Android, macOS)', path: DM + '/managedDevices', kind: 'devices' },
  { key: 'apdevices', label: 'Autopilot-Geräte', path: DM + '/windowsAutopilotDeviceIdentities', kind: 'apdevices' }
];

function listUrl(src, withExpand) {
  const q = [];
  if (src.filter) q.push('$filter=' + encodeURIComponent(src.filter));
  if (withExpand && src.expand) q.push('$expand=' + src.expand);
  return '/beta' + src.path + (q.length ? '?' + q.join('&') : '');
}

async function listSource(src) {
  if (src.single) {
    try { return { items: [await get('/beta' + src.path)], expanded: true }; } catch (e) {
      if (e instanceof GraphError && (e.status === 404 || e.status === 400)) return { items: [], expanded: true, notConfigured: true };
      throw e;
    }
  }
  if (src.kind === 'devices') return { items: await getAll('/beta' + src.path + '?$select=' + DEVICE_SELECT), expanded: true };
  if (src.kind === 'apdevices') return { items: await getAll('/beta' + src.path), expanded: true };
  if (src.kind === 'single') {
    const o = await get('/beta' + DM + '?$select=id,settings,intuneAccountId,subscriptionState');
    return { items: [o], expanded: true };
  }
  try {
    return { items: await getAll(listUrl(src, true)), expanded: !!src.expand };
  } catch (e) {
    if (!(e instanceof GraphError) || (e.status !== 400 && e.status !== 500) || !src.expand) {
      if (e instanceof GraphError && e.status === 400 && src.filter) {
        return { items: await getAll('/beta' + src.path + (src.expand ? '?$expand=' + src.expand : '')), expanded: !!src.expand };
      }
      throw e;
    }
    // Ohne $expand erneut versuchen, Zuweisungen dann einzeln nachladen.
    const simpler = src.expand.includes('assignments') ? 'assignments' : null;
    if (simpler && simpler !== src.expand) {
      try { return { items: await getAll('/beta' + src.path + '?$expand=assignments' + (src.filter ? '&$filter=' + encodeURIComponent(src.filter) : '')), expanded: true }; } catch (e2) { /* weiter */ }
    }
    return { items: await getAll(listUrl(src, false)), expanded: false };
  }
}

const isOk = (r) => r && r.status >= 200 && r.status < 300;

export async function scanTenant(onProgress) {
  const warnings = [];
  const log = (key, label, state, info) => onProgress && onProgress({ key, label, state, info });

  // Mandant
  let tenant = { id: '', displayName: '', domain: '' };
  try {
    const org = await get('/v1.0/organization?$select=id,displayName,verifiedDomains');
    const o = (org.value || [])[0] || {};
    const def = (o.verifiedDomains || []).find((d) => d.isDefault) || (o.verifiedDomains || [])[0] || {};
    const init = (o.verifiedDomains || []).find((d) => d.isInitial) || {};
    tenant = { id: o.id, displayName: o.displayName || '', domain: def.name || '', initialDomain: init.name || '' };
  } catch (e) { warnings.push({ source: 'Mandant', message: e.message }); }

  // Hilfsdaten: Vorlagen für ältere Intents
  let templates = new Map();
  try {
    for (const t of await getAll('/beta' + DM + '/templates?$select=id,displayName,templateType,templateSubtype,platformType')) templates.set(t.id, t);
  } catch (e) { /* optional */ }

  const objects = [];
  const raw = {};
  let devices = [];
  let autopilot = [];
  for (const src of SOURCES) {
    log(src.key, src.label, 'running');
    let res;
    try {
      res = await listSource(src);
    } catch (e) {
      const msg = e instanceof GraphError ? (e.status === 403 ? 'Keine Berechtigung (403) – fehlende Graph-Berechtigung oder Intune-Rolle.' : (e.status === 404 || e.status === 400) ? 'In diesem Mandanten nicht verfügbar oder nicht lizenziert (' + e.status + ').' : e.status + ' ' + e.message) : e.message;
      warnings.push({ source: src.label, message: msg });
      log(src.key, src.label, 'error', msg);
      continue;
    }
    let items = res.items || [];
    if (src.kind === 'devices') { devices = items.map(normalizeDevice); raw[src.key] = devices.length; log(src.key, src.label, 'done', devices.length + ' Geräte'); continue; }
    if (src.kind === 'apdevices') { autopilot = items.map(normalizeAutopilot); raw[src.key] = autopilot.length; log(src.key, src.label, 'done', autopilot.length + ' Geräte'); continue; }
    if (src.kind === 'mtd') items = items.filter((c) => c.partnerState && c.partnerState !== 'notSetUp');
    if (src.kind === 'partner') items = items.filter((p) => p.isConfigured === true || (p.partnerState && !['unknown', 'unavailable', 'notSetUp', 'notConfigured'].includes(p.partnerState)));
    if (res.notConfigured) { raw[src.key] = 0; log(src.key, src.label, 'done', 'nicht eingerichtet'); continue; }
    if (src.kind === 'role') items = items.filter((r) => !r.isBuiltIn || (r.roleAssignments && r.roleAssignments.length));
    if (src.kind === 'notification') { /* alle */ }

    // Nachladen per $batch
    const paths = [];
    const byPath = new Map();
    const want = (item, p, k) => { paths.push(p); byPath.set(p, [item, k]); };
    for (const it of items) {
      const base = src.path + '/' + it.id;
      if (src.kind === 'catalog') want(it, base + '/settings?$expand=settingDefinitions&$top=1000', 'settings');
      if (src.kind === 'admx') want(it, base + '/definitionValues?$expand=definition($select=id,displayName,classType,categoryPath),presentationValues($expand=presentation($select=label))', 'definitionValues');
      if (src.kind === 'intent') { want(it, base + '/settings', 'intentSettings'); want(it, base + '/assignments', 'assignments'); }
      if (src.kind === 'script') want(it, base, 'full');
      if (src.kind === 'ade') want(it, base + '/enrollmentProfiles', 'enrollmentProfiles');
      if (!res.expanded && src.expand && src.expand.includes('assignments') && src.assignable !== false) want(it, base + '/assignments', 'assignments');
    }
    if (paths.length) {
      log(src.key, src.label, 'running', items.length + ' Objekte, lade Details …');
      const results = await batchGet(paths);
      for (const [p, r] of results) {
        const [item, k] = byPath.get(p);
        if (!isOk(r)) {
          if (k === 'definitionValues') {
            // Fallback ohne presentationValues
            try { item.definitionValues = await getAll('/beta' + src.path + '/' + item.id + '/definitionValues?$expand=definition($select=id,displayName,classType,categoryPath)'); } catch (e) { item._detailError = true; }
          } else if (k === 'settings') {
            try { item.settings = await getAll('/beta' + src.path + '/' + item.id + '/settings?$expand=settingDefinitions'); } catch (e) { item._detailError = true; }
          } else item._detailError = true;
          continue;
        }
        if (k === 'full') Object.assign(item, r.body);
        else if (k === 'settings') item.settings = r.body.value || [];
        else if (k === 'definitionValues') item.definitionValues = r.body.value || [];
        else if (k === 'intentSettings') item.intentSettings = r.body.value || [];
        else if (k === 'assignments') item.assignments = r.body.value || [];
        else if (k === 'enrollmentProfiles') item.enrollmentProfiles = r.body.value || [];
      }
      const failed = items.filter((i) => i._detailError).length;
      if (failed) warnings.push({ source: src.label, message: failed + ' Objekt(e) ohne vollständige Details.' });
    }

    for (const it of items) {
      try {
        if (src.kind === 'ade') { objects.push(adeObject(it)); for (const p of it.enrollmentProfiles || []) objects.push(adeProfileObject(p, it.tokenName)); continue; }
        if (src.kind === 'apns') { objects.push(apnsObject(it)); continue; }
        if (src.kind === 'vpp') { objects.push(vppObject(it)); continue; }
        if (src.kind === 'mgp') { objects.push(mgpObject(it)); continue; }
        if (src.kind === 'mtd') { objects.push(mtdObject(it)); continue; }
        if (src.kind === 'partner') { objects.push(partnerObject(it)); continue; }
        objects.push(toObject(src, it, templates));
      } catch (e) { warnings.push({ source: src.label, message: 'Aufbereitung fehlgeschlagen für „' + (it.displayName || it.name || it.id) + '“: ' + e.message }); }
    }
    raw[src.key] = items.length;
    log(src.key, src.label, 'done', items.length + (items.length === 1 ? ' Objekt' : ' Objekte'));
  }

  // Namen auflösen: Gruppen, Filter, Scope Tags
  log('resolve', 'Gruppen, Filter und Bereichsmarkierungen auflösen', 'running');
  const filters = new Map(objects.filter((o) => o.sourceKey === 'filters').map((o) => [o.id, o]));
  const scopeTags = new Map(objects.filter((o) => o.sourceKey === 'scopetags').map((o) => [o.id, o.name]));
  scopeTags.set('0', 'Default');
  const groupIds = new Set();
  for (const o of objects) {
    for (const a of o.rawAssignments) { const n = normalizeAssignment(a); if (n.groupId && n.target !== 'collection') groupIds.add(n.groupId); }
    for (const ra of o.roleAssignments || []) { (ra.members || []).forEach((g) => groupIds.add(g)); (ra.resourceScopes || []).forEach((g) => groupIds.add(g)); }
  }
  const groups = {};
  if (groupIds.size) {
    const paths = [...groupIds].map((id) => '/groups/' + id + '?$select=id,displayName,groupTypes,membershipRule,securityEnabled');
    const results = await batchGet(paths);
    for (const [p, r] of results) {
      const id = p.split('/')[2].split('?')[0];
      if (isOk(r)) groups[id] = { name: r.body.displayName, dynamic: (r.body.groupTypes || []).includes('DynamicMembership'), rule: r.body.membershipRule || '' };
      else if (r.status === 404) groups[id] = { name: null, deleted: true };
      else groups[id] = { name: null, unknown: true };
    }
  }
  for (const o of objects) finishObject(o, groups, filters, scopeTags);
  log('resolve', 'Gruppen, Filter und Bereichsmarkierungen auflösen', 'done', Object.keys(groups).length + ' Gruppen');

  return {
    app: 'Intune Inspector',
    formatVersion: 1,
    tenant,
    scannedAt: new Date().toISOString(),
    groups,
    warnings,
    counts: raw,
    objects,
    devices,
    autopilot
  };
}

function toObject(src, it, templates) {
  let area = src.fixed ? src.fixed[0] : 'Konfiguration';
  let category = src.fixed ? src.fixed[1] : src.label;
  const o = baseObject(src.key, it, area, category);
  o.platform = src.platform || platformFromType(it['@odata.type']);
  o.assignable = src.assignable !== false;
  const meta = [];

  switch (src.kind) {
    case 'catalog': {
      if (!src.fixed) [o.area, o.category] = catalogCategory(it);
      o.platform = platformFromField(it.platforms) || o.platform;
      o.name = it.name || o.name;
      if (it.templateReference && it.templateReference.templateDisplayName) meta.push(['Vorlage', it.templateReference.templateDisplayName + (it.templateReference.templateDisplayVersion ? ' (' + it.templateReference.templateDisplayVersion + ')' : '')]);
      if (it.technologies) meta.push(['Technologie', it.technologies]);
      o.settings = flattenCatalog(it.settings);
      o.raw = Object.assign({}, it, { settings: (it.settings || []).map((s) => ({ settingInstance: s.settingInstance })) });
      break;
    }
    case 'deviceconfig': {
      [o.area, o.category] = deviceConfigCategory(it['@odata.type']);
      if (Array.isArray(it.omaSettings)) {
        for (const s of it.omaSettings) {
          const val = s.isEncrypted ? '(verschlüsselt)' : fmtValue(s.value);
          o.settings.push({ key: 'oma:' + s.omaUri, label: (s.displayName || 'OMA-URI') + ' — ' + s.omaUri, value: val });
        }
      }
      if (it.payloadName || it.payloadFileName) o.settings.push({ key: 'payload', label: 'Profil-Datei', value: (it.payloadName || '') + ' ' + (it.payloadFileName ? '(' + it.payloadFileName + ')' : '') });
      o.settings.push(...flattenProps(it).map((r) => Object.assign(r, { key: o.odataType + '.' + r.key })));
      o.raw = stripHeavy(it);
      meta.push(['Profiltyp', humanize(o.odataType)]);
      break;
    }
    case 'admx': {
      for (const dv of it.definitionValues || []) {
        const d = dv.definition || {};
        const scope = d.classType === 'user' ? 'Benutzer' : 'Computer';
        o.settings.push({ key: 'admx:' + (d.id || dv.id), label: d.displayName || dv.id, value: dv.enabled ? 'Aktiviert' : 'Deaktiviert', path: scope + (d.categoryPath ? ' › ' + d.categoryPath.replace(/^\\/, '').replace(/\\/g, ' › ') : '') });
        for (const pv of dv.presentationValues || []) {
          const label = (pv.presentation && pv.presentation.label) || 'Wert';
          let v = pv.value !== undefined ? pv.value : pv.values;
          if (Array.isArray(v)) v = v.map((x) => (x && typeof x === 'object') ? (x.name ? x.name + '=' + x.value : x.value) : x).join(', ');
          o.settings.push({ key: 'admx:' + (d.id || dv.id) + ':' + label, label, value: fmtValue(v), depth: 1 });
        }
      }
      o.raw = stripHeavy(it);
      break;
    }
    case 'intent': {
      const t = templates.get(it.templateId) || {};
      const tt = String(t.templateType || '');
      if (/baseline/i.test(tt)) { o.area = 'Security Baselines'; o.category = t.displayName || 'Security Baseline'; }
      else if (tt === 'securityTemplate' || /endpointSecurity/i.test(tt)) { o.area = 'Endpoint Security'; o.category = humanize(t.templateSubtype || 'Endpoint Security') + ' (alte Vorlage)'; }
      else { o.area = 'Konfiguration'; o.category = t.displayName || 'Vorlage'; }
      o.platform = platformFromField(t.platformType) || 'Windows';
      if (t.displayName) meta.push(['Vorlage', t.displayName]);
      for (const s of it.intentSettings || []) {
        let v = s.valueJson;
        try { v = JSON.parse(s.valueJson); } catch (e) { /* roh */ }
        if (v === null || v === undefined || v === '' || v === 'notConfigured') continue;
        const id = String(s.definitionId || '');
        o.settings.push({ key: 'intent:' + id, label: humanize(id.split('_').slice(-1)[0]), value: fmtValue(v) });
      }
      o.raw = stripHeavy(it);
      break;
    }
    case 'compliance': {
      o.category = 'Compliance-Richtlinie';
      o.area = 'Compliance';
      o.settings = flattenProps(it).map((r) => Object.assign(r, { key: o.odataType + '.' + r.key }));
      for (const rule of it.scheduledActionsForRule || []) {
        for (const c of rule.scheduledActionConfigurations || []) {
          const hrs = c.gracePeriodHours || 0;
          o.settings.push({ key: 'action:' + c.actionType, label: 'Aktion bei Nichtkonformität', value: humanize(c.actionType) + (hrs ? ' nach ' + (hrs % 24 === 0 ? (hrs / 24) + ' Tag(en)' : hrs + ' Std.') : ' sofort') });
        }
      }
      o.raw = stripHeavy(it);
      break;
    }
    case 'app': {
      o.area = 'Apps';
      o.category = appCategory(it['@odata.type']);
      if (it.publisher) meta.push(['Herausgeber', it.publisher]);
      const ver = it.displayVersion || it.version || it.versionNumber || it.identityVersion || it.bundleVersion;
      if (ver) meta.push(['Version', ver]);
      const skip = new Set(['publisher', 'displayVersion', 'rules', 'detectionRules', 'requirementRules', 'installExperience', 'returnCodes', 'msiInformation', 'minimumSupportedOperatingSystem', 'applicableArchitectures', 'allowedArchitectures', 'excludedApps']);
      if (it.installExperience) o.settings.push({ key: 'installExperience', label: 'Installationsverhalten', value: fmtValue(it.installExperience) });
      if (it.minimumSupportedOperatingSystem) {
        const min = Object.entries(it.minimumSupportedOperatingSystem).filter(([k, v]) => v === true).map(([k]) => k.replace(/^v/, '').replace(/_/g, '.'));
        if (min.length) o.settings.push({ key: 'minOS', label: 'Mindest-Betriebssystem', value: min[0] });
      }
      if (it.applicableArchitectures || it.allowedArchitectures) o.settings.push({ key: 'arch', label: 'Architekturen', value: String(it.allowedArchitectures || it.applicableArchitectures) });
      const rules = it.rules || it.detectionRules || [];
      for (const r of rules) {
        const rt = shortType(r['@odata.type']).replace(/^win32LobApp/, '').replace(/Rule$/, '');
        const role = r.ruleType ? (r.ruleType === 'detection' ? 'Erkennung' : 'Anforderung') : 'Erkennung';
        let desc = humanize(rt);
        if (r.path || r.keyPath) desc += ': ' + (r.path || r.keyPath) + (r.fileOrFolderName ? '\\' + r.fileOrFolderName : '') + (r.valueName ? ' [' + r.valueName + ']' : '');
        if (r.productCode) desc += ': ' + r.productCode;
        if (r.scriptContent) { desc += ' (Skript)'; o.code.push({ title: role + 'sskript', lang: 'powershell', content: decodeB64(r.scriptContent) }); }
        o.settings.push({ key: 'rule:' + role + ':' + desc, label: role + 'sregel', value: desc });
      }
      for (const r of it.requirementRules || []) o.settings.push({ key: 'req', label: 'Anforderungsregel', value: fmtValue(r) });
      if (Array.isArray(it.excludedApps) || (it.excludedApps && typeof it.excludedApps === 'object')) {
        const ex = Object.entries(it.excludedApps || {}).filter(([k, v]) => v === true && !k.startsWith('@')).map(([k]) => humanize(k));
        if (ex.length) o.settings.push({ key: 'excludedApps', label: 'Ausgeschlossene Office-Apps', value: ex.join(', ') });
      }
      o.settings.push(...flattenProps(it, skip).map((r) => Object.assign(r, { key: 'app.' + r.key })));
      o.raw = stripHeavy(it);
      break;
    }
    case 'mam': {
      const apps = (it.apps || []).map((a) => { const m = a.mobileAppIdentifier || {}; return m.bundleId || m.packageId || m.windowsAppId || a.id; });
      if (apps.length) o.settings.push({ key: 'apps', label: 'Geschützte Apps', value: apps.join(', ') });
      if (it.appGroupType) meta.push(['App-Auswahl', humanize(it.appGroupType)]);
      o.settings.push(...flattenProps(it, new Set(['appGroupType', 'deployedAppCount', 'isAssigned'])).map((r) => Object.assign(r, { key: o.odataType + '.' + r.key })));
      o.raw = stripHeavy(it);
      break;
    }
    case 'appconfig': {
      o.platform = platformFromType(it['@odata.type']);
      for (const s of it.settings || []) o.settings.push({ key: 'cfg:' + s.appConfigKey, label: s.appConfigKey, value: fmtValue(s.appConfigKeyValue) + (s.appConfigKeyType ? ' (' + s.appConfigKeyType + ')' : '') });
      if (it.encodedSettingXml) o.code.push({ title: 'Konfigurations-XML', lang: 'xml', content: decodeB64(it.encodedSettingXml) });
      if (it.payloadJson) o.code.push({ title: 'Konfiguration (JSON)', lang: 'json', content: decodeB64(it.payloadJson) });
      if (it.targetedMobileApps && it.targetedMobileApps.length) o.settings.push({ key: 'targets', label: 'Ziel-Apps (IDs)', value: it.targetedMobileApps.join(', ') });
      o.settings.push(...flattenProps(it).map((r) => Object.assign(r, { key: 'cfg.' + r.key })));
      o.raw = stripHeavy(it);
      break;
    }
    case 'appconfigmam': {
      const apps = (it.apps || []).map((a) => { const m = a.mobileAppIdentifier || {}; return m.bundleId || m.packageId || a.id; });
      if (apps.length) o.settings.push({ key: 'apps', label: 'Ziel-Apps', value: apps.join(', ') });
      for (const s of it.customSettings || []) o.settings.push({ key: 'cfg:' + s.name, label: s.name, value: fmtValue(s.value) });
      o.settings.push(...flattenProps(it, new Set(['deployedAppCount', 'isAssigned'])).map((r) => Object.assign(r, { key: 'mamcfg.' + r.key })));
      o.raw = stripHeavy(it);
      break;
    }
    case 'script': {
      for (const k of src.content || []) {
        if (it[k]) o.code.push({ title: k === 'remediationScriptContent' ? 'Korrekturskript' : k === 'detectionScriptContent' ? 'Erkennungsskript' : 'Skriptinhalt', lang: src.platform === 'macOS' ? 'bash' : 'powershell', content: decodeB64(it[k]) });
      }
      if (it.publisher) meta.push(['Herausgeber', it.publisher]);
      o.settings.push(...flattenProps(it, new Set(['publisher', 'highestAvailableVersion', 'isGlobalScript'])).map((r) => Object.assign(r, { key: src.key + '.' + r.key })));
      o.raw = stripHeavy(it);
      break;
    }
    case 'enrollment': {
      o.area = 'Enrollment';
      o.category = enrollmentCategory(it['@odata.type']);
      if (it.priority !== undefined) meta.push(['Priorität', it.priority === 0 ? 'Standard (0)' : String(it.priority)]);
      o.settings = flattenProps(it).map((r) => Object.assign(r, { key: o.odataType + '.' + r.key }));
      o.raw = stripHeavy(it);
      break;
    }
    case 'filter': {
      o.platform = platformFromField(it.platform) || humanize(it.platform || '');
      o.settings.push({ key: 'rule', label: 'Regel', value: it.rule || '' });
      if (it.assignmentFilterManagementType) o.settings.push({ key: 'mgmt', label: 'Gilt für', value: it.assignmentFilterManagementType === 'apps' ? 'Verwaltete Apps' : 'Verwaltete Geräte' });
      o.raw = stripHeavy(it);
      break;
    }
    case 'role': {
      o.description = it.description || '';
      meta.push(['Typ', it.isBuiltIn ? 'Integrierte Rolle' : 'Benutzerdefinierte Rolle']);
      const perms = [];
      for (const rp of it.rolePermissions || []) for (const ra of rp.resourceActions || []) perms.push(...(ra.allowedResourceActions || []));
      if (perms.length && !it.isBuiltIn) o.settings.push({ key: 'perms', label: 'Berechtigungen (' + perms.length + ')', value: perms.map((p) => p.replace('Microsoft.Intune_', '').replace(/_/g, ' ')).join(', ') });
      else if (perms.length) o.settings.push({ key: 'perms', label: 'Berechtigungen', value: perms.length + ' (integriert)' });
      o.roleAssignments = it.roleAssignments || [];
      o.raw = stripHeavy(it);
      break;
    }
    case 'notification': {
      for (const m of it.localizedNotificationMessages || []) o.settings.push({ key: 'msg:' + m.locale, label: 'Nachricht (' + m.locale + ')' + (m.isDefault ? ' – Standard' : ''), value: (m.subject || '') + ' — ' + (m.messageTemplate || '') });
      o.settings.push(...flattenProps(it).map((r) => Object.assign(r, { key: 'notif.' + r.key })));
      o.raw = stripHeavy(it);
      break;
    }
    case 'single': {
      o.uid = 'tenantsettings:settings';
      o.name = 'Compliance-Einstellungen des Mandanten';
      o.settings = flattenProps(it.settings || {}).map((r) => Object.assign(r, { key: 'tenant.' + r.key }));
      o.raw = { settings: it.settings };
      break;
    }
    default: {
      o.settings = flattenProps(it).map((r) => Object.assign(r, { key: src.key + '.' + r.key }));
      o.raw = stripHeavy(it);
    }
  }
  o.meta = meta;
  return o;
}

function stripHeavy(it) {
  const c = Object.assign({}, it);
  for (const k of ['largeIcon', 'driverInventories', 'themeColorLogo', 'lightBackgroundLogo', 'landingPageCustomizedImage', 'qrCodeImage', 'definitionValues', 'intentSettings', '_detailError']) delete c[k];
  return c;
}

export function groupLabel(groups, id) {
  const g = groups[id];
  if (!g) return 'Gruppe ' + id;
  if (g.deleted) return '(gelöschte Gruppe ' + id.slice(0, 8) + '…)';
  if (!g.name) return 'Gruppe ' + id.slice(0, 8) + '…';
  return g.name;
}

export function finishObject(o, groups, filters, scopeTags) {
  o.assignments = o.rawAssignments.map((a) => {
    const n = normalizeAssignment(a);
    if (n.target === 'allDevices') n.label = 'Alle Geräte';
    else if (n.target === 'allUsers') n.label = 'Alle Benutzer';
    else if (n.target === 'collection') n.label = 'ConfigMgr-Sammlung ' + n.groupId;
    else {
      n.label = groupLabel(groups, n.groupId);
      if (groups[n.groupId] && groups[n.groupId].deleted) n.deletedGroup = true;
      if (groups[n.groupId] && groups[n.groupId].dynamic) n.dynamic = true;
    }
    if (n.filterId) n.filterName = filters.has(n.filterId) ? filters.get(n.filterId).name : n.filterId;
    return n;
  });
  delete o.rawAssignments;
  o.scopeTags = (o.scopeTagIds || []).map((id) => scopeTags.get(String(id)) || String(id));
  delete o.scopeTagIds;
  if (o.roleAssignments) {
    for (const ra of o.roleAssignments) {
      const members = (ra.members || []).map((g) => groupLabel(groups, g)).join(', ') || '—';
      const SCOPE = { allDevices: 'Alle Geräte', allLicensedUsers: 'Alle Benutzer', allDevicesAndLicensedUsers: 'Alle Geräte und Benutzer' };
      const scope = ra.scopeType && ra.scopeType !== 'resourceScope' ? (SCOPE[ra.scopeType] || humanize(ra.scopeType)) : ((ra.resourceScopes || []).map((g) => groupLabel(groups, g)).join(', ') || '—');
      o.settings.push({ key: 'ra:' + ra.id, label: 'Zuweisung „' + (ra.displayName || ra.id) + '“', value: 'Mitglieder: ' + members + ' · Bereich: ' + scope });
    }
    delete o.roleAssignments;
  }
  return o;
}

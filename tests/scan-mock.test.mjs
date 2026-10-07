// Mock MSAL + Graph, run scanTenant end-to-end
globalThis.location = { origin: 'http://localhost:8400' };
globalThis.sessionStorage = { clear(){} };
globalThis.msal = { PublicClientApplication: class { constructor(c){this.c=c} async initialize(){} getAllAccounts(){return []} async loginPopup(){return {account:{username:'admin@kunde.de'}}} setActiveAccount(){} async acquireTokenSilent(){return {accessToken:'t'}} } };
const B = 'https://graph.microsoft.com';
const ga = (t, extra) => Object.assign({ target: Object.assign({ '@odata.type': '#microsoft.graph.' + t }, extra || {}) });
const data = {
  '/v1.0/organization?$select=id,displayName,verifiedDomains': { value: [{ id: 'tid-1', displayName: 'Kunde AG', verifiedDomains: [{ name: 'kunde.de', isDefault: true }, { name: 'kunde.onmicrosoft.com', isInitial: true }] }] },
  '/beta/deviceManagement/templates?$select=id,displayName,templateType,templateSubtype,platformType': { value: [{ id: 'tpl1', displayName: 'MDM Security Baseline', templateType: 'securityBaseline', platformType: 'windows10AndLater' }] },
  '/beta/deviceManagement/configurationPolicies?$expand=assignments': { value: [{ id: 'cp1', name: 'Firewall', platforms: 'windows10', technologies: 'mdm,microsoftSense', templateReference: { templateFamily: 'endpointSecurityFirewall', templateDisplayName: 'Windows Firewall' }, lastModifiedDateTime: '2026-01-01T00:00:00Z', roleScopeTagIds: ['0'], assignments: [ga('groupAssignmentTarget', { groupId: 'g1', deviceAndAppManagementAssignmentFilterId: 'f1', deviceAndAppManagementAssignmentFilterType: 'include' }), ga('exclusionGroupAssignmentTarget', { groupId: 'gdel' })] }], '@odata.nextLink': B + '/beta/page2' },
  '/beta/page2': { value: [{ id: 'cp2', name: 'Catalog X', platforms: 'windows10', technologies: 'mdm', templateReference: { templateFamily: 'none' }, assignments: [] }] },
  '/beta/deviceManagement/compliancePolicies?$expand=assignments': { error: 400 },
  '/beta/deviceManagement/compliancePolicies': { value: [] },
  '/beta/deviceManagement/deviceConfigurations?$expand=assignments': { value: [
    { '@odata.type': '#microsoft.graph.windowsUpdateForBusinessConfiguration', id: 'dc1', displayName: 'Ring 1', qualityUpdatesDeferralPeriodInDays: 7, assignments: [ga('allDevicesAssignmentTarget')] },
    { '@odata.type': '#microsoft.graph.windows10CustomConfiguration', id: 'dc2', displayName: 'Custom', omaSettings: [{ displayName: 'X', omaUri: './Device/X', value: 1 }, { displayName: 'S', omaUri: './Device/S', isEncrypted: true, value: 'enc' }], assignments: [] }] },
  '/beta/deviceManagement/groupPolicyConfigurations?$expand=assignments': { value: [{ id: 'gp1', displayName: 'ADMX', assignments: [ga('groupAssignmentTarget', { groupId: 'g1' })] }] },
  '/beta/deviceManagement/intents': { value: [{ id: 'in1', displayName: 'Old Baseline', templateId: 'tpl1' }] },
  '/beta/deviceManagement/deviceCompliancePolicies?$expand=assignments,scheduledActionsForRule($expand=scheduledActionConfigurations)': { value: [{ '@odata.type': '#microsoft.graph.windows10CompliancePolicy', id: 'co1', displayName: 'Comp', passwordRequired: true, scheduledActionsForRule: [{ scheduledActionConfigurations: [{ actionType: 'block', gracePeriodHours: 72 }] }], assignments: [ga('allLicensedUsersAssignmentTarget')] }] },
  '/beta/deviceManagement/deviceComplianceScripts': { error: 403 },
  '/beta/deviceAppManagement/mobileApps?$filter=isAssigned%20eq%20true&$expand=assignments': { value: [{ '@odata.type': '#microsoft.graph.win32LobApp', id: 'app1', displayName: '7-Zip', publisher: 'Igor', displayVersion: '24', installCommandLine: 'x.exe', installExperience: { runAsAccount: 'system' }, rules: [{ '@odata.type': '#microsoft.graph.win32LobAppProductCodeRule', ruleType: 'detection', productCode: '{abc}' }], assignments: [{ intent: 'required', target: { '@odata.type': '#microsoft.graph.groupAssignmentTarget', groupId: 'g1' }, settings: { notifications: 'hideAll' } }] }] },
  '/beta/deviceManagement/deviceManagementScripts?$expand=assignments': { error: 400 },
  '/beta/deviceManagement/deviceManagementScripts': { value: [{ id: 'ps1', displayName: 'Script', fileName: 'a.ps1', runAsAccount: 'system' }] },
  '/beta/deviceManagement/deviceHealthScripts?$expand=assignments': { value: [{ id: 'hs1', displayName: 'Remed', assignments: [{ runSchedule: { '@odata.type': '#microsoft.graph.deviceHealthScriptDailySchedule', interval: 1, time: '08:00:00' }, target: { '@odata.type': '#microsoft.graph.groupAssignmentTarget', groupId: 'g1' } }] }] },
  '/beta/deviceManagement/assignmentFilters': { value: [{ id: 'f1', displayName: 'Nur Firmengeräte', platform: 'windows10AndLater', rule: '(device.deviceOwnership -eq "Corporate")' }] },
  '/beta/deviceManagement/roleScopeTags?$expand=assignments': { value: [{ id: '0', displayName: 'Default' }] },
  '/beta/deviceManagement/roleDefinitions?$expand=roleAssignments': { value: [{ id: 'r1', displayName: 'Custom Role', isBuiltIn: false, rolePermissions: [{ resourceActions: [{ allowedResourceActions: ['Microsoft.Intune_ManagedDevices_Read'] }] }], roleAssignments: [{ id: 'ra1', displayName: 'HD', members: ['g1'], resourceScopes: [], scopeType: 'allDevices' }] }, { id: 'r2', displayName: 'Builtin', isBuiltIn: true, roleAssignments: [] }] },
  '/beta/deviceManagement/applePushNotificationCertificate': { appleIdentifier: 'it@kunde.de', expirationDateTime: new Date(Date.now()+10*864e5).toISOString(), topicIdentifier: 'com.apple.mgmt.x' },
  '/beta/deviceManagement/depOnboardingSettings': { value: [{ id: 'dep1', tokenName: 'ABM', appleIdentifier: 'abm@kunde.de', tokenExpirationDateTime: new Date(Date.now()-5*864e5).toISOString(), lastSyncErrorCode: 0 }] },
  '/beta/deviceAppManagement/vppTokens': { value: [{ id: 'v1', organizationName: 'Kunde', state: 'valid', expirationDateTime: new Date(Date.now()+300*864e5).toISOString() }] },
  '/beta/deviceManagement/androidManagedStoreAccountEnterpriseSettings': { error: 404 },
  '/beta/deviceManagement/mobileThreatDefenseConnectors': { value: [{ id: 'fc780465-2017-40d4-a0c5-307022471b92', partnerState: 'enabled', windowsEnabled: true }, { id: 'x', partnerState: 'notSetUp' }] },
  '/beta/deviceManagement/deviceManagementPartners': { value: [{ id: 'p1', displayName: 'Jamf', isConfigured: false, partnerState: 'unknown' }] },
  '/beta/deviceManagement/windowsAutopilotDeviceIdentities': { value: [{ id: 'a1', serialNumber: 'S1', model: 'M', groupTag: 'GT', enrollmentState: 'enrolled', deploymentProfileAssignmentStatus: 'notAssigned' }] },
  '/beta/deviceManagement?$select=id,settings,intuneAccountId,subscriptionState': { id: 'dm', settings: { secureByDefault: true, deviceComplianceCheckinThresholdDays: 30 } }
};
const batchData = {
  '/deviceManagement/configurationPolicies/cp1/settings?$expand=settingDefinitions&$top=1000': { value: [{ settingInstance: { '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance', settingDefinitionId: 'fw_enable', choiceSettingValue: { value: 'fw_enable_true', children: [] } }, settingDefinitions: [{ id: 'fw_enable', displayName: 'Firewall aktivieren', options: [{ itemId: 'fw_enable_true', displayName: 'Wahr' }] }] }] },
  '/deviceManagement/configurationPolicies/cp2/settings?$expand=settingDefinitions&$top=1000': { value: [{ settingInstance: { '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance', settingDefinitionId: 'fw_enable', choiceSettingValue: { value: 'fw_enable_false' } }, settingDefinitions: [{ id: 'fw_enable', displayName: 'Firewall aktivieren', options: [{ itemId: 'fw_enable_false', displayName: 'Falsch' }] }] }] },
  '/deviceManagement/groupPolicyConfigurations/gp1/definitionValues?$expand=definition($select=id,displayName,classType,categoryPath),presentationValues($expand=presentation($select=label))': { _status: 400 },
  '/deviceManagement/depOnboardingSettings/dep1/enrollmentProfiles': { value: [{ '@odata.type': '#microsoft.graph.depIOSEnrollmentProfile', id: 'ep1', displayName: 'ADE iOS', isDefault: true, supervisedModeEnabled: true }] },
  '/deviceManagement/intents/in1/settings': { value: [{ definitionId: 'deviceConfiguration--x_firewallEnabled', valueJson: 'true' }, { definitionId: 'y_nc', valueJson: '"notConfigured"' }] },
  '/deviceManagement/intents/in1/assignments': { value: [ga('allDevicesAssignmentTarget')] },
  '/deviceManagement/deviceManagementScripts/ps1': { id: 'ps1', displayName: 'Script', scriptContent: Buffer.from('Write-Host "Hallo Ä"').toString('base64') },
  '/deviceManagement/deviceManagementScripts/ps1/assignments': { value: [ga('groupAssignmentTarget', { groupId: 'g2' })] },
  '/deviceManagement/deviceHealthScripts/hs1': { id: 'hs1', displayName: 'Remed', detectionScriptContent: Buffer.from('exit 0').toString('base64'), remediationScriptContent: Buffer.from('exit 1').toString('base64') },
  '/groups/g1?$select=id,displayName,groupTypes,membershipRule,securityEnabled': { displayName: 'GRP-Clients', groupTypes: ['DynamicMembership'] },
  '/groups/g2?$select=id,displayName,groupTypes,membershipRule,securityEnabled': { displayName: 'GRP-Zwei', groupTypes: [] },
  '/groups/gdel?$select=id,displayName,groupTypes,membershipRule,securityEnabled': { _status: 404 }
};
const fallback = { '/beta/deviceManagement/groupPolicyConfigurations/gp1/definitionValues?$expand=definition($select=id,displayName,classType,categoryPath)': { value: [{ id: 'dv1', enabled: true, definition: { id: 'd1', displayName: 'Makros blockieren', classType: 'user', categoryPath: '\\Word\\Sicherheit' } }] } };
let batchCalls = 0, throttled = false;
globalThis.fetch = async (url, opts) => {
  const path = url.replace(B, '');
  const res = (status, body, headers) => ({ ok: status < 300, status, headers: { get: (k) => (headers || {})[k] || null }, json: async () => body });
  if (path === '/beta/$batch') {
    batchCalls++;
    const reqs = JSON.parse(opts.body).requests;
    return res(200, { responses: reqs.map((r) => {
      if (r.url.startsWith('/groups/g2') && !throttled) { throttled = true; return { id: r.id, status: 429, headers: { 'Retry-After': '0' }, body: {} }; }
      const d = batchData[r.url];
      if (!d) return { id: r.id, status: 404, body: { error: { message: 'nf ' + r.url } } };
      if (d._status) return { id: r.id, status: d._status, body: { error: { message: 'x' } } };
      return { id: r.id, status: 200, body: d };
    }) });
  }
  if (path.startsWith('/beta/deviceManagement/managedDevices?$select=')) return res(200, { value: [{ id: 'm1', deviceName: 'PC1', operatingSystem: 'Windows', osVersion: '10.0.26100.1', complianceState: 'compliant', managedDeviceOwnerType: 'company', deviceEnrollmentType: 'windowsAzureADJoin', joinType: 'azureADJoined', isEncrypted: false, lastSyncDateTime: new Date().toISOString() }, { id: 'm2', deviceName: 'iPhone', operatingSystem: 'iOS', osVersion: '26.0', complianceState: 'noncompliant', managedDeviceOwnerType: 'personal', jailBroken: 'False', lastSyncDateTime: '2025-01-01T00:00:00Z' }] });
  const d = data[path] || fallback[path];
  if (!d) return res(404, { error: { code: 'NotFound', message: 'not mocked ' + path } });
  if (d.error) return res(d.error, { error: { code: 'E', message: 'mock ' + d.error } });
  return res(200, d);
};
const G = await import('../web/js/graph.js');
const { scanTenant } = await import('../web/js/scanner.js');
const { analyze } = await import('../web/js/analyze.js');
const X = await import('../web/js/export.js');
await G.initAuth('cid', 'kunde.de'); await G.login();
const snap = await scanTenant((p) => {});
console.log('tenant', snap.tenant);
console.log('warnings', snap.warnings.map(w => w.source + ': ' + w.message));
for (const o of snap.objects) console.log('-', o.area, '|', o.category, '|', o.name, '|', o.platform, '| A:', o.assignments.map(a => a.mode[0] + ':' + a.label + (a.filterName ? '[' + a.filterName + ']' : '') + (a.intent ? '(' + a.intent + ')' : '') + (a.extra ? '{' + a.extra + '}' : '')).join(', '), '| S:', o.settings.map(s => s.label + '=' + s.value).join('; ').slice(0, 160), o.code.length ? '| code:' + o.code.map(c => c.content).join(' / ') : '');
const an = analyze(snap);
console.log('conflicts', an.conflicts.map(c => c.kind + ':' + c.label + ':' + c.sev));
console.log('findings', an.findings.map(f => f.title));
console.log('batchCalls', batchCalls);
console.log('devices', snap.devices.map(d=>d.name+'/'+d.platform+'/'+d.owner+'/'+d.compliance), 'autopilot', snap.autopilot);
console.log('connectors', an.connectors);
const m = X.buildModel(snap, an, { sections: new Set(X.SECTIONS.map(s => s[0])), notes: {} });
console.log('md length', X.toMarkdown(m).length, 'html', X.toHtml(m).length, 'csv', X.toCsvSettings(m).split('\n').length);

import { demoSnapshot, demoOlderSnapshot } from '../web/js/demo.js';
import { analyze, diffSnapshots } from '../web/js/analyze.js';
import { flattenCatalog, normalizeAssignment, flattenProps, deviceConfigCategory, catalogCategory } from '../web/js/normalize.js';
const s = demoSnapshot(); const a = analyze(s);
console.log('total', a.total, 'unassigned', a.unassigned.length, 'conflicts', a.conflicts.map(c=>c.kind+':'+c.sev+':'+c.label));
console.log('findings', a.findings.map(f=>f.title));
console.log('targets', a.targets.map(t=>t.label+'='+t.items.length).join(', '));
console.log('diff', diffSnapshots(demoOlderSnapshot(), s).map(d=>d.kind+' '+d.name+' '+d.details.join(' / ')));
// catalog flatten
const settings=[{settingInstance:{'@odata.type':'#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',settingDefinitionId:'d1',choiceSettingValue:{value:'d1_1',children:[{'@odata.type':'#microsoft.graph.deviceManagementConfigurationSimpleSettingInstance',settingDefinitionId:'d2',simpleSettingValue:{value:5}}]}},settingDefinitions:[{id:'d1',displayName:'Feature X',options:[{itemId:'d1_1',displayName:'Aktiviert'}]},{id:'d2',displayName:'Wert Y'}]},
{settingInstance:{'@odata.type':'#microsoft.graph.deviceManagementConfigurationGroupSettingCollectionInstance',settingDefinitionId:'g',groupSettingCollectionValue:[{children:[{'@odata.type':'#microsoft.graph.deviceManagementConfigurationSimpleSettingInstance',settingDefinitionId:'g_a',simpleSettingValue:{value:'x'}}]},{children:[{'@odata.type':'#microsoft.graph.deviceManagementConfigurationSimpleSettingInstance',settingDefinitionId:'g_a',simpleSettingValue:{value:'y'}}]}]},settingDefinitions:[{id:'g',displayName:'Gruppe'},{id:'g_a',displayName:'A'}]}];
console.log(flattenCatalog(settings));
console.log(normalizeAssignment({target:{'@odata.type':'#microsoft.graph.exclusionGroupAssignmentTarget',groupId:'x',deviceAndAppManagementAssignmentFilterType:'none'}}));
console.log(normalizeAssignment({intent:'required',target:{'@odata.type':'#microsoft.graph.allDevicesAssignmentTarget',deviceAndAppManagementAssignmentFilterId:'f',deviceAndAppManagementAssignmentFilterType:'include'}, settings:{notifications:'hideAll'}}));
console.log(normalizeAssignment({runSchedule:{'@odata.type':'#microsoft.graph.deviceHealthScriptDailySchedule',interval:1,time:'12:00:00.0000000'},target:{'@odata.type':'#microsoft.graph.groupAssignmentTarget',groupId:'g'}}));
console.log(flattenProps({'@odata.type':'x',id:1,displayName:'a',passwordRequired:true,passwordMinimumLength:8,wifiPreSharedKey:'abc',x:'notConfigured',y:false,z:[], nested:{a:1,'@odata.type':'q'}}));
console.log(deviceConfigCategory('#microsoft.graph.windowsUpdateForBusinessConfiguration'), deviceConfigCategory('#microsoft.graph.windows10CustomConfiguration'), deviceConfigCategory('#microsoft.graph.windows81SCEPCertificateProfile'), deviceConfigCategory('#microsoft.graph.windows10GeneralConfiguration'));
console.log(catalogCategory({templateReference:{templateFamily:'endpointSecurityFirewall'}}), catalogCategory({templateReference:{templateFamily:'baseline',templateDisplayName:'Defender Baseline'}}));

// ---- Prüfungen ----
const assert = (await import('node:assert/strict')).default;
assert.equal(a.conflicts.filter((c) => c.kind === 'conflict').length, 3, 'drei echte Konflikte im Demo-Mandanten');
assert.equal(a.devices.total, 37, '37 Demo-Geräte');
assert.ok(a.findings.some((f) => /Push-Zertifikat läuft in/.test(f.title)), 'APNs-Ablauf wird gemeldet');
assert.equal(diffSnapshots(demoOlderSnapshot(), s).length, 5, 'fünf Unterschiede zum älteren Snapshot');
assert.equal(flattenProps({ passwordRequired: true, wifiPreSharedKey: 'x' })[1].value, '(ausgeblendet)', 'Geheimnisse werden ausgeblendet');
assert.equal(flattenProps({ passwordRequired: true })[0].value, 'Ja', 'passwordRequired bleibt sichtbar');
// Managed Google Play: Befund nur bei Android-Enterprise-Geräten
const { analyzeConnectors, normalizeDevice } = await import('../web/js/devices.js');
const mgpUnbound = [{ area: 'Plattform-Anbindungen', sourceKey: 'mgp', uid: 'mgp:mgp', name: 'Managed Google Play', category: 'Managed Google Play (Android Enterprise)', bound: false, raw: {} }];
const aospDev = normalizeDevice({ id: 'a', operatingSystem: 'Android', deviceEnrollmentType: 'androidAOSPUserlessDeviceEnrollment' });
const aeDev = normalizeDevice({ id: 'b', operatingSystem: 'Android', deviceEnrollmentType: 'androidEnterpriseFullyManaged' });
assert.ok(!analyzeConnectors(mgpUnbound, [aospDev]).findings.length, 'kein Befund bei reinen AOSP-Geräten');
assert.ok(analyzeConnectors(mgpUnbound, [aospDev, aeDev]).findings.some((f) => /Managed Google Play/.test(f.title)), 'Befund bei Android-Enterprise-Gerät');
// Alte Snapshots: „apply“ und „Vorlage: …“ werden beim Laden angeglichen
const { upgradeSnapshot } = await import('../web/js/analyze.js');
const legacy = upgradeSnapshot({ objects: [{ sourceKey: 'deviceconfig', odataType: 'aospDeviceOwnerDeviceConfiguration', category: 'Vorlage: Aosp Device Owner Device', platform: 'Android Enterprise', assignments: [{ intent: 'apply' }], settings: [] }] });
assert.equal(legacy.objects[0].category, 'Geräteeinschränkungen (AOSP)');
assert.equal(legacy.objects[0].platform, 'Android (AOSP)');
assert.equal(legacy.objects[0].assignments[0].intent, null);
console.log('\nOK – Logik-Tests bestanden');

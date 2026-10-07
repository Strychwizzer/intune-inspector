// Auswertung eines Snapshots: Kennzahlen, Befunde, Konflikte, Zuweisungsindex, Vergleich.
import { AREAS } from './normalize.js';
import { analyzeDevices, analyzeConnectors } from './devices.js';

const DAY = 86400000;

export function status(o) {
  if (!o.assignable) return 'info';
  if (!o.assignments.some((a) => a.mode === 'include')) return 'unassigned';
  return 'assigned';
}

export function analyze(snap) {
  const objs = snap.objects || [];
  const assignable = objs.filter((o) => o.assignable);
  const unassigned = assignable.filter((o) => status(o) === 'unassigned');
  const now = Date.parse(snap.scannedAt) || Date.now();
  const stale = assignable.filter((o) => o.modified && now - Date.parse(o.modified) > 365 * DAY);
  const withDesc = assignable.filter((o) => (o.description || '').trim().length > 0);
  const deletedGroupRefs = assignable.filter((o) => o.assignments.some((a) => a.deletedGroup));
  const includedAndExcluded = assignable.filter((o) => {
    const inc = new Set(o.assignments.filter((a) => a.mode === 'include' && a.groupId).map((a) => a.groupId));
    return o.assignments.some((a) => a.mode === 'exclude' && inc.has(a.groupId));
  });
  const conflicts = findConflicts(objs);
  const duplicates = findDuplicateNames(assignable);

  const byArea = AREAS.map((area) => {
    const list = objs.filter((o) => o.area === area);
    return { area, total: list.length, assigned: list.filter((o) => status(o) === 'assigned').length, unassigned: list.filter((o) => status(o) === 'unassigned').length, info: list.filter((o) => status(o) === 'info').length };
  }).filter((x) => x.total > 0);

  const findings = [];
  const realConflicts = conflicts.filter((c) => c.kind === 'conflict');
  if (realConflicts.length) findings.push({ sev: 'high', title: realConflicts.length + ' Einstellung(en) mit widersprüchlichen Werten', text: 'Dieselbe Einstellung wird von mehreren zugewiesenen Richtlinien unterschiedlich gesetzt.', view: 'conflicts' });
  if (deletedGroupRefs.length) findings.push({ sev: 'high', title: deletedGroupRefs.length + ' Objekt(e) mit Zuweisung an gelöschte Gruppen', text: 'Zuweisungen zeigen auf Gruppen, die es in Entra ID nicht mehr gibt.', view: 'policies', filter: 'deletedgroup' });
  if (includedAndExcluded.length) findings.push({ sev: 'medium', title: includedAndExcluded.length + ' Objekt(e) schließen dieselbe Gruppe ein und aus', text: 'Ausschluss hat Vorrang – die Einschluss-Zuweisung ist wirkungslos.', view: 'policies', filter: 'inexclude' });
  if (unassigned.length) findings.push({ sev: 'medium', title: unassigned.length + ' Objekt(e) ohne Zuweisung', text: 'Kandidaten zum Aufräumen oder vergessene Tests.', view: 'policies', filter: 'unassigned' });
  if (duplicates.length) findings.push({ sev: 'low', title: duplicates.length + ' doppelte Namen', text: 'Mehrere Objekte heißen gleich, das erschwert die Pflege.', view: 'policies', filter: 'dupname' });
  if (stale.length) findings.push({ sev: 'info', title: stale.length + ' Objekt(e) seit über 12 Monaten unverändert', text: 'Fachlich prüfen, ob sie noch gebraucht werden.', view: 'policies', filter: 'stale' });
  const dupSettings = conflicts.filter((c) => c.kind === 'duplicate');
  if (dupSettings.length) findings.push({ sev: 'low', title: dupSettings.length + ' Einstellung(en) mehrfach mit gleichem Wert gesetzt', text: 'Kein Widerspruch, aber Redundanz.', view: 'conflicts' });
  if (assignable.length) findings.push({ sev: 'info', title: Math.round(withDesc.length / assignable.length * 100) + ' % der Objekte haben eine Beschreibung', text: 'Beschreibungen in Intune oder Notizen hier verbessern die Doku.', view: 'policies' });

  const dev = analyzeDevices(snap.devices || [], snap.autopilot || [], now);
  const conn = analyzeConnectors(objs, snap.devices || [], now);
  findings.unshift(...conn.findings);
  findings.push(...dev.findings);
  const sevRank = { high: 0, medium: 1, low: 2, info: 3 };
  findings.sort((a, b) => sevRank[a.sev] - sevRank[b.sev]);

  const flags = {
    unassigned: new Set(unassigned.map((o) => o.uid)),
    stale: new Set(stale.map((o) => o.uid)),
    deletedgroup: new Set(deletedGroupRefs.map((o) => o.uid)),
    inexclude: new Set(includedAndExcluded.map((o) => o.uid)),
    dupname: new Set(duplicates.flatMap((d) => d.uids)),
    conflict: new Set(realConflicts.flatMap((c) => c.entries.map((e) => e.uid)))
  };

  return {
    total: objs.length,
    assignableCount: assignable.length,
    unassigned, stale, withDesc, deletedGroupRefs, includedAndExcluded, conflicts, duplicates,
    byArea, findings, flags,
    targets: buildTargets(objs),
    devices: dev,
    connectors: conn.rows,
    settingsCount: objs.reduce((n, o) => n + o.settings.length, 0)
  };
}

function normVal(v) { return String(v || '').trim().toLowerCase(); }

function targetKeys(o) {
  return o.assignments.filter((a) => a.mode === 'include').map((a) => a.target === 'group' ? 'g:' + a.groupId : a.target);
}

// Konflikte: gleicher Einstellungsschlüssel in mehreren zugewiesenen Objekten.
export function findConflicts(objs) {
  const map = new Map();
  for (const o of objs) {
    if (!o.assignable || status(o) !== 'assigned') continue;
    if (o.area === 'Apps') continue;
    const seen = new Set();
    for (const s of o.settings) {
      if (!s.key || seen.has(s.key)) continue;
      seen.add(s.key);
      if (!map.has(s.key)) map.set(s.key, []);
      map.get(s.key).push({ uid: o.uid, name: o.name, category: o.category, value: s.value, label: s.label, targets: targetKeys(o), assignmentLabels: o.assignments.filter((a) => a.mode === 'include').map((a) => a.label) });
    }
  }
  const out = [];
  for (const [key, entries] of map) {
    if (entries.length < 2) continue;
    const values = new Set(entries.map((e) => normVal(e.value)));
    // Überschneidung der Zielgruppen ermitteln
    let overlap = false;
    for (let i = 0; i < entries.length && !overlap; i++) {
      for (let j = i + 1; j < entries.length && !overlap; j++) {
        const a = entries[i].targets, b = entries[j].targets;
        if (a.some((x) => b.includes(x))) overlap = true;
        if ((a.includes('allDevices') || a.includes('allUsers')) && b.length) overlap = true;
        if ((b.includes('allDevices') || b.includes('allUsers')) && a.length) overlap = true;
      }
    }
    const kind = values.size > 1 ? 'conflict' : 'duplicate';
    const sev = kind === 'conflict' ? (overlap ? 'high' : 'medium') : 'low';
    out.push({ key, label: entries[0].label, kind, sev, overlap, entries });
  }
  const rank = { high: 0, medium: 1, low: 2 };
  out.sort((a, b) => rank[a.sev] - rank[b.sev] || b.entries.length - a.entries.length || a.label.localeCompare(b.label));
  return out;
}

function findDuplicateNames(objs) {
  const m = new Map();
  for (const o of objs) {
    const k = o.area + '|' + o.name.trim().toLowerCase();
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(o);
  }
  return [...m.values()].filter((l) => l.length > 1).map((l) => ({ name: l[0].name, uids: l.map((o) => o.uid) }));
}

// Index: Ziel (Gruppe / Alle Geräte / Alle Benutzer) → Objekte
export function buildTargets(objs) {
  const m = new Map();
  for (const o of objs) {
    for (const a of o.assignments) {
      const key = a.target === 'group' || a.target === 'collection' ? 'g:' + a.groupId : a.target;
      if (!m.has(key)) m.set(key, { key, label: a.label, kind: a.target, deleted: !!a.deletedGroup, dynamic: !!a.dynamic, items: [] });
      m.get(key).items.push({ uid: o.uid, name: o.name, area: o.area, category: o.category, platform: o.platform, mode: a.mode, filterName: a.filterName || '', filterMode: a.filterMode || '', intent: a.intent || '', extra: a.extra || '' });
    }
  }
  const order = { allDevices: 0, allUsers: 1 };
  return [...m.values()].sort((a, b) => (order[a.kind] ?? 2) - (order[b.kind] ?? 2) || b.items.length - a.items.length || a.label.localeCompare(b.label));
}

// Vergleich zweier Snapshots (alt → neu)
export function diffSnapshots(oldSnap, newSnap) {
  const oldMap = new Map((oldSnap.objects || []).map((o) => [o.uid, o]));
  const newMap = new Map((newSnap.objects || []).map((o) => [o.uid, o]));
  const out = [];
  for (const [uid, n] of newMap) {
    const o = oldMap.get(uid);
    if (!o) { out.push({ kind: 'Neu', uid, name: n.name, area: n.area, category: n.category, details: [n.settings.length + ' Einstellungen, ' + n.assignments.length + ' Zuweisungen'] }); continue; }
    const details = [];
    if (o.name !== n.name) details.push('Name: „' + o.name + '“ → „' + n.name + '“');
    if ((o.description || '') !== (n.description || '')) details.push('Beschreibung geändert');
    const os = new Map(o.settings.map((s) => [s.key + '|' + s.label, s.value]));
    const ns = new Map(n.settings.map((s) => [s.key + '|' + s.label, s.value]));
    for (const [k, v] of ns) {
      const label = k.split('|').slice(1).join('|');
      if (!os.has(k)) details.push('+ ' + label + ' = ' + v);
      else if (os.get(k) !== v) details.push(label + ': ' + os.get(k) + ' → ' + v);
    }
    for (const [k, v] of os) if (!ns.has(k)) details.push('− ' + k.split('|').slice(1).join('|') + ' (war ' + v + ')');
    const aKey = (a) => a.mode + ':' + a.label + (a.filterName ? ' [' + a.filterMode + ' ' + a.filterName + ']' : '') + (a.intent ? ' (' + a.intent + ')' : '');
    const oa = new Set(o.assignments.map(aKey)), na = new Set(n.assignments.map(aKey));
    const assignChanges = [];
    for (const a of na) if (!oa.has(a)) assignChanges.push('+ Zuweisung ' + a.replace(/^include:/, '').replace(/^exclude:/, 'Ausschluss '));
    for (const a of oa) if (!na.has(a)) assignChanges.push('− Zuweisung ' + a.replace(/^include:/, '').replace(/^exclude:/, 'Ausschluss '));
    if (details.length || assignChanges.length) out.push({ kind: details.length ? 'Geändert' : 'Zuweisung', uid, name: n.name, area: n.area, category: n.category, details: details.concat(assignChanges) });
  }
  for (const [uid, o] of oldMap) if (!newMap.has(uid)) out.push({ kind: 'Entfernt', uid, name: o.name, area: o.area, category: o.category, details: [] });
  const rank = { 'Geändert': 0, 'Zuweisung': 1, 'Neu': 2, 'Entfernt': 3 };
  out.sort((a, b) => rank[a.kind] - rank[b.kind] || a.name.localeCompare(b.name));
  return out;
}

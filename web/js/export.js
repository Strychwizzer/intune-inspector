// Dokumentations-Exporte: Word (.docx), PDF (über Druckansicht), HTML, Markdown, CSV, JSON.
//
// Der Inhalt wird einmal als sprachabhängige Blockstruktur aufgebaut (buildDoc) und dann in jedes
// Format übersetzt. So gibt es jeden Text nur an einer Stelle – in beiden Sprachen.
/* global docx */
import { AREAS } from './normalize.js';
import { status } from './analyze.js';
import { COMPLIANCE } from './devices.js';
import { T, tv, objName, fmtDate, fmtDateTime, csvSep } from './i18n.js';

export const SECTIONS = [
  { key: 'summary', label: () => T('Management-Zusammenfassung & Befunde', 'Management summary & findings') },
  { key: 'connectors', label: () => T('Plattform-Anbindungen & Ablaufdaten (APNs, ADE, VPP, Google Play)', 'Platform connectors & expiry dates (APNs, ADE, VPP, Google Play)') },
  { key: 'overview', label: () => T('Übersicht aller Objekte je Bereich', 'Overview of all objects by area') },
  { key: 'details', label: () => T('Details je Objekt (Einstellungen & Zuweisungen)', 'Details per object (settings & assignments)') },
  { key: 'code', label: () => T('Skriptinhalte (PowerShell, Shell, Erkennungsregeln)', 'Script content (PowerShell, shell, detection rules)') },
  { key: 'targets', label: () => T('Zuweisungen nach Gruppe', 'Assignments by group') },
  { key: 'conflicts', label: () => T('Konflikte & Dubletten', 'Conflicts & duplicates') },
  { key: 'unassigned', label: () => T('Nicht zugewiesene Objekte', 'Unassigned objects') },
  { key: 'devices', label: () => T('Geräteinventar (Zusammenfassung)', 'Device inventory (summary)') },
  { key: 'devicelist', label: () => T('Geräteliste mit Namen, Benutzern und Seriennummern', 'Device list with names, users and serial numbers') },
  { key: 'diff', label: () => T('Änderungen seit Vergleichs-Snapshot', 'Changes since comparison snapshot') },
  { key: 'warnings', label: () => T('Scan-Hinweise', 'Scan notes') }
];

const BRAND = '005758';
const SEV = () => ({ high: T('Hoch', 'High'), medium: T('Mittel', 'Medium'), low: T('Niedrig', 'Low'), info: 'Info' });
const modeText = (m) => m === 'exclude' ? T('Ausgeschlossen', 'Excluded') : T('Eingeschlossen', 'Included');
const filterText = (a) => a.filterName ? (a.filterMode === 'exclude' ? T('Ausschluss: ', 'Exclude: ') : T('Einschluss: ', 'Include: ')) + a.filterName : '';

export function assignmentText(a) {
  let s = (a.mode === 'exclude' ? T('Ausgeschlossen: ', 'Excluded: ') : '') + tv(a.label);
  if (a.intent) s += ' (' + tv(a.intent) + ')';
  if (a.filterName) s += ' [Filter ' + filterText(a) + ']';
  if (a.extra) s += ' – ' + tv(a.extra);
  return s;
}
export function assignmentSummary(o) {
  if (!o.assignable) return '—';
  if (!o.assignments.length) return T('Nicht zugewiesen', 'Unassigned');
  return o.assignments.map(assignmentText).join('; ');
}

// ---------------------------------------------------------------------------
// Gemeinsames Modell
// ---------------------------------------------------------------------------
export function buildModel(snap, an, opts) {
  const areas = opts.areas && opts.areas.size ? opts.areas : new Set(AREAS);
  const objects = (snap.objects || []).filter((o) => areas.has(o.area));
  const groupsByArea = [];
  for (const area of AREAS) {
    if (!areas.has(area)) continue;
    const list = objects.filter((o) => o.area === area).sort((a, b) => tv(a.category).localeCompare(tv(b.category)) || a.name.localeCompare(b.name));
    if (!list.length) continue;
    const cats = [];
    for (const o of list) {
      let c = cats.find((x) => x.name === o.category);
      if (!c) { c = { name: o.category, items: [] }; cats.push(c); }
      c.items.push(o);
    }
    groupsByArea.push({ area, count: list.length, cats });
  }
  const uids = new Set(objects.map((o) => o.uid));
  return {
    title: T('Intune-Dokumentation', 'Intune documentation'),
    customer: opts.customer || snap.tenant.displayName || snap.tenant.domain || T('Mandant', 'Tenant'),
    tenant: snap.tenant,
    scannedAt: snap.scannedAt,
    scannedBy: snap.scannedBy || '',
    partner: opts.partner || '',
    author: opts.author || '',
    sections: opts.sections || new Set(),
    notes: opts.notes || {},
    areas: groupsByArea,
    objects,
    an,
    targets: an.targets.map((t) => Object.assign({}, t, { items: t.items.filter((i) => uids.has(i.uid)) })).filter((t) => t.items.length),
    conflicts: an.conflicts.filter((c) => c.entries.some((e) => uids.has(e.uid))),
    unassigned: an.unassigned.filter((o) => uids.has(o.uid)),
    diff: opts.diff || null,
    diffBase: opts.diffBase || '',
    warnings: snap.warnings || [],
    devices: snap.devices || [],
    autopilot: snap.autopilot || [],
    demo: !!snap.demo
  };
}

// ---------------------------------------------------------------------------
// Blockstruktur (sprachabhängig)
// ---------------------------------------------------------------------------
// Blocktypen: h2, h3, h4 {text} · p {text, tone} · table {head, rows, widths, cls} · kv {rows} · code {text} · bullets {items:[{sev,label,text}]}
const H = (level, text) => ({ t: 'h' + level, text });
const P = (text, tone) => ({ t: 'p', text, tone });
const TABLE = (head, rows, widths, cls) => ({ t: 'table', head, rows, widths, cls });

function objMetaRows(m, o) {
  const rows = [[T('Bereich', 'Area'), tv(o.area)], [T('Kategorie', 'Category'), tv(o.category)]];
  if (o.platform) rows.push([T('Plattform', 'Platform'), tv(o.platform)]);
  for (const [k, v] of o.meta || []) rows.push([tv(k), tv(v)]);
  if (o.description) rows.push([T('Beschreibung', 'Description'), o.description]);
  if (m.notes[o.uid]) rows.push([T('Notiz', 'Note'), m.notes[o.uid]]);
  if (o.scopeTags && o.scopeTags.length) rows.push([T('Bereichsmarkierungen', 'Scope tags'), o.scopeTags.join(', ')]);
  if (o.created) rows.push([T('Erstellt', 'Created'), fmtDateTime(o.created)]);
  if (o.modified) rows.push([T('Zuletzt geändert', 'Last modified'), fmtDateTime(o.modified)]);
  rows.push(['Status', o.assignable ? (status(o) === 'assigned' ? T('Zugewiesen', 'Assigned') : T('Nicht zugewiesen', 'Unassigned')) : T('Mandantenweit / nicht zuweisbar', 'Tenant-wide / not assignable')]);
  rows.push([T('Objekt-ID', 'Object ID'), o.id]);
  return rows;
}
const settingLabel = (s) => (s.depth ? '↳ ' : '') + (s.path ? tv(s.path) + ' › ' : '') + tv(s.label);
const areaRow = (m, a) => { const x = m.an.byArea.find((b) => b.area === a.area) || {}; return [tv(a.area), a.count, x.assigned || 0, x.unassigned || 0]; };

const daysText = (r) => r.days === null || r.days === undefined ? '' : r.days < 0 ? T('abgelaufen seit ' + Math.abs(r.days) + ' Tagen', 'expired ' + Math.abs(r.days) + ' days ago') : T('noch ' + r.days + ' Tage', r.days + ' days left');
export function connectorBlocks(m) {
  const rows = m.an.connectors || [];
  const blocks = [P(T('Ablaufende Zertifikate oder Token stoppen die Verwaltung der betroffenen Geräte. Beim Apple MDM-Push-Zertifikat muss die Verlängerung zwingend mit derselben Apple-ID erfolgen.', 'Expiring certificates or tokens stop management of the affected devices. The Apple MDM push certificate must be renewed with the same Apple ID.'), 'muted')];
  if (!rows.length) { blocks.push(P(T('Keine Plattform-Anbindungen gefunden.', 'No platform connectors found.'))); return blocks; }
  blocks.push(TABLE([T('Anbindung', 'Connector'), 'Name', T('Plattform', 'Platform'), T('Gültig bis', 'Valid until'), 'Status'],
    rows.map((r) => [tv(r.category), tv(r.name), r.platform || '—', r.expiry ? fmtDate(r.expiry) : '—', daysText(r) || ({ high: T('prüfen', 'check'), medium: T('prüfen', 'check'), info: T('nicht verbunden', 'not bound') }[r.sev] || 'OK')]), [30, 24, 16, 14, 16]));
  return blocks;
}
export function deviceBlocks(m) {
  const d = m.an.devices;
  if (!d || (!d.total && !d.autopilotCount)) return [P(T('Keine verwalteten Geräte gefunden.', 'No managed devices found.'))];
  const all = m.devices;
  const pairs = (p) => p.map(([k, n]) => [tv(k), n]);
  const DEV = T('Geräte', 'Devices');
  const blocks = [];
  blocks.push(H(3, T('Geräte je Plattform', 'Devices per platform')), TABLE([T('Plattform', 'Platform'), DEV, T('Nicht konform', 'Noncompliant'), T('Ohne Check-in > 30 Tage', 'No check-in > 30 days'), T('Unverschlüsselt', 'Unencrypted'), T('Privat', 'Personal')], d.byPlatform.map(([p, n]) => {
    const l = all.filter((x) => x.platform === p);
    return [tv(p), n, l.filter((x) => d.flags.noncompliant.has(x.id)).length, l.filter((x) => d.flags.stale.has(x.id)).length, (p === 'Windows' || p === 'macOS') ? l.filter((x) => d.flags.unencrypted.has(x.id)).length : '—', l.filter((x) => x.owner === 'Privat').length];
  }).concat([[T('Gesamt', 'Total'), d.total, d.noncompliant.length, d.stale.length, d.unencrypted.length, d.personal.length]]), [24, 12, 16, 20, 16, 12]));
  blocks.push(H(3, T('Konformität', 'Compliance')), TABLE(['Status', DEV], pairs(d.byCompliance), [70, 30]));
  blocks.push(H(3, T('Registrierungsart', 'Enrollment type')), TABLE([T('Art', 'Type'), DEV], pairs(d.byEnroll), [70, 30]));
  if (d.byJoin.length) blocks.push(H(3, T('Windows: Join-Typ', 'Windows: join type')), TABLE([T('Join-Typ', 'Join type'), DEV], pairs(d.byJoin), [70, 30]));
  const vrows = [];
  for (const [p, list] of Object.entries(d.versions)) for (const [v, n] of list) vrows.push([tv(p), v, n]);
  blocks.push(H(3, T('Betriebssystem-Versionen', 'Operating system versions')), TABLE([T('Plattform', 'Platform'), 'Version', DEV], vrows, [30, 45, 25]));
  blocks.push(H(3, T('Häufigste Modelle', 'Most common models')), TABLE([T('Hersteller / Modell', 'Manufacturer / model'), DEV], pairs(d.byModel), [70, 30]));
  if (d.autopilotCount) blocks.push(H(3, 'Windows Autopilot'), TABLE(['Group Tag', DEV], pairs(d.byGroupTag), [70, 30]));
  return blocks;
}
export function deviceListBlocks(m) {
  const blocks = [P(T('Personenbezogene Daten – nur an berechtigte Empfänger weitergeben.', 'Personal data – share only with authorized recipients.'), 'warn')];
  const sorted = m.devices.slice().sort((a, b) => a.platform.localeCompare(b.platform) || a.name.localeCompare(b.name));
  blocks.push(H(3, T('Verwaltete Geräte (', 'Managed devices (') + sorted.length + ')'), TABLE([T('Gerät', 'Device'), T('Plattform / Version', 'Platform / version'), T('Benutzer', 'User'), T('Besitz', 'Ownership'), T('Konformität', 'Compliance'), T('Letzter Check-in', 'Last check-in'), T('Seriennummer', 'Serial number')],
    sorted.map((x) => [x.name + (x.model ? '\n' + x.model : ''), tv(x.platform) + ' ' + x.osVersion, x.userName || x.user || '—', tv(x.owner), tv(COMPLIANCE[x.compliance] || x.compliance), x.lastSync ? fmtDate(x.lastSync) : '—', x.serial || '—']), [18, 16, 20, 9, 12, 12, 13]));
  if (m.autopilot.length) blocks.push(H(3, T('Autopilot-Geräte (', 'Autopilot devices (') + m.autopilot.length + ')'), TABLE([T('Seriennummer', 'Serial number'), T('Hersteller / Modell', 'Manufacturer / model'), 'Group Tag', 'Status', T('Profil', 'Profile')],
    m.autopilot.map((a) => [a.serial, [a.manufacturer, a.model].filter(Boolean).join(' '), a.groupTag || '—', tv(a.state), tv(a.profile)]), [20, 30, 16, 17, 17]));
  return blocks;
}

export function buildDoc(m) {
  const S = m.sections;
  const sections = [];
  const add = (id, title, blocks) => sections.push({ id, title, blocks });
  const OBJ_HEAD = ['Name', T('Kategorie', 'Category'), T('Plattform', 'Platform'), T('Zuweisung', 'Assignment'), T('Geändert', 'Modified')];
  const ASG_HEAD = [T('Ziel', 'Target'), T('Art', 'Mode'), T('Absicht', 'Intent'), 'Filter', T('Hinweis', 'Note')];

  if (S.has('summary')) {
    add('summary', T('Management-Zusammenfassung', 'Management summary'), [
      TABLE([T('Bereich', 'Area'), T('Objekte', 'Objects'), T('Zugewiesen', 'Assigned'), T('Nicht zugewiesen', 'Unassigned')], m.areas.map((a) => areaRow(m, a)), [46, 18, 18, 18]),
      H(3, T('Befunde', 'Findings')),
      { t: 'bullets', items: m.an.findings.map((f) => ({ sev: f.sev, label: SEV()[f.sev], text: f.title + ' – ' + f.text })) }
    ]);
  }
  if (S.has('connectors')) add('connectors', T('Plattform-Anbindungen & Ablaufdaten', 'Platform connectors & expiry dates'), connectorBlocks(m));
  if (S.has('overview')) {
    const b = [];
    for (const a of m.areas) b.push(H(3, tv(a.area) + ' (' + a.count + ')'), TABLE(OBJ_HEAD, a.cats.flatMap((c) => c.items.map((o) => [objName(o), tv(c.name), tv(o.platform) || '—', assignmentSummary(o), fmtDate(o.modified)])), [28, 20, 12, 28, 12]));
    add('overview', T('Übersicht', 'Overview'), b);
  }
  if (S.has('details')) {
    const b = [];
    for (const a of m.areas) {
      b.push(H(2, tv(a.area)));
      for (const c of a.cats) for (const o of c.items) {
        b.push(H(3, objName(o)), { t: 'kv', rows: objMetaRows(m, o) });
        if (o.assignable) b.push(H(4, T('Zuweisungen', 'Assignments')), TABLE(ASG_HEAD, o.assignments.map((x) => [tv(x.label), modeText(x.mode), tv(x.intent) || '', filterText(x), tv(x.extra) || '']), [32, 17, 15, 20, 16]));
        if (o.settings.length) b.push(H(4, T('Einstellungen', 'Settings') + ' (' + o.settings.length + ')'), TABLE([T('Einstellung', 'Setting'), T('Wert', 'Value')], o.settings.map((s) => [settingLabel(s), tv(s.value)]), [55, 45], 'settings'));
        if (S.has('code')) for (const cd of o.code || []) b.push(H(4, tv(cd.title)), { t: 'code', text: cd.content, lang: cd.lang });
      }
    }
    add('details', T('Details je Objekt', 'Details per object'), b);
  }
  if (S.has('targets')) {
    const b = [];
    for (const t of m.targets) b.push(H(3, tv(t.label) + (t.dynamic ? T(' (dynamisch)', ' (dynamic)') : '')), TABLE([T('Objekt', 'Object'), T('Bereich / Kategorie', 'Area / category'), T('Art', 'Mode'), T('Absicht', 'Intent'), 'Filter'],
      t.items.map((i) => [i.name, tv(i.area) + ' / ' + tv(i.category), modeText(i.mode), tv(i.intent), filterText(i)]), [32, 28, 14, 12, 14]));
    add('targets', T('Zuweisungen nach Gruppe', 'Assignments by group'), b);
  }
  if (S.has('conflicts')) {
    const b = [];
    if (!m.conflicts.length) b.push(P(T('Keine gefunden.', 'None found.')));
    for (const c of m.conflicts) b.push(H(3, (c.kind === 'conflict' ? T('Konflikt', 'Conflict') : T('Dublette', 'Duplicate')) + ' (' + SEV()[c.sev] + '): ' + tv(c.label)),
      TABLE([T('Richtlinie', 'Policy'), T('Wert', 'Value'), T('Zuweisung', 'Assignment')], c.entries.map((e) => [e.name, tv(e.value), e.assignmentLabels.map(tv).join(', ')]), [38, 27, 35]));
    add('conflicts', T('Konflikte & Dubletten', 'Conflicts & duplicates'), b);
  }
  if (S.has('unassigned')) add('unassigned', T('Nicht zugewiesene Objekte', 'Unassigned objects'), [TABLE(['Name', T('Bereich', 'Area'), T('Kategorie', 'Category'), T('Geändert', 'Modified')], m.unassigned.map((o) => [objName(o), tv(o.area), tv(o.category), fmtDate(o.modified)]), [40, 20, 26, 14])]);
  if (S.has('devices')) add('devices', T('Geräteinventar', 'Device inventory'), deviceBlocks(m));
  if (S.has('devicelist') && (m.devices.length || m.autopilot.length)) add('devicelist', T('Geräteliste', 'Device list'), deviceListBlocks(m));
  if (S.has('diff') && m.diff) add('diff', T('Änderungen seit ', 'Changes since ') + m.diffBase, [TABLE([T('Art', 'Kind'), T('Objekt', 'Object'), T('Bereich', 'Area'), 'Details'], m.diff.map((d) => [tv(d.kind), d.name, tv(d.area), d.details.join('\n')]), [12, 28, 18, 42])]);
  if (S.has('warnings') && m.warnings.length) add('warnings', T('Scan-Hinweise', 'Scan notes'), [TABLE([T('Quelle', 'Source'), T('Hinweis', 'Note')], m.warnings.map((w) => [tv(w.source), tv(w.message)]), [35, 65])]);

  return {
    lang: T('de', 'en'),
    title: m.title,
    customer: m.customer,
    kicker: m.partner || 'Intune Inspector',
    coverRows: [[T('Mandant', 'Tenant'), (m.tenant.domain || '') + (m.tenant.id ? ' · ' + m.tenant.id : '')], [T('Stand', 'As of'), fmtDateTime(m.scannedAt)], [T('Erstellt von', 'Created by'), m.author || m.scannedBy || '—'], [T('Objekte', 'Objects'), String(m.objects.length)], [T('Verwaltete Geräte', 'Managed devices'), String(m.devices.length)]],
    demo: m.demo ? T('Beispieldaten (Demo-Modus)', 'Sample data (demo mode)') : '',
    tocTitle: T('Inhalt', 'Contents'),
    empty: T('keine Einträge', 'no entries'),
    madeWith: T('Erstellt mit Intune Inspector', 'Created with Intune Inspector'),
    sections
  };
}

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------
const mdEsc = (s) => String(s === undefined || s === null ? '' : s).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
function mdTable(head, rows, empty) {
  if (!rows.length) return '_' + empty + '_\n\n';
  return '| ' + head.map(mdEsc).join(' | ') + ' |\n|' + head.map(() => ' --- ').join('|') + '|\n' + rows.map((r) => '| ' + r.map(mdEsc).join(' | ') + ' |').join('\n') + '\n\n';
}
export function toMarkdown(m) {
  const d = buildDoc(m);
  let out = '# ' + d.title + ' – ' + d.customer + '\n\n';
  for (const [k, v] of d.coverRows) out += '- ' + k + ': ' + v + '\n';
  if (m.partner) out += '- Partner: ' + m.partner + '\n';
  out += '- ' + d.madeWith + '\n\n';
  if (d.demo) out += '> ' + d.demo + '\n\n';
  for (const s of d.sections) {
    out += '## ' + s.title + '\n\n';
    for (const b of s.blocks) {
      if (b.t === 'h2') out += '### ' + b.text + '\n\n';
      else if (b.t === 'h3') out += (s.id === 'details' ? '#### ' : '### ') + b.text + '\n\n';
      else if (b.t === 'h4') out += '**' + b.text + '**\n\n';
      else if (b.t === 'p') out += (b.tone === 'warn' ? '> ' : '') + b.text + '\n\n';
      else if (b.t === 'table') out += mdTable(b.head, b.rows, d.empty);
      else if (b.t === 'kv') out += mdTable([T('Eigenschaft', 'Property'), T('Wert', 'Value')], b.rows, d.empty);
      else if (b.t === 'code') out += '```' + (b.lang || '') + '\n' + b.text + '\n```\n\n';
      else if (b.t === 'bullets') out += (b.items.map((i) => '- **' + i.label + ':** ' + i.text).join('\n') || '_' + d.empty + '_') + '\n\n';
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// HTML (auch Grundlage für PDF)
// ---------------------------------------------------------------------------
const h = (s) => String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hCell = (c) => h(c).replace(/\n/g, '<br>');
function hTable(head, rows, cls, empty) {
  if (!rows.length) return '<p class="empty">' + h(empty) + '</p>';
  return '<table class="' + (cls || '') + '"><thead><tr>' + head.map((x) => '<th>' + h(x) + '</th>').join('') + '</tr></thead><tbody>' +
    rows.map((r) => '<tr>' + r.map((c) => '<td>' + hCell(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
}
export function toHtml(m) {
  const d = buildDoc(m);
  let body = '';
  for (const s of d.sections) {
    body += '<h1 id="' + s.id + '">' + h(s.title) + '</h1>';
    let open = false;
    for (const b of s.blocks) {
      if (s.id === 'details' && b.t === 'h3') { if (open) body += '</section>'; body += '<section class="obj">'; open = true; }
      if (b.t === 'h2') { if (open) { body += '</section>'; open = false; } body += '<h2 class="' + (s.id === 'details' ? 'area' : '') + '">' + h(b.text) + '</h2>'; }
      else if (b.t === 'h3') body += (s.id === 'details' ? '<h3>' : '<h2>') + h(b.text) + (s.id === 'details' ? '</h3>' : '</h2>');
      else if (b.t === 'h4') body += '<h4>' + h(b.text) + '</h4>';
      else if (b.t === 'p') body += '<p class="' + (b.tone || '') + '">' + h(b.text) + '</p>';
      else if (b.t === 'table') body += hTable(b.head, b.rows, b.cls, d.empty);
      else if (b.t === 'kv') body += hTable(['', ''], b.rows, 'kv', d.empty);
      else if (b.t === 'code') body += '<pre>' + h(b.text) + '</pre>';
      else if (b.t === 'bullets') body += '<ul class="findings">' + b.items.map((i) => '<li class="sev-' + i.sev + '"><b>' + h(i.label) + ':</b> ' + h(i.text) + '</li>').join('') + '</ul>';
    }
    if (open) body += '</section>';
  }
  const cover = '<div class="cover"><div class="brandbar"></div><p class="kicker">' + h(d.kicker) + '</p><h1 class="title">' + h(d.title) + '</h1><p class="customer">' + h(d.customer) + '</p>' +
    '<table class="kv cover-kv"><tbody>' + d.coverRows.map((r) => '<tr><td>' + h(r[0]) + '</td><td>' + h(r[1]) + '</td></tr>').join('') + '</tbody></table>' +
    (d.demo ? '<p class="demo">' + h(d.demo) + '</p>' : '') +
    '<h2>' + h(d.tocTitle) + '</h2><ol class="toc">' + d.sections.map((s) => '<li><a href="#' + s.id + '">' + h(s.title) + '</a></li>').join('') + '</ol></div>';
  return '<!doctype html><html lang="' + d.lang + '"><head><meta charset="utf-8"><title>' + h(d.title + ' – ' + d.customer) + '</title><style>' + REPORT_CSS + '</style></head><body>' + cover + body + '</body></html>';
}

const REPORT_CSS = `
@page { size: A4; margin: 18mm 16mm 18mm 16mm; }
* { box-sizing: border-box; }
body { font-family: "Segoe UI", Calibri, Arial, sans-serif; font-size: 10pt; color: #13201F; line-height: 1.4; margin: 0; padding: 24px; }
@media print { body { padding: 0; } }
h1 { font-size: 18pt; color: #${BRAND}; border-bottom: 2px solid #${BRAND}; padding-bottom: 4px; margin: 28px 0 12px; page-break-before: always; }
h2 { font-size: 13pt; color: #${BRAND}; margin: 20px 0 8px; page-break-after: avoid; }
h2.area { font-size: 15pt; border-bottom: 1px solid #B7C6C5; padding-bottom: 3px; }
h3 { font-size: 11.5pt; margin: 18px 0 6px; page-break-after: avoid; }
h4 { font-size: 10pt; margin: 10px 0 4px; color: #2F4644; page-break-after: avoid; }
table { width: 100%; border-collapse: collapse; margin: 4px 0 10px; font-size: 9pt; page-break-inside: auto; }
th { background: #${BRAND}; color: #fff; text-align: left; padding: 5px 7px; font-weight: 600; }
td { border-bottom: 1px solid #D5E0DF; padding: 4px 7px; vertical-align: top; word-break: break-word; }
tr { page-break-inside: avoid; }
table.kv td:first-child { width: 28%; color: #4A5E5D; font-weight: 600; }
table.kv thead { display: none; }
table.settings td:first-child { width: 55%; }
pre { background: #F1F5F4; border: 1px solid #D5E0DF; padding: 8px 10px; font-family: Consolas, "Courier New", monospace; font-size: 8.5pt; white-space: pre-wrap; word-break: break-all; }
.obj { page-break-inside: auto; border-top: 1px dashed #D5E0DF; padding-top: 4px; }
.empty { color: #6B7F7E; font-style: italic; }
p.muted { color: #4A5E5D; font-style: italic; }
p.warn { color: #9A5B00; font-weight: 600; }
.findings li { margin: 4px 0; }
.sev-high b { color: #B3261E; } .sev-medium b { color: #9A5B00; }
.cover { min-height: 90vh; }
.cover .brandbar { height: 10px; width: 120px; background: #${BRAND}; margin: 40px 0 28px; }
.cover .kicker { text-transform: uppercase; letter-spacing: .12em; color: #${BRAND}; font-weight: 600; font-size: 9pt; margin: 0; }
.cover .title { border: none; page-break-before: avoid; font-size: 30pt; margin: 6px 0 0; color: #13201F; }
.cover .customer { font-size: 18pt; color: #${BRAND}; margin: 4px 0 28px; }
.cover-kv { width: 70%; }
.toc a { color: #13201F; text-decoration: none; }
.demo { color: #9A5B00; font-weight: 600; }
`;

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------
function csv(rows) {
  const sep = csvSep();
  const cell = (v) => { const s = String(v === undefined || v === null ? '' : v); return (s.includes(sep) || /["\n\r]/.test(s)) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return '﻿' + rows.map((r) => r.map(cell).join(sep)).join('\r\n');
}
const yn = (b) => b ? T('Ja', 'Yes') : T('Nein', 'No');
const objStatus = (o) => o.assignable ? (status(o) === 'assigned' ? T('Zugewiesen', 'Assigned') : T('Nicht zugewiesen', 'Unassigned')) : T('Mandantenweit', 'Tenant-wide');

export function toCsvSettings(m) {
  const rows = [[T('Bereich', 'Area'), T('Kategorie', 'Category'), T('Objekt', 'Object'), T('Plattform', 'Platform'), 'Status', T('Einstellung', 'Setting'), T('Pfad', 'Path'), T('Wert', 'Value'), T('Objekt-ID', 'Object ID')]];
  for (const o of m.objects) {
    const base = [tv(o.area), tv(o.category), objName(o), tv(o.platform), objStatus(o)];
    if (!o.settings.length) rows.push(base.concat(['', '', '', o.id]));
    for (const s of o.settings) rows.push(base.concat([tv(s.label), tv(s.path) || '', tv(s.value), o.id]));
  }
  return csv(rows);
}
export function toCsvAssignments(m) {
  const rows = [[T('Bereich', 'Area'), T('Kategorie', 'Category'), T('Objekt', 'Object'), T('Plattform', 'Platform'), T('Ziel', 'Target'), T('Art', 'Mode'), T('Absicht', 'Intent'), 'Filter', T('Filtermodus', 'Filter mode'), T('Hinweis', 'Note'), T('Objekt-ID', 'Object ID')]];
  for (const o of m.objects) {
    if (!o.assignable) continue;
    const base = [tv(o.area), tv(o.category), objName(o), tv(o.platform)];
    if (!o.assignments.length) rows.push(base.concat([T('(nicht zugewiesen)', '(unassigned)'), '', '', '', '', '', o.id]));
    for (const a of o.assignments) rows.push(base.concat([tv(a.label), modeText(a.mode), tv(a.intent) || '', a.filterName || '', a.filterMode || '', tv(a.extra) || '', o.id]));
  }
  return csv(rows);
}
export function toCsvDevices(m) {
  const rows = [[T('Gerät', 'Device'), T('Plattform', 'Platform'), T('Betriebssystem', 'Operating system'), 'Version', T('Hersteller', 'Manufacturer'), T('Modell', 'Model'), T('Seriennummer', 'Serial number'), T('Benutzer', 'User'), 'UPN', T('Besitz', 'Ownership'), T('Konformität', 'Compliance'), T('Registrierungsart', 'Enrollment type'), T('Join-Typ', 'Join type'), T('Verwaltung', 'Management'), T('Verschlüsselt', 'Encrypted'), 'Supervised', T('Jailbreak/Root', 'Jailbroken/rooted'), 'Autopilot', T('Kategorie', 'Category'), T('Sicherheitspatch', 'Security patch'), T('Registriert', 'Enrolled'), T('Letzter Check-in', 'Last check-in'), 'Intune ID', 'Entra ID']];
  for (const d of m.devices) rows.push([d.name, tv(d.platform), d.os, d.osVersion, d.manufacturer, d.model, d.serial, d.userName, d.user, tv(d.owner), tv(COMPLIANCE[d.compliance] || d.compliance), tv(d.enrollType), tv(d.join), tv(d.agent), yn(d.encrypted), yn(d.supervised), yn(d.jailbroken), yn(d.autopilot), d.category, d.patch, fmtDateTime(d.enrolled), fmtDateTime(d.lastSync), d.id, d.entraId]);
  return csv(rows);
}
export function toCsvAutopilot(m) {
  const rows = [[T('Seriennummer', 'Serial number'), T('Hersteller', 'Manufacturer'), T('Modell', 'Model'), 'Group Tag', T('Bestellnummer', 'Purchase order'), 'Status', T('Profil', 'Profile'), T('Zugewiesener Benutzer', 'Assigned user'), T('Gerätename', 'Device name'), T('Letzter Kontakt', 'Last contact')]];
  for (const a of m.autopilot) rows.push([a.serial, a.manufacturer, a.model, a.groupTag, a.order, tv(a.state), tv(a.profile), a.user, a.displayName, a.lastContact ? fmtDateTime(a.lastContact) : '']);
  return csv(rows);
}

// ---------------------------------------------------------------------------
// Word
// ---------------------------------------------------------------------------
// Hinweis: Der Inhalt wird synchron aufgebaut; nur Packer.toBlob ist asynchron. So kann der Aufrufer die
// Sprache für die Dauer des Aufbaus vorübergehend umstellen (withLang).
export function toDocx(m) {
  const d = buildDoc(m);
  const D = docx;
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType, Footer, Header, PageNumber, TableOfContents, PageBreak, BorderStyle } = D;
  const para = (text, run) => new Paragraph({ children: [new TextRun(Object.assign({ text: String(text === undefined || text === null ? '' : text) }, run || {}))] });
  const cellBorder = { top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D5E0DF' } };
  const textCell = (t, opts) => new TableCell({
    borders: cellBorder,
    shading: opts && opts.head ? { fill: BRAND, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    width: opts && opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    margins: { top: 50, bottom: 50, left: 90, right: 90 },
    children: String(t === undefined || t === null ? '' : t).split(/\r?\n/).map((line) => new Paragraph({ children: [new TextRun({ text: line, bold: !!(opts && (opts.head || opts.bold)), color: opts && opts.head ? 'FFFFFF' : (opts && opts.muted ? '4A5E5D' : undefined), size: 17 })] }))
  });
  const table = (head, rows, widths) => {
    if (!rows.length) return [para(d.empty, { italics: true, color: '6B7F7E', size: 18 })];
    return [new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ tableHeader: true, children: head.map((x, i) => textCell(x, { head: true, width: widths && widths[i] })) })]
        .concat(rows.map((r) => new TableRow({ cantSplit: true, children: r.map((c, i) => textCell(c, { width: widths && widths[i] })) })))
    }), para('')];
  };
  const kv = (rows) => [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(([k, v]) => new TableRow({ cantSplit: true, children: [textCell(k, { bold: true, muted: true, width: 28 }), textCell(v, { width: 72 })] }))
  }), para('')];
  const heading = (text, level) => new Paragraph({ text: String(text), heading: level });
  const code = (content) => String(content || '').split(/\r?\n/).map((line) => new Paragraph({ shading: { fill: 'F1F5F4', type: ShadingType.CLEAR, color: 'auto' }, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: line || ' ', font: 'Consolas', size: 16 })] }));

  const children = [];
  children.push(new Paragraph({ spacing: { before: 2400 }, children: [new TextRun({ text: d.kicker.toUpperCase(), bold: true, color: BRAND, size: 20 })] }));
  children.push(new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: d.title, bold: true, size: 64 })] }));
  children.push(new Paragraph({ spacing: { after: 600 }, children: [new TextRun({ text: d.customer, color: BRAND, size: 40 })] }));
  children.push(...kv(d.coverRows));
  if (d.demo) children.push(para(d.demo, { bold: true, color: '9A5B00' }));
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(new TableOfContents(d.tocTitle, { hyperlink: true, headingStyleRange: '1-2' }));
  children.push(para(T('Hinweis: Beim Öffnen in Word ggf. „Felder aktualisieren“ bestätigen, damit das Inhaltsverzeichnis erscheint.', 'Note: when opening in Word, confirm “Update fields” so the table of contents appears.'), { italics: true, color: '6B7F7E', size: 16 }));

  for (const s of d.sections) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(heading(s.title, HeadingLevel.HEADING_1));
    for (const b of s.blocks) {
      if (b.t === 'h2') children.push(heading(b.text, HeadingLevel.HEADING_2));
      else if (b.t === 'h3') children.push(heading(b.text, s.id === 'details' ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_2));
      else if (b.t === 'h4') children.push(heading(b.text, HeadingLevel.HEADING_4));
      else if (b.t === 'p') children.push(para(b.text, b.tone === 'warn' ? { bold: true, color: '9A5B00' } : b.tone === 'muted' ? { italics: true, color: '4A5E5D' } : {}));
      else if (b.t === 'table') children.push(...table(b.head, b.rows, b.widths));
      else if (b.t === 'kv') children.push(...kv(b.rows));
      else if (b.t === 'code') { children.push(...code(b.text)); children.push(para('')); }
      else if (b.t === 'bullets') for (const i of b.items) children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: i.label + ': ', bold: true, color: i.sev === 'high' ? 'B3261E' : i.sev === 'medium' ? '9A5B00' : undefined }), new TextRun({ text: i.text })] }));
    }
  }

  const doc = new Document({
    creator: m.author || 'Intune Inspector',
    title: d.title + ' – ' + d.customer,
    description: d.madeWith,
    features: { updateFields: true },
    styles: {
      default: {
        // Dokumentsprache passend zur Doku; Rechtschreibprüfung aus, da Richtlinien-, Gruppen- und
        // Einstellungsnamen meist englisch oder technisch sind (sonst rote Wellenlinien überall).
        document: { run: { font: 'Calibri', size: 20, noProof: true, language: { value: d.lang === 'en' ? 'en-US' : 'de-DE' } } },
        heading1: { run: { font: 'Calibri', size: 34, bold: true, color: BRAND }, paragraph: { spacing: { before: 240, after: 160 } } },
        heading2: { run: { font: 'Calibri', size: 27, bold: true, color: BRAND }, paragraph: { spacing: { before: 240, after: 120 } } },
        heading3: { run: { font: 'Calibri', size: 23, bold: true, color: '13201F' }, paragraph: { spacing: { before: 240, after: 80 } } },
        heading4: { run: { font: 'Calibri', size: 20, bold: true, color: '2F4644' }, paragraph: { spacing: { before: 120, after: 60 } } }
      }
    },
    sections: [{
      properties: { page: { margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: d.title + ' – ' + d.customer, color: '6B7F7E', size: 16 })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [T('Seite ', 'Page '), PageNumber.CURRENT, T(' von ', ' of '), PageNumber.TOTAL_PAGES], color: '6B7F7E', size: 16 })] })] }) },
      children
    }]
  });
  return Packer.toBlob(doc);
}

// ---------------------------------------------------------------------------
// Hilfen
// ---------------------------------------------------------------------------
export function download(name, data, mime) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
}

// PDF: Druckdialog des Browsers über einen unsichtbaren Rahmen öffnen („Als PDF speichern“)
export function printHtml(html) {
  const f = document.createElement('iframe');
  f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(f);
  f.srcdoc = html;
  f.onload = () => {
    setTimeout(() => {
      f.contentWindow.focus();
      f.contentWindow.print();
      setTimeout(() => f.remove(), 60000);
    }, 300);
  };
}

export function fileStem(m) {
  const d = new Date(m.scannedAt || Date.now());
  const ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  return T('Intune-Doku_', 'Intune-Documentation_') + String(m.customer).replace(/[^A-Za-z0-9ÄÖÜäöüß_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '_' + ds;
}

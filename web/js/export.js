// Dokumentations-Exporte: Word (.docx), PDF (über Druckansicht), HTML, Markdown, CSV, JSON.
/* global docx */
import { AREAS } from './normalize.js';
import { status } from './analyze.js';
import { COMPLIANCE } from './devices.js';

export const SECTIONS = [
  ['summary', 'Management-Zusammenfassung & Befunde'],
  ['connectors', 'Plattform-Anbindungen & Ablaufdaten (APNs, ADE, VPP, Google Play)'],
  ['overview', 'Übersicht aller Objekte je Bereich'],
  ['details', 'Details je Objekt (Einstellungen & Zuweisungen)'],
  ['code', 'Skriptinhalte (PowerShell, Shell, Erkennungsregeln)'],
  ['targets', 'Zuweisungen nach Gruppe'],
  ['conflicts', 'Konflikte & Dubletten'],
  ['unassigned', 'Nicht zugewiesene Objekte'],
  ['devices', 'Geräteinventar (Zusammenfassung)'],
  ['devicelist', 'Geräteliste mit Namen, Benutzern und Seriennummern'],
  ['diff', 'Änderungen seit Vergleichs-Snapshot'],
  ['warnings', 'Scan-Hinweise']
];

const BRAND = '005758';
const fmtDate = (iso) => { if (!iso) return '—'; const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
const fmtDateTime = (iso) => { if (!iso) return '—'; const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
const SEV = { high: 'Hoch', medium: 'Mittel', low: 'Niedrig', info: 'Info' };

export function assignmentText(a) {
  let s = (a.mode === 'exclude' ? 'Ausgeschlossen: ' : '') + a.label;
  if (a.intent) s += ' (' + a.intent + ')';
  if (a.filterName) s += ' [Filter ' + (a.filterMode === 'exclude' ? 'Ausschluss' : 'Einschluss') + ': ' + a.filterName + ']';
  if (a.extra) s += ' – ' + a.extra;
  return s;
}
export function assignmentSummary(o) {
  if (!o.assignable) return '—';
  if (!o.assignments.length) return 'Nicht zugewiesen';
  return o.assignments.map(assignmentText).join('; ');
}

// Gemeinsames Modell für alle Formate
export function buildModel(snap, an, opts) {
  const areas = opts.areas && opts.areas.size ? opts.areas : new Set(AREAS);
  const objects = (snap.objects || []).filter((o) => areas.has(o.area));
  const groupsByArea = [];
  for (const area of AREAS) {
    if (!areas.has(area)) continue;
    const list = objects.filter((o) => o.area === area).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
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
    title: 'Intune-Dokumentation',
    customer: opts.customer || snap.tenant.displayName || snap.tenant.domain || 'Mandant',
    tenant: snap.tenant,
    scannedAt: snap.scannedAt,
    scannedBy: snap.scannedBy || '',
    partner: opts.partner || '',
    author: opts.author || '',
    sections: opts.sections,
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

function objMetaRows(m, o) {
  const rows = [['Bereich', o.area], ['Kategorie', o.category]];
  if (o.platform) rows.push(['Plattform', o.platform]);
  for (const [k, v] of o.meta || []) rows.push([k, v]);
  if (o.description) rows.push(['Beschreibung', o.description]);
  if (m.notes[o.uid]) rows.push(['Notiz', m.notes[o.uid]]);
  if (o.scopeTags && o.scopeTags.length) rows.push(['Bereichsmarkierungen', o.scopeTags.join(', ')]);
  if (o.created) rows.push(['Erstellt', fmtDateTime(o.created)]);
  if (o.modified) rows.push(['Zuletzt geändert', fmtDateTime(o.modified)]);
  rows.push(['Status', o.assignable ? (status(o) === 'assigned' ? 'Zugewiesen' : 'Nicht zugewiesen') : 'Mandantenweit / nicht zuweisbar']);
  rows.push(['Objekt-ID', o.id]);
  return rows;
}

function settingLabel(s) {
  return (s.path ? s.path + ' › ' : '') + s.label;
}

// ============ Gemeinsame Tabellenblöcke für Geräte & Anbindungen ============
const daysText = (r) => r.days === null || r.days === undefined ? '' : r.days < 0 ? 'abgelaufen seit ' + Math.abs(r.days) + ' Tagen' : 'noch ' + r.days + ' Tage';
export function connectorBlocks(m) {
  const rows = m.an.connectors || [];
  const blocks = [{ intro: 'Ablaufende Zertifikate oder Token stoppen die Verwaltung der betroffenen Geräte. Beim Apple MDM-Push-Zertifikat muss die Verlängerung zwingend mit derselben Apple-ID erfolgen.' }];
  blocks.push({ head: ['Anbindung', 'Name', 'Plattform', 'Gültig bis', 'Status'], widths: [30, 24, 16, 14, 16], rows: rows.map((r) => [r.category, r.name, r.platform || '—', r.expiry ? fmtDate(r.expiry) : '—', daysText(r) || ({ high: 'prüfen', medium: 'prüfen', info: 'nicht verbunden' }[r.sev] || 'OK')]) });
  if (!rows.length) blocks.push({ intro: 'Keine Plattform-Anbindungen gefunden.' });
  return blocks;
}
export function deviceBlocks(m) {
  const d = m.an.devices;
  if (!d || (!d.total && !d.autopilotCount)) return [{ intro: 'Keine verwalteten Geräte gefunden.' }];
  const all = m.devices;
  const pairs = (p) => p.map(([k, n]) => [k, n]);
  const blocks = [];
  blocks.push({ h: 'Geräte je Plattform', head: ['Plattform', 'Geräte', 'Nicht konform', 'Ohne Check-in > 30 Tage', 'Unverschlüsselt', 'Privat'], widths: [24, 12, 16, 20, 16, 12], rows: d.byPlatform.map(([p, n]) => {
    const l = all.filter((x) => x.platform === p);
    return [p, n, l.filter((x) => d.flags.noncompliant.has(x.id)).length, l.filter((x) => d.flags.stale.has(x.id)).length, (p === 'Windows' || p === 'macOS') ? l.filter((x) => d.flags.unencrypted.has(x.id)).length : '—', l.filter((x) => x.owner === 'Privat').length];
  }).concat([['Gesamt', d.total, d.noncompliant.length, d.stale.length, d.unencrypted.length, d.personal.length]]) });
  blocks.push({ h: 'Konformität', head: ['Status', 'Geräte'], widths: [70, 30], rows: pairs(d.byCompliance) });
  blocks.push({ h: 'Registrierungsart', head: ['Art', 'Geräte'], widths: [70, 30], rows: pairs(d.byEnroll) });
  if (d.byJoin.length) blocks.push({ h: 'Windows: Join-Typ', head: ['Join-Typ', 'Geräte'], widths: [70, 30], rows: pairs(d.byJoin) });
  const vrows = [];
  for (const [p, list] of Object.entries(d.versions)) for (const [v, n] of list) vrows.push([p, v, n]);
  blocks.push({ h: 'Betriebssystem-Versionen', head: ['Plattform', 'Version', 'Geräte'], widths: [30, 45, 25], rows: vrows });
  blocks.push({ h: 'Häufigste Modelle', head: ['Hersteller / Modell', 'Geräte'], widths: [70, 30], rows: pairs(d.byModel) });
  if (d.autopilotCount) {
    blocks.push({ h: 'Windows Autopilot', head: ['Group Tag', 'Geräte'], widths: [70, 30], rows: pairs(d.byGroupTag) });
  }
  return blocks;
}
export function deviceListBlocks(m) {
  const blocks = [{ intro: 'Personenbezogene Daten – nur an berechtigte Empfänger weitergeben.' }];
  const sorted = m.devices.slice().sort((a, b) => a.platform.localeCompare(b.platform) || a.name.localeCompare(b.name));
  blocks.push({ h: 'Verwaltete Geräte (' + sorted.length + ')', head: ['Gerät', 'Plattform / Version', 'Benutzer', 'Besitz', 'Konformität', 'Letzter Check-in', 'Seriennummer'], widths: [18, 16, 20, 9, 12, 12, 13], rows: sorted.map((x) => [x.name + (x.model ? '\n' + x.model : ''), x.platform + ' ' + x.osVersion, x.userName || x.user || '—', x.owner, COMPLIANCE[x.compliance] || x.compliance, x.lastSync ? fmtDate(x.lastSync) : '—', x.serial || '—']) });
  if (m.autopilot.length) blocks.push({ h: 'Autopilot-Geräte (' + m.autopilot.length + ')', head: ['Seriennummer', 'Hersteller / Modell', 'Group Tag', 'Status', 'Profil'], widths: [20, 30, 16, 17, 17], rows: m.autopilot.map((a) => [a.serial, [a.manufacturer, a.model].filter(Boolean).join(' '), a.groupTag || '—', a.state, a.profile]) });
  return blocks;
}

// ============ Markdown ============
const mdEsc = (s) => String(s === undefined || s === null ? '' : s).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
function mdTable(head, rows) {
  if (!rows.length) return '_keine Einträge_\n\n';
  return '| ' + head.map(mdEsc).join(' | ') + ' |\n|' + head.map(() => ' --- ').join('|') + '|\n' + rows.map((r) => '| ' + r.map(mdEsc).join(' | ') + ' |').join('\n') + '\n\n';
}

export function toMarkdown(m) {
  const S = m.sections;
  let out = '# ' + m.title + ' – ' + m.customer + '\n\n';
  out += '- Mandant: ' + (m.tenant.domain || '') + (m.tenant.id ? ' (' + m.tenant.id + ')' : '') + '\n';
  out += '- Stand: ' + fmtDateTime(m.scannedAt) + '\n';
  if (m.author) out += '- Erstellt von: ' + m.author + '\n';
  if (m.partner) out += '- Partner: ' + m.partner + '\n';
  out += '- Objekte: ' + m.objects.length + ' · Verwaltete Geräte: ' + m.devices.length + '\n';
  out += '- Erstellt mit Intune Inspector\n\n';
  if (m.demo) out += '> Hinweis: Beispieldaten (Demo-Modus)\n\n';
  if (S.has('summary')) {
    out += '## Management-Zusammenfassung\n\n';
    out += mdTable(['Bereich', 'Objekte', 'Zugewiesen', 'Nicht zugewiesen'], m.areas.map((a) => {
      const x = m.an.byArea.find((b) => b.area === a.area) || {};
      return [a.area, a.count, x.assigned || 0, x.unassigned || 0];
    }));
    out += '### Befunde\n\n' + (m.an.findings.map((f) => '- **' + SEV[f.sev] + ':** ' + f.title + ' – ' + f.text).join('\n') || '_keine_') + '\n\n';
  }
  const mdBlocks = (blocks) => blocks.map((b) => (b.intro ? b.intro + '\n\n' : '') + (b.h ? '### ' + b.h + '\n\n' : '') + (b.head ? mdTable(b.head, b.rows) : '')).join('');
  if (S.has('connectors')) out += '## Plattform-Anbindungen & Ablaufdaten\n\n' + mdBlocks(connectorBlocks(m));
  if (S.has('overview')) {
    out += '## Übersicht\n\n';
    for (const a of m.areas) {
      out += '### ' + a.area + ' (' + a.count + ')\n\n';
      out += mdTable(['Name', 'Kategorie', 'Plattform', 'Zuweisung', 'Geändert'], a.cats.flatMap((c) => c.items.map((o) => [o.name, c.name, o.platform || '—', assignmentSummary(o), fmtDate(o.modified)])));
    }
  }
  if (S.has('details')) {
    out += '## Details\n\n';
    for (const a of m.areas) {
      out += '### ' + a.area + '\n\n';
      for (const c of a.cats) for (const o of c.items) {
        out += '#### ' + o.name + '\n\n';
        out += mdTable(['Eigenschaft', 'Wert'], objMetaRows(m, o));
        if (o.assignable) out += '**Zuweisungen**\n\n' + mdTable(['Ziel', 'Art', 'Absicht', 'Filter', 'Hinweis'], o.assignments.map((x) => [x.label, x.mode === 'exclude' ? 'Ausgeschlossen' : 'Eingeschlossen', x.intent || '', x.filterName ? (x.filterMode === 'exclude' ? 'Ausschluss: ' : 'Einschluss: ') + x.filterName : '', x.extra || '']));
        if (o.settings.length) out += '**Einstellungen (' + o.settings.length + ')**\n\n' + mdTable(['Einstellung', 'Wert'], o.settings.map((s) => [(s.depth ? '↳ ' : '') + settingLabel(s), s.value]));
        if (S.has('code')) for (const cd of o.code || []) out += '**' + cd.title + '**\n\n```' + (cd.lang || '') + '\n' + cd.content + '\n```\n\n';
      }
    }
  }
  if (S.has('targets')) {
    out += '## Zuweisungen nach Gruppe\n\n';
    for (const t of m.targets) {
      out += '### ' + t.label + (t.dynamic ? ' (dynamisch)' : '') + '\n\n';
      out += mdTable(['Objekt', 'Bereich / Kategorie', 'Art', 'Absicht', 'Filter'], t.items.map((i) => [i.name, i.area + ' / ' + i.category, i.mode === 'exclude' ? 'Ausgeschlossen' : 'Eingeschlossen', i.intent, i.filterName ? i.filterMode + ': ' + i.filterName : '']));
    }
  }
  if (S.has('conflicts')) {
    out += '## Konflikte & Dubletten\n\n';
    if (!m.conflicts.length) out += '_keine gefunden_\n\n';
    for (const c of m.conflicts) {
      out += '### ' + (c.kind === 'conflict' ? 'Konflikt' : 'Dublette') + ' (' + SEV[c.sev] + '): ' + c.label + '\n\n';
      out += mdTable(['Richtlinie', 'Wert', 'Zuweisung'], c.entries.map((e) => [e.name, e.value, e.assignmentLabels.join(', ')]));
    }
  }
  if (S.has('unassigned')) {
    out += '## Nicht zugewiesene Objekte\n\n' + mdTable(['Name', 'Bereich', 'Kategorie', 'Geändert'], m.unassigned.map((o) => [o.name, o.area, o.category, fmtDate(o.modified)]));
  }
  if (S.has('devices')) out += '## Geräteinventar\n\n' + mdBlocks(deviceBlocks(m));
  if (S.has('devicelist') && (m.devices.length || m.autopilot.length)) out += '## Geräteliste\n\n' + mdBlocks(deviceListBlocks(m));
  if (S.has('diff') && m.diff) {
    out += '## Änderungen seit ' + m.diffBase + '\n\n' + mdTable(['Art', 'Objekt', 'Bereich', 'Details'], m.diff.map((d) => [d.kind, d.name, d.area, d.details.join('; ')]));
  }
  if (S.has('warnings') && m.warnings.length) {
    out += '## Scan-Hinweise\n\n' + mdTable(['Quelle', 'Hinweis'], m.warnings.map((w) => [w.source, w.message]));
  }
  return out;
}

// ============ HTML (auch Grundlage für PDF) ============
const h = (s) => String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function hTable(head, rows, cls) {
  if (!rows.length) return '<p class="empty">keine Einträge</p>';
  return '<table class="' + (cls || '') + '"><thead><tr>' + head.map((x) => '<th>' + h(x) + '</th>').join('') + '</tr></thead><tbody>' +
    rows.map((r) => '<tr>' + r.map((c) => '<td>' + h(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
}

export function toHtml(m) {
  const S = m.sections;
  const toc = [];
  let body = '';
  const sec = (id, title) => { toc.push([id, title]); return '<h1 id="' + id + '">' + h(title) + '</h1>'; };
  if (S.has('summary')) {
    body += sec('summary', 'Management-Zusammenfassung');
    body += hTable(['Bereich', 'Objekte', 'Zugewiesen', 'Nicht zugewiesen'], m.areas.map((a) => { const x = m.an.byArea.find((b) => b.area === a.area) || {}; return [a.area, a.count, x.assigned || 0, x.unassigned || 0]; }));
    body += '<h2>Befunde</h2><ul class="findings">' + m.an.findings.map((f) => '<li class="sev-' + f.sev + '"><b>' + h(SEV[f.sev]) + ':</b> ' + h(f.title) + ' – ' + h(f.text) + '</li>').join('') + '</ul>';
  }
  const hBlocks = (blocks) => blocks.map((b) => (b.intro ? '<p>' + h(b.intro) + '</p>' : '') + (b.h ? '<h2>' + h(b.h) + '</h2>' : '') + (b.head ? hTable(b.head, b.rows) : '')).join('');
  if (S.has('connectors')) body += sec('connectors', 'Plattform-Anbindungen & Ablaufdaten') + hBlocks(connectorBlocks(m));
  if (S.has('overview')) {
    body += sec('overview', 'Übersicht');
    for (const a of m.areas) body += '<h2>' + h(a.area) + ' (' + a.count + ')</h2>' + hTable(['Name', 'Kategorie', 'Plattform', 'Zuweisung', 'Geändert'], a.cats.flatMap((c) => c.items.map((o) => [o.name, c.name, o.platform || '—', assignmentSummary(o), fmtDate(o.modified)])));
  }
  if (S.has('details')) {
    body += sec('details', 'Details je Objekt');
    for (const a of m.areas) {
      body += '<h2 class="area">' + h(a.area) + '</h2>';
      for (const c of a.cats) for (const o of c.items) {
        body += '<section class="obj"><h3>' + h(o.name) + '</h3>' + hTable(['Eigenschaft', 'Wert'], objMetaRows(m, o), 'kv');
        if (o.assignable) body += '<h4>Zuweisungen</h4>' + hTable(['Ziel', 'Art', 'Absicht', 'Filter', 'Hinweis'], o.assignments.map((x) => [x.label, x.mode === 'exclude' ? 'Ausgeschlossen' : 'Eingeschlossen', x.intent || '', x.filterName ? (x.filterMode === 'exclude' ? 'Ausschluss: ' : 'Einschluss: ') + x.filterName : '', x.extra || '']));
        if (o.settings.length) body += '<h4>Einstellungen (' + o.settings.length + ')</h4>' + hTable(['Einstellung', 'Wert'], o.settings.map((s) => [(s.depth ? '↳ ' : '') + settingLabel(s), s.value]), 'settings');
        if (S.has('code')) for (const cd of o.code || []) body += '<h4>' + h(cd.title) + '</h4><pre>' + h(cd.content) + '</pre>';
        body += '</section>';
      }
    }
  }
  if (S.has('targets')) {
    body += sec('targets', 'Zuweisungen nach Gruppe');
    for (const t of m.targets) body += '<h2>' + h(t.label) + (t.dynamic ? ' (dynamisch)' : '') + '</h2>' + hTable(['Objekt', 'Bereich / Kategorie', 'Art', 'Absicht', 'Filter'], t.items.map((i) => [i.name, i.area + ' / ' + i.category, i.mode === 'exclude' ? 'Ausgeschlossen' : 'Eingeschlossen', i.intent, i.filterName ? i.filterMode + ': ' + i.filterName : '']));
  }
  if (S.has('conflicts')) {
    body += sec('conflicts', 'Konflikte & Dubletten');
    if (!m.conflicts.length) body += '<p class="empty">keine gefunden</p>';
    for (const c of m.conflicts) body += '<h2>' + (c.kind === 'conflict' ? 'Konflikt' : 'Dublette') + ' (' + SEV[c.sev] + '): ' + h(c.label) + '</h2>' + hTable(['Richtlinie', 'Wert', 'Zuweisung'], c.entries.map((e) => [e.name, e.value, e.assignmentLabels.join(', ')]));
  }
  if (S.has('unassigned')) {
    body += sec('unassigned', 'Nicht zugewiesene Objekte') + hTable(['Name', 'Bereich', 'Kategorie', 'Geändert'], m.unassigned.map((o) => [o.name, o.area, o.category, fmtDate(o.modified)]));
  }
  if (S.has('devices')) body += sec('devices', 'Geräteinventar') + hBlocks(deviceBlocks(m));
  if (S.has('devicelist') && (m.devices.length || m.autopilot.length)) body += sec('devicelist', 'Geräteliste') + hBlocks(deviceListBlocks(m));
  if (S.has('diff') && m.diff) {
    body += sec('diff', 'Änderungen seit ' + m.diffBase) + hTable(['Art', 'Objekt', 'Bereich', 'Details'], m.diff.map((d) => [d.kind, d.name, d.area, d.details.join('; ')]));
  }
  if (S.has('warnings') && m.warnings.length) {
    body += sec('warnings', 'Scan-Hinweise') + hTable(['Quelle', 'Hinweis'], m.warnings.map((w) => [w.source, w.message]));
  }
  const cover = '<div class="cover"><div class="brandbar"></div><p class="kicker">' + h(m.partner || 'Intune Inspector') + '</p><h1 class="title">' + h(m.title) + '</h1><p class="customer">' + h(m.customer) + '</p>' +
    '<table class="kv cover-kv"><tbody>' +
    [['Mandant', (m.tenant.domain || '') + (m.tenant.id ? ' · ' + m.tenant.id : '')], ['Stand', fmtDateTime(m.scannedAt)], ['Erstellt von', m.author || m.scannedBy || '—'], ['Objekte', String(m.objects.length)], ['Verwaltete Geräte', String(m.devices.length)]].map((r) => '<tr><td>' + h(r[0]) + '</td><td>' + h(r[1]) + '</td></tr>').join('') +
    '</tbody></table>' + (m.demo ? '<p class="demo">Beispieldaten (Demo-Modus)</p>' : '') +
    '<h2>Inhalt</h2><ol class="toc">' + toc.map(([id, t]) => '<li><a href="#' + id + '">' + h(t) + '</a></li>').join('') + '</ol></div>';
  return '<!doctype html><html lang="de"><head><meta charset="utf-8"><title>' + h(m.title + ' – ' + m.customer) + '</title><style>' + REPORT_CSS + '</style></head><body>' + cover + body + '</body></html>';
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

// ============ CSV ============
const csvCell = (v) => { const s = String(v === undefined || v === null ? '' : v); return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const csv = (rows) => '﻿' + rows.map((r) => r.map(csvCell).join(';')).join('\r\n');

export function toCsvSettings(m) {
  const rows = [['Bereich', 'Kategorie', 'Objekt', 'Plattform', 'Status', 'Einstellung', 'Pfad', 'Wert', 'Objekt-ID']];
  for (const o of m.objects) {
    const st = o.assignable ? (status(o) === 'assigned' ? 'Zugewiesen' : 'Nicht zugewiesen') : 'Mandantenweit';
    if (!o.settings.length) rows.push([o.area, o.category, o.name, o.platform, st, '', '', '', o.id]);
    for (const s of o.settings) rows.push([o.area, o.category, o.name, o.platform, st, s.label, s.path || '', s.value, o.id]);
  }
  return csv(rows);
}
export function toCsvAssignments(m) {
  const rows = [['Bereich', 'Kategorie', 'Objekt', 'Plattform', 'Ziel', 'Art', 'Absicht', 'Filter', 'Filtermodus', 'Hinweis', 'Objekt-ID']];
  for (const o of m.objects) {
    if (!o.assignable) continue;
    if (!o.assignments.length) rows.push([o.area, o.category, o.name, o.platform, '(nicht zugewiesen)', '', '', '', '', '', o.id]);
    for (const a of o.assignments) rows.push([o.area, o.category, o.name, o.platform, a.label, a.mode === 'exclude' ? 'Ausgeschlossen' : 'Eingeschlossen', a.intent || '', a.filterName || '', a.filterMode || '', a.extra || '', o.id]);
  }
  return csv(rows);
}

export function toCsvDevices(m) {
  const rows = [['Gerät', 'Plattform', 'Betriebssystem', 'Version', 'Hersteller', 'Modell', 'Seriennummer', 'Benutzer', 'UPN', 'Besitz', 'Konformität', 'Registrierungsart', 'Join-Typ', 'Verwaltung', 'Verschlüsselt', 'Supervised', 'Jailbreak/Root', 'Autopilot', 'Kategorie', 'Sicherheitspatch', 'Registriert', 'Letzter Check-in', 'Intune-ID', 'Entra-ID']];
  for (const d of m.devices) rows.push([d.name, d.platform, d.os, d.osVersion, d.manufacturer, d.model, d.serial, d.userName, d.user, d.owner, COMPLIANCE[d.compliance] || d.compliance, d.enrollType, d.join, d.agent, d.encrypted ? 'Ja' : 'Nein', d.supervised ? 'Ja' : 'Nein', d.jailbroken ? 'Ja' : 'Nein', d.autopilot ? 'Ja' : 'Nein', d.category, d.patch, fmtDateTime(d.enrolled), fmtDateTime(d.lastSync), d.id, d.entraId]);
  return csv(rows);
}
export function toCsvAutopilot(m) {
  const rows = [['Seriennummer', 'Hersteller', 'Modell', 'Group Tag', 'Bestellnummer', 'Status', 'Profil', 'Zugewiesener Benutzer', 'Gerätename', 'Letzter Kontakt']];
  for (const a of m.autopilot) rows.push([a.serial, a.manufacturer, a.model, a.groupTag, a.order, a.state, a.profile, a.user, a.displayName, a.lastContact ? fmtDateTime(a.lastContact) : '']);
  return csv(rows);
}

// ============ Word ============
export async function toDocx(m) {
  const D = docx;
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType, Footer, Header, PageNumber, TableOfContents, PageBreak, BorderStyle } = D;
  const S = m.sections;
  const P = (text, o) => new Paragraph(Object.assign({ children: [new TextRun(Object.assign({ text: String(text === undefined || text === null ? '' : text) }, (o && o.run) || {}))] }, (o && o.para) || {}));
  const cellBorder = { top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D5E0DF' } };
  const textCell = (t, opts) => new TableCell({
    borders: cellBorder,
    shading: opts && opts.head ? { fill: BRAND, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    width: opts && opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    margins: { top: 50, bottom: 50, left: 90, right: 90 },
    children: String(t === undefined || t === null ? '' : t).split(/\r?\n/).map((line) => new Paragraph({ children: [new TextRun({ text: line, bold: !!(opts && (opts.head || opts.bold)), color: opts && opts.head ? 'FFFFFF' : (opts && opts.muted ? '4A5E5D' : undefined), size: 17 })] }))
  });
  const table = (head, rows, widths) => {
    if (!rows.length) return [P('keine Einträge', { run: { italics: true, color: '6B7F7E', size: 18 } })];
    return [new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ tableHeader: true, children: head.map((x, i) => textCell(x, { head: true, width: widths && widths[i] })) })]
        .concat(rows.map((r) => new TableRow({ cantSplit: true, children: r.map((c, i) => textCell(c, { width: widths && widths[i] })) })))
    }), P('')];
  };
  const kv = (rows) => [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(([k, v]) => new TableRow({ cantSplit: true, children: [textCell(k, { bold: true, muted: true, width: 28 }), textCell(v, { width: 72 })] }))
  }), P('')];
  const H = (text, level) => new Paragraph({ text: String(text), heading: level });
  const code = (content) => String(content || '').split(/\r?\n/).map((line) => new Paragraph({ shading: { fill: 'F1F5F4', type: ShadingType.CLEAR, color: 'auto' }, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: line || ' ', font: 'Consolas', size: 16 })] }));

  const children = [];
  // Titelseite
  children.push(new Paragraph({ spacing: { before: 2400 }, children: [new TextRun({ text: (m.partner || 'Intune Inspector').toUpperCase(), bold: true, color: BRAND, size: 20 })] }));
  children.push(new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: m.title, bold: true, size: 64 })] }));
  children.push(new Paragraph({ spacing: { after: 600 }, children: [new TextRun({ text: m.customer, color: BRAND, size: 40 })] }));
  children.push(...kv([['Mandant', (m.tenant.domain || '') + (m.tenant.id ? ' · ' + m.tenant.id : '')], ['Stand', fmtDateTime(m.scannedAt)], ['Erstellt von', m.author || m.scannedBy || '—'], ['Objekte', String(m.objects.length)], ['Verwaltete Geräte', String(m.devices.length)]]));
  if (m.demo) children.push(P('Beispieldaten (Demo-Modus)', { run: { bold: true, color: '9A5B00' } }));
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(new TableOfContents('Inhalt', { hyperlink: true, headingStyleRange: '1-2' }));
  children.push(P('Hinweis: Beim Öffnen in Word ggf. „Felder aktualisieren“ bestätigen, damit das Inhaltsverzeichnis erscheint.', { run: { italics: true, color: '6B7F7E', size: 16 } }));
  const newSection = (title) => { children.push(new Paragraph({ children: [new PageBreak()] })); children.push(H(title, HeadingLevel.HEADING_1)); };

  if (S.has('summary')) {
    newSection('Management-Zusammenfassung');
    children.push(...table(['Bereich', 'Objekte', 'Zugewiesen', 'Nicht zugewiesen'], m.areas.map((a) => { const x = m.an.byArea.find((b) => b.area === a.area) || {}; return [a.area, a.count, x.assigned || 0, x.unassigned || 0]; }), [46, 18, 18, 18]));
    children.push(H('Befunde', HeadingLevel.HEADING_2));
    for (const f of m.an.findings) children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: SEV[f.sev] + ': ', bold: true, color: f.sev === 'high' ? 'B3261E' : f.sev === 'medium' ? '9A5B00' : undefined }), new TextRun({ text: f.title + ' – ' + f.text })] }));
  }
  const dBlocks = (blocks) => { for (const b of blocks) { if (b.intro) children.push(P(b.intro, { run: { italics: true, color: '4A5E5D' } })); if (b.h) children.push(H(b.h, HeadingLevel.HEADING_2)); if (b.head) children.push(...table(b.head, b.rows, b.widths)); } };
  if (S.has('connectors')) { newSection('Plattform-Anbindungen & Ablaufdaten'); dBlocks(connectorBlocks(m)); }
  if (S.has('overview')) {
    newSection('Übersicht');
    for (const a of m.areas) {
      children.push(H(a.area + ' (' + a.count + ')', HeadingLevel.HEADING_2));
      children.push(...table(['Name', 'Kategorie', 'Plattform', 'Zuweisung', 'Geändert'], a.cats.flatMap((c) => c.items.map((o) => [o.name, c.name, o.platform || '—', assignmentSummary(o), fmtDate(o.modified)])), [28, 20, 12, 28, 12]));
    }
  }
  if (S.has('details')) {
    newSection('Details je Objekt');
    for (const a of m.areas) {
      children.push(H(a.area, HeadingLevel.HEADING_2));
      for (const c of a.cats) for (const o of c.items) {
        children.push(H(o.name, HeadingLevel.HEADING_3));
        children.push(...kv(objMetaRows(m, o)));
        if (o.assignable) { children.push(H('Zuweisungen', HeadingLevel.HEADING_4)); children.push(...table(['Ziel', 'Art', 'Absicht', 'Filter', 'Hinweis'], o.assignments.map((x) => [x.label, x.mode === 'exclude' ? 'Ausgeschlossen' : 'Eingeschlossen', x.intent || '', x.filterName ? (x.filterMode === 'exclude' ? 'Ausschluss: ' : 'Einschluss: ') + x.filterName : '', x.extra || '']), [32, 17, 15, 20, 16])); }
        if (o.settings.length) { children.push(H('Einstellungen (' + o.settings.length + ')', HeadingLevel.HEADING_4)); children.push(...table(['Einstellung', 'Wert'], o.settings.map((s) => [(s.depth ? '↳ ' : '') + settingLabel(s), s.value]), [55, 45])); }
        if (S.has('code')) for (const cd of o.code || []) { children.push(H(cd.title, HeadingLevel.HEADING_4)); children.push(...code(cd.content)); children.push(P('')); }
      }
    }
  }
  if (S.has('targets')) {
    newSection('Zuweisungen nach Gruppe');
    for (const t of m.targets) {
      children.push(H(t.label + (t.dynamic ? ' (dynamisch)' : ''), HeadingLevel.HEADING_2));
      children.push(...table(['Objekt', 'Bereich / Kategorie', 'Art', 'Absicht', 'Filter'], t.items.map((i) => [i.name, i.area + ' / ' + i.category, i.mode === 'exclude' ? 'Ausgeschlossen' : 'Eingeschlossen', i.intent, i.filterName ? i.filterMode + ': ' + i.filterName : '']), [32, 28, 14, 12, 14]));
    }
  }
  if (S.has('conflicts')) {
    newSection('Konflikte & Dubletten');
    if (!m.conflicts.length) children.push(P('Keine gefunden.'));
    for (const c of m.conflicts) {
      children.push(H((c.kind === 'conflict' ? 'Konflikt' : 'Dublette') + ' (' + SEV[c.sev] + '): ' + c.label, HeadingLevel.HEADING_3));
      children.push(...table(['Richtlinie', 'Wert', 'Zuweisung'], c.entries.map((e) => [e.name, e.value, e.assignmentLabels.join(', ')]), [38, 27, 35]));
    }
  }
  if (S.has('unassigned')) {
    newSection('Nicht zugewiesene Objekte');
    children.push(...table(['Name', 'Bereich', 'Kategorie', 'Geändert'], m.unassigned.map((o) => [o.name, o.area, o.category, fmtDate(o.modified)]), [40, 20, 26, 14]));
  }
  if (S.has('devices')) { newSection('Geräteinventar'); dBlocks(deviceBlocks(m)); }
  if (S.has('devicelist') && (m.devices.length || m.autopilot.length)) { newSection('Geräteliste'); dBlocks(deviceListBlocks(m)); }
  if (S.has('diff') && m.diff) {
    newSection('Änderungen seit ' + m.diffBase);
    children.push(...table(['Art', 'Objekt', 'Bereich', 'Details'], m.diff.map((d) => [d.kind, d.name, d.area, d.details.join('\n')]), [12, 28, 18, 42]));
  }
  if (S.has('warnings') && m.warnings.length) {
    newSection('Scan-Hinweise');
    children.push(...table(['Quelle', 'Hinweis'], m.warnings.map((w) => [w.source, w.message]), [35, 65]));
  }

  const doc = new Document({
    creator: m.author || 'Intune Inspector',
    title: m.title + ' – ' + m.customer,
    description: 'Erstellt mit Intune Inspector',
    features: { updateFields: true },
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 20 } },
        heading1: { run: { font: 'Calibri', size: 34, bold: true, color: BRAND }, paragraph: { spacing: { before: 240, after: 160 } } },
        heading2: { run: { font: 'Calibri', size: 27, bold: true, color: BRAND }, paragraph: { spacing: { before: 240, after: 120 } } },
        heading3: { run: { font: 'Calibri', size: 23, bold: true, color: '13201F' }, paragraph: { spacing: { before: 240, after: 80 } } },
        heading4: { run: { font: 'Calibri', size: 20, bold: true, color: '2F4644' }, paragraph: { spacing: { before: 120, after: 60 } } }
      }
    },
    sections: [{
      properties: { page: { margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: m.title + ' – ' + m.customer, color: '6B7F7E', size: 16 })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: ['Seite ', PageNumber.CURRENT, ' von ', PageNumber.TOTAL_PAGES], color: '6B7F7E', size: 16 })] })] }) },
      children
    }]
  });
  return Packer.toBlob(doc);
}

// ============ Hilfen ============
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
  return 'Intune-Doku_' + String(m.customer).replace(/[^A-Za-z0-9ÄÖÜäöüß_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '_' + ds;
}

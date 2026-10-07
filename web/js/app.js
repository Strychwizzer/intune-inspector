// Intune Inspector – Oberfläche
import * as G from './graph.js';
import { scanTenant, SOURCES } from './scanner.js';
import { analyze, diffSnapshots, status } from './analyze.js';
import { AREAS } from './normalize.js';
import { demoSnapshot, demoOlderSnapshot } from './demo.js';
import * as X from './export.js';
import { COMPLIANCE, fmtBytes } from './devices.js';

const root = document.getElementById('root');

// ---------------- Hilfen ----------------
const esc = (s) => String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const fmtDate = (iso) => { if (!iso) return '—'; const d = new Date(iso); return isNaN(d) ? esc(iso) : d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
const fmtDT = (iso) => { if (!iso) return '—'; const d = new Date(iso); return isNaN(d) ? esc(iso) : d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* egal */ } };
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

const PERMS = [
  'DeviceManagementConfiguration.Read.All', 'DeviceManagementApps.Read.All', 'DeviceManagementServiceConfig.Read.All',
  'DeviceManagementManagedDevices.Read.All', 'DeviceManagementRBAC.Read.All', 'DeviceManagementScripts.Read.All',
  'Group.Read.All', 'User.Read'
];

const I = (p, size) => '<svg width="' + (size || 18) + '" height="' + (size || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
const ICON = {
  shield: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B8E06A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 4v5c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V7l8-4z"></path><path d="M9 12l2 2 4-4"></path></svg>',
  dash: I('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'),
  list: I('<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>'),
  users: I('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.8c1.6.8 2.6 2.6 3 5.2"/>'),
  alert: I('<path d="M12 3l9 16H3l9-16z"/><path d="M12 10v4M12 17h.01"/>'),
  clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  file: I('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z"/><path d="M14 3v6h6M12 18v-6M9 15l3 3 3-3"/>'),
  log: I('<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>'),
  gear: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  search: I('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>', 16),
  sun: I('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  moon: I('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
  refresh: I('<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/>', 16),
  check: I('<path d="M5 12l5 5L20 7"/>', 16),
  x: I('<path d="M6 6l12 12M18 6L6 18"/>', 16),
  phone: I('<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>'),
  plug: I('<path d="M9 3v5M15 3v5"/><path d="M6 8h12v3a6 6 0 0 1-12 0V8z"/><path d="M12 17v4"/>'),
  copy: I('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>', 16)
};
const msLogo = '<svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true"><rect x="1" y="1" width="9" height="9" fill="#F25022"/><rect x="11" y="1" width="9" height="9" fill="#7FBA00"/><rect x="1" y="11" width="9" height="9" fill="#00A4EF"/><rect x="11" y="11" width="9" height="9" fill="#FFB900"/></svg>';

// ---------------- Zustand ----------------
const state = {
  screen: 'boot', view: 'dashboard', info: {}, cfg: {}, account: null, error: '', busy: false,
  snap: null, an: null, notes: {}, viewingSaved: null,
  scan: { rows: {}, done: 0 },
  q: '', area: 'Alle', statusF: 'all', platformF: 'Alle', selUid: null, detailQ: '',
  targetKey: null, targetQ: '', confKind: 'conflict',
  devTab: 'managed', devPlatform: 'Alle', devComp: 'all', devOwner: 'all', devFlag: 'all', devQ: '', devSel: null,
  snapshots: [], compareName: '', compareSnap: null, diff: null,
  ex: { format: 'docx', sections: new Set(X.SECTIONS.map((s) => s[0]).filter((k) => k !== 'diff' && k !== 'devicelist')), areas: new Set(AREAS), partner: lsGet('ii.partner', ''), author: lsGet('ii.author', ''), customer: '' },
  toast: ''
};

function setTheme(t) { document.documentElement.dataset.theme = t; lsSet('ii.theme', t); }
setTheme(lsGet('ii.theme', 'dark'));

async function api(path, opts) {
  const r = await fetch(path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts || {}));
  if (!r.ok) throw new Error((await r.text()) || ('HTTP ' + r.status));
  return r.json();
}

let toastTimer;
function toast(msg) { state.toast = msg; render(); clearTimeout(toastTimer); toastTimer = setTimeout(() => { state.toast = ''; render(); }, 3200); }

// ---------------- Render ----------------
function render() {
  const a = document.activeElement;
  const fid = a && a.id;
  const sel = a && typeof a.selectionStart === 'number' ? [a.selectionStart, a.selectionEnd] : null;
  const scrollers = {};
  root.querySelectorAll('[data-keep-scroll]').forEach((el) => { scrollers[el.dataset.keepScroll] = el.scrollTop; });
  const fn = SCREENS[state.screen] || SCREENS.boot;
  root.innerHTML = fn() + (state.toast ? '<div class="toast" role="status">' + esc(state.toast) + '</div>' : '');
  root.querySelectorAll('[data-keep-scroll]').forEach((el) => { if (scrollers[el.dataset.keepScroll] !== undefined) el.scrollTop = scrollers[el.dataset.keepScroll]; });
  if (fid) {
    const el = document.getElementById(fid);
    if (el) { el.focus(); if (sel && el.setSelectionRange) { try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* */ } } }
  }
}
const renderSoon = debounce(render, 140);

const SCREENS = {
  boot: () => '<div class="center"><div class="spinner"></div></div>',
  setup: screenSetup,
  login: screenLogin,
  scanning: screenScanning,
  app: screenApp
};

function brand() {
  return '<div class="brandrow"><div class="logo">' + ICON.shield + '</div><div><div class="name">Intune Inspector</div><div class="small muted">' + esc(state.cfg.brandLabel || 'Intune-Dokumentation & Analyse') + '</div></div></div>';
}

function screenSetup() {
  const ru = state.info.redirectUri || (location.origin + '/redirect.html');
  return '<div class="center"><div class="wrap wide">' + brand() +
    '<div class="card"><h1>Einmalige Einrichtung</h1>' +
    '<p class="muted">Intune Inspector meldet sich über eine eigene App-Registrierung in Entra ID an. Diese wird einmal angelegt und kann für alle Kundentenants genutzt werden.</p>' +
    '<ol class="steps">' +
    '<li>Im Entra Admin Center unter <b>App-Registrierungen › Neue Registrierung</b> eine App „Intune Inspector“ anlegen. Unterstützte Kontotypen: <b>Konten in einem beliebigen Organisationsverzeichnis (mehrinstanzenfähig)</b>.</li>' +
    '<li>Plattform <b>Single-Page-Anwendung (SPA)</b> hinzufügen mit dieser Umleitungs-URI:<div class="copyrow" style="margin-top:8px"><code>' + esc(ru) + '</code><button class="btn" data-act="copy" data-text="' + esc(ru) + '">' + ICON.copy + 'Kopieren</button></div></li>' +
    '<li>Unter <b>API-Berechtigungen › Microsoft Graph › Delegiert</b> diese Rechte hinzufügen:<div class="permlist" style="margin-top:8px">' + PERMS.map((p) => '<span class="chip mono">' + p + '</span>').join('') + '</div></li>' +
    '<li>Im jeweiligen Kundentenant einmal die <b>Administratorzustimmung</b> erteilen (passiert beim ersten Login eines Admins automatisch über den Zustimmungsdialog).</li>' +
    '<li>Die <b>Anwendungs-ID (Client-ID)</b> hier eintragen.</li></ol>' +
    '<label class="field" for="cfgClient">Anwendungs-ID (Client-ID)<input class="input mono" id="cfgClient" placeholder="00000000-0000-0000-0000-000000000000" value="' + esc(state.cfg.clientId || '') + '"></label>' +
    '<label class="field" for="cfgTenant">Standard-Tenant (optional, z. B. für den eigenen Tenant)<input class="input mono" id="cfgTenant" placeholder="kunde.onmicrosoft.com" value="' + esc(state.cfg.defaultTenant || '') + '"></label>' +
    (state.error ? '<div class="err">' + esc(state.error) + '</div>' : '') +
    '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn primary lg" data-act="saveSetup">Speichern und weiter</button><button class="btn lg" data-act="demo">Erst einmal die Demo ansehen</button></div>' +
    '</div><p class="small faint" style="text-align:center">Version ' + esc(state.info.version || '') + ' · Daten bleiben lokal: ' + esc(state.info.dataDir || '') + '</p></div></div>';
}

function screenLogin() {
  const acc = state.account;
  return '<div class="center"><div class="wrap">' + brand() +
    '<div class="card"><div style="display:flex;flex-direction:column;gap:6px"><h1>Am Kundentenant anmelden</h1><p class="muted">Liest alle Intune-Konfigurationen – ausschließlich lesend, es werden keine Änderungen vorgenommen.</p></div>' +
    '<label class="field" for="loginTenant">Kundentenant (Domain oder Tenant-ID)<input class="input mono" id="loginTenant" placeholder="kunde.onmicrosoft.com" value="' + esc(lsGet('ii.lastTenant', state.cfg.defaultTenant || '')) + '"></label>' +
    '<p class="small faint" style="margin-top:-8px">Für Partner-Zugriff (GDAP) unbedingt den Kundentenant angeben, sonst landet die Anmeldung im eigenen Tenant.</p>' +
    (acc ? '<button class="btn primary lg" data-act="continue">Als ' + esc(acc.username) + ' fortfahren</button>' : '') +
    '<button class="btn ms lg" data-act="login" ' + (state.busy ? 'disabled' : '') + '>' + msLogo + (acc ? 'Mit anderem Konto anmelden' : 'Mit Microsoft anmelden') + '</button>' +
    (state.error ? '<div class="err">' + state.error + '</div>' : '') +
    '<div style="display:flex;flex-wrap:wrap;gap:8px"><span class="chip">Nur Leserechte</span><span class="chip">GDAP-fähig</span><span class="chip">Daten bleiben lokal</span></div>' +
    '</div><div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap"><button class="btn ghost" data-act="demo">Demo mit Beispieldaten</button><button class="btn ghost" data-act="openSetup">Einrichtung / Client-ID</button><button class="btn ghost" data-act="theme">' + (document.documentElement.dataset.theme === 'light' ? 'Dunkles Design' : 'Helles Design') + '</button></div></div></div>';
}

function screenScanning() {
  const rows = SOURCES.map((s) => state.scan.rows[s.key] || { label: s.label, state: 'pending' }).concat(state.scan.rows.resolve ? [state.scan.rows.resolve] : []);
  const done = rows.filter((r) => r.state === 'done' || r.state === 'error').length;
  const pct = Math.round(done / (SOURCES.length + 1) * 100);
  const st = (s) => s === 'running' ? '<span class="spinner"></span>' : s === 'done' ? '<span style="color:var(--lime)">' + ICON.check + '</span>' : s === 'error' ? '<span style="color:var(--red-text)">' + ICON.x + '</span>' : '<span class="faint">·</span>';
  return '<div class="center"><div class="wrap wide">' + brand() + '<div class="card"><h1>Mandant wird gelesen …</h1><p class="muted">Alle Bereiche werden nacheinander abgefragt. Bei großen Mandanten kann das ein paar Minuten dauern.</p>' +
    '<div class="progress" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><div style="width:' + pct + '%"></div></div>' +
    '<div class="scanlist" data-keep-scroll="scan">' + rows.map((r) => '<div class="scanrow"><span class="st">' + st(r.state) + '</span><span>' + esc(r.label) + '</span><span class="info">' + esc(r.info || '') + '</span></div>').join('') + '</div></div></div></div>';
}

// ---------------- App-Rahmen ----------------
function screenApp() {
  const s = state.snap, an = state.an;
  const nav = (id, icon, label, cnt, bad) => '<button class="navbtn' + (state.view === id ? ' on' : '') + '" data-act="nav" data-view="' + id + '">' + icon + label + (cnt !== undefined && cnt !== null ? '<span class="cnt' + (bad ? ' bad' : '') + '">' + cnt + '</span>' : '') + '</button>';
  const realConf = an.conflicts.filter((c) => c.kind === 'conflict').length;
  const initials = (state.account && state.account.username ? state.account.username.slice(0, 2) : (s.demo ? 'DE' : '??')).toUpperCase();
  const views = { dashboard: viewDashboard, devices: viewDevices, objects: viewObjects, targets: viewTargets, conflicts: viewConflicts, snapshots: viewSnapshots, export: viewExport, log: viewLog, settings: viewSettings };
  return '<div class="app"><header class="topbar">' +
    '<div style="display:flex;align-items:center;gap:10px"><div class="logo sm">' + ICON.shield + '</div><span class="title">Intune Inspector</span></div>' +
    '<div class="tenantpill"><span class="dot"></span><b class="small">' + esc(s.tenant.displayName || 'Mandant') + '</b><span class="dom">' + esc(s.tenant.domain || '') + '</span></div>' +
    '<div class="search"><label for="q">' + ICON.search + '<span class="sr">Suche</span><input id="q" data-in="q" placeholder="Objekte und Einstellungen durchsuchen, z. B. „BitLocker“" value="' + esc(state.q) + '" autocomplete="off"><span class="kbd">Strg K</span></label></div>' +
    '<div class="right">' + (s.demo ? '<span class="badge b-warn">Demo</span>' : '<span class="badge b-ok">Nur lesen</span>') +
    '<button class="iconbtn" data-act="theme" aria-label="Design wechseln" title="Design wechseln">' + (document.documentElement.dataset.theme === 'light' ? ICON.moon : ICON.sun) + '</button>' +
    '<button class="avatar" data-act="logout" title="Abmelden' + (state.account ? ' (' + esc(state.account.username) + ')' : '') + '" aria-label="Abmelden">' + esc(initials) + '</button></div></header>' +
    '<div class="body"><nav class="sidebar" aria-label="Hauptnavigation">' +
    '<span class="sect">Analyse</span>' +
    nav('dashboard', ICON.dash, 'Übersicht') +
    nav('devices', ICON.phone, 'Geräte', (s.devices || []).length) +
    nav('objects', ICON.list, 'Objekte', an.total) +
    nav('targets', ICON.users, 'Zuweisungen', an.targets.length) +
    nav('conflicts', ICON.alert, 'Konflikte', realConf || null, realConf > 0) +
    '<span class="sect">Dokumentation</span>' +
    nav('snapshots', ICON.clock, 'Snapshots & Vergleich') +
    nav('export', ICON.file, 'Doku-Export') +
    nav('log', ICON.log, 'Scan-Protokoll', s.warnings.length || null) +
    nav('settings', ICON.gear, 'Einstellungen') +
    '<div class="lastscan"><span class="muted">' + (state.viewingSaved ? 'Gespeicherter Snapshot' : 'Letzter Scan') + '</span><b>' + fmtDT(s.scannedAt) + '</b><span class="muted">' + an.total + ' Objekte · ' + an.settingsCount + ' Einstellungen</span>' +
    (!s.demo ? '<button class="btn" style="margin-top:8px;min-height:34px" data-act="rescan">' + ICON.refresh + 'Neu scannen</button>' : '') + '</div>' +
    '</nav><main class="main" id="main"><div class="page">' +
    (state.viewingSaved ? '<div class="banner">Ansicht eines gespeicherten Snapshots (' + esc(state.viewingSaved) + '). <button class="btn ghost" data-act="backToLive">Zurück zum aktuellen Scan</button></div>' : '') +
    (views[state.view] || viewDashboard)() + '</div></main></div></div>';
}

function head(title, sub, actions) {
  return '<div class="pagehead"><div style="display:flex;flex-direction:column;gap:4px"><h1>' + esc(title) + '</h1>' + (sub ? '<p class="muted">' + sub + '</p>' : '') + '</div>' + (actions ? '<div class="actions">' + actions + '</div>' : '') + '</div>';
}

// ---------------- Übersicht ----------------
function viewDashboard() {
  const an = state.an;
  const realConf = an.conflicts.filter((c) => c.kind === 'conflict');
  const pctDesc = an.assignableCount ? Math.round(an.withDesc.length / an.assignableCount * 100) : 0;
  const max = Math.max(1, ...an.byArea.map((b) => b.total));
  const recent = state.snap.objects.filter((o) => o.modified).slice().sort((a, b) => String(b.modified).localeCompare(String(a.modified))).slice(0, 8);
  return head('Übersicht', 'Bestandsaufnahme der Intune-Konfiguration von ' + esc(state.snap.tenant.displayName || state.snap.tenant.domain), '<button class="btn primary" data-act="nav" data-view="export">Dokumentation erzeugen</button>') +
    '<div class="kpis">' +
    kpi('Objekte gesamt', an.total, an.byArea.length + ' Bereiche · ' + an.settingsCount + ' Einstellungen', 'objects', null) +
    kpi('Nicht zugewiesen', an.unassigned.length, 'Kandidaten zum Aufräumen', 'objects', 'unassigned', 'var(--amber)') +
    kpi('Einstellungskonflikte', realConf.length, realConf.filter((c) => c.sev === 'high').length + ' mit überlappender Zuweisung', 'conflicts', null, 'var(--red-text)') +
    kpi('Gelöschte Gruppen', an.deletedGroupRefs.length, 'Objekte mit verwaisten Zuweisungen', 'objects', 'deletedgroup', an.deletedGroupRefs.length ? 'var(--red-text)' : null) +
    kpi('Verwaltete Geräte', an.devices.total, an.devices.byPlatform.map(([p, n]) => n + ' ' + p).join(' · ') || 'keine', 'devices', null) +
    kpi('Mit Beschreibung', pctDesc + ' %', 'Dokumentationsgrad in Intune', 'objects', null, 'var(--lime)') +
    '</div>' + connectorPanel() + '<div class="row">' +
    '<section class="panel" style="flex:3 1 420px"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><h2>Objekte nach Bereich</h2></div><div class="bars">' +
    an.byArea.map((b) => '<button class="bar" style="background:none;border:none;color:inherit;text-align:left;padding:0" data-act="area" data-area="' + esc(b.area) + '"><div class="top"><span>' + esc(b.area) + '</span><span class="mono muted">' + b.total + '</span></div><div class="track"><div class="a" style="width:' + (b.assigned / max * 100) + '%"></div><div class="u" style="width:' + (b.unassigned / max * 100) + '%"></div><div class="i" style="width:' + (b.info / max * 100) + '%"></div></div></button>').join('') +
    '</div><div class="legend"><span><i style="background:var(--accent)"></i>zugewiesen</span><span><i style="background:var(--amber)"></i>nicht zugewiesen</span><span><i style="background:var(--blue);opacity:.7"></i>mandantenweit</span></div></section>' +
    '<section class="panel" style="flex:2 1 340px"><h2>Wichtigste Befunde</h2>' +
    (an.findings.length ? an.findings.map((f) => '<button class="finding" data-act="finding" data-view="' + f.view + '" data-filter="' + (f.filter || '') + '" data-uid="' + esc(f.uid || '') + '" data-dfilter="' + (f.dfilter || '') + '"><span class="d d-' + f.sev + '"></span><span style="display:flex;flex-direction:column;gap:2px"><b style="font-weight:500">' + esc(f.title) + '</b><span class="small muted">' + esc(f.text) + '</span></span></button>').join('') : '<p class="muted">Keine Auffälligkeiten.</p>') +
    '</section></div>' +
    '<section class="panel"><div style="display:flex;justify-content:space-between;align-items:baseline"><h2>Zuletzt geändert</h2><button class="btn ghost" data-act="nav" data-view="objects">Alle Objekte</button></div><div class="tablewrap"><table class="t"><thead><tr><th>Name</th><th>Bereich</th><th>Kategorie</th><th>Geändert</th></tr></thead><tbody>' +
    recent.map((o) => '<tr class="click" data-act="open" data-uid="' + esc(o.uid) + '"><td class="name">' + esc(o.name) + '</td><td class="muted">' + esc(o.area) + '</td><td class="muted">' + esc(o.category) + '</td><td class="muted">' + fmtDate(o.modified) + '</td></tr>').join('') +
    '</tbody></table></div></section>';
}
function daysBadge(r) {
  if (r.days === null || r.days === undefined) return r.sev === 'info' ? '<span class="badge b-neutral">nicht verbunden</span>' : r.sev === 'medium' || r.sev === 'high' ? '<span class="badge b-warn">prüfen</span>' : '<span class="badge b-ok">OK</span>';
  const cls = r.sev === 'high' ? 'b-bad' : r.sev === 'medium' ? 'b-warn' : 'b-ok';
  return '<span class="badge ' + cls + '">' + (r.days < 0 ? 'abgelaufen' : 'noch ' + r.days + ' Tage') + '</span>';
}
function connectorPanel() {
  const rows = state.an.connectors;
  if (!rows.length) return '';
  return '<section class="panel"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap"><h2>Plattform-Anbindungen & Ablaufdaten</h2><span class="small muted">Zertifikate und Token, deren Ablauf die Geräteverwaltung stoppt</span></div><div class="tablewrap"><table class="t"><thead><tr><th>Anbindung</th><th>Name</th><th>Plattform</th><th>Gültig bis</th><th>Status</th></tr></thead><tbody>' +
    rows.map((r) => '<tr class="click" data-act="open" data-uid="' + esc(r.uid) + '"><td class="wrap">' + esc(r.category) + '</td><td class="name wrap">' + esc(r.name) + '</td><td class="muted">' + esc(r.platform || '—') + '</td><td class="muted">' + (r.expiry ? fmtDate(r.expiry) : '—') + '</td><td>' + daysBadge(r) + '</td></tr>').join('') +
    '</tbody></table></div></section>';
}
function kpi(lbl, val, sub, view, filter, color) {
  return '<button class="kpi" data-act="finding" data-view="' + view + '" data-filter="' + (filter || '') + '"><span class="lbl">' + esc(lbl) + '</span><span class="val"' + (color ? ' style="color:' + color + '"' : '') + '>' + esc(val) + '</span><span class="sub">' + esc(sub) + '</span></button>';
}

// ---------------- Objekte ----------------
const STATUS_F = [
  ['all', 'Alle Status'], ['assigned', 'Zugewiesen'], ['unassigned', 'Nicht zugewiesen'], ['info', 'Mandantenweit'],
  ['conflict', 'Mit Konflikt'], ['deletedgroup', 'Gelöschte Gruppe'], ['inexclude', 'Ein- & Ausschluss gleiche Gruppe'], ['dupname', 'Doppelter Name'], ['stale', 'Über 12 Monate unverändert']
];

function matchQuery(o, q) {
  if (!q) return { ok: true };
  if (o.name.toLowerCase().includes(q) || o.category.toLowerCase().includes(q) || (o.description || '').toLowerCase().includes(q) || o.area.toLowerCase().includes(q)) return { ok: true };
  const s = o.settings.find((x) => x.label.toLowerCase().includes(q) || String(x.value).toLowerCase().includes(q) || (x.path || '').toLowerCase().includes(q));
  if (s) return { ok: true, hit: s.label + ' = ' + s.value };
  const a = o.assignments.find((x) => (x.label || '').toLowerCase().includes(q) || (x.filterName || '').toLowerCase().includes(q));
  if (a) return { ok: true, hit: 'Zuweisung: ' + X.assignmentText(a) };
  if ((o.code || []).some((c) => c.content.toLowerCase().includes(q))) return { ok: true, hit: 'Treffer im Skriptinhalt' };
  if ((state.notes[o.uid] || '').toLowerCase().includes(q)) return { ok: true, hit: 'Treffer in Notiz' };
  return { ok: false };
}

function filteredObjects() {
  const q = state.q.trim().toLowerCase();
  const out = [];
  for (const o of state.snap.objects) {
    if (state.area !== 'Alle' && o.area !== state.area) continue;
    if (state.platformF !== 'Alle' && o.platform !== state.platformF) continue;
    const sf = state.statusF;
    if (sf !== 'all') {
      if (['assigned', 'unassigned', 'info'].includes(sf)) { if (status(o) !== sf) continue; }
      else if (state.an.flags[sf] && !state.an.flags[sf].has(o.uid)) continue;
    }
    const m = matchQuery(o, q);
    if (!m.ok) continue;
    out.push([o, m.hit]);
  }
  out.sort((a, b) => AREAS.indexOf(a[0].area) - AREAS.indexOf(b[0].area) || a[0].category.localeCompare(b[0].category) || a[0].name.localeCompare(b[0].name));
  return out;
}

function badgeFor(o) {
  const st = status(o);
  if (state.an.flags.conflict.has(o.uid)) return '<span class="badge b-bad">Konflikt</span>';
  if (state.an.flags.deletedgroup.has(o.uid)) return '<span class="badge b-bad">Gelöschte Gruppe</span>';
  if (st === 'unassigned') return '<span class="badge b-warn">Nicht zugewiesen</span>';
  if (st === 'info') return '<span class="badge b-neutral">Mandantenweit</span>';
  if (o.assignments.some((a) => a.filterName)) return '<span class="badge b-info">Mit Filter</span>';
  return '<span class="badge b-ok">Zugewiesen</span>';
}

function viewObjects() {
  const list = filteredObjects();
  const counts = {};
  for (const o of state.snap.objects) counts[o.area] = (counts[o.area] || 0) + 1;
  const platforms = [...new Set(state.snap.objects.map((o) => o.platform).filter(Boolean))].sort();
  const shown = list.slice(0, 600);
  if (state.selUid && !state.snap.objects.some((o) => o.uid === state.selUid)) state.selUid = null;
  const sel = state.selUid ? state.snap.objects.find((o) => o.uid === state.selUid) : (shown[0] && shown[0][0]);
  return head('Objekte', list.length + ' von ' + state.an.total + ' Objekten' + (state.q ? ' · Suche „' + esc(state.q) + '“' : '')) +
    '<div class="filters">' + ['Alle'].concat(AREAS.filter((a) => counts[a])).map((a) => '<button class="pill' + (state.area === a ? ' on' : '') + '" data-act="area" data-area="' + esc(a) + '">' + esc(a) + '<span class="n">' + (a === 'Alle' ? state.an.total : counts[a]) + '</span></button>').join('') + '</div>' +
    '<div class="filters"><label class="sr" for="statusF">Status</label><select class="input" id="statusF" data-ch="statusF">' + STATUS_F.map(([k, l]) => '<option value="' + k + '"' + (state.statusF === k ? ' selected' : '') + '>' + l + '</option>').join('') + '</select>' +
    '<label class="sr" for="platformF">Plattform</label><select class="input" id="platformF" data-ch="platformF"><option value="Alle">Alle Plattformen</option>' + platforms.map((p) => '<option' + (state.platformF === p ? ' selected' : '') + '>' + esc(p) + '</option>').join('') + '</select>' +
    ((state.area !== 'Alle' || state.statusF !== 'all' || state.platformF !== 'Alle' || state.q) ? '<button class="btn ghost" data-act="resetFilters">Filter zurücksetzen</button>' : '') + '</div>' +
    '<div class="split"><section class="panel listcol" style="padding:6px 0"><div class="tablewrap" data-keep-scroll="objlist"><table class="t" style="min-width:640px"><thead><tr><th style="width:32%">Name</th><th style="width:20%">Kategorie</th><th>Plattform</th><th style="width:24%">Zuweisung</th><th>Status</th></tr></thead><tbody>' +
    (shown.length ? shown.map(([o, hit]) => '<tr class="click' + (sel && sel.uid === o.uid ? ' sel' : '') + '" data-act="select" data-uid="' + esc(o.uid) + '"><td class="name wrap">' + esc(o.name) + (hit ? '<div class="small faint" style="font-weight:400">' + esc(hit.length > 120 ? hit.slice(0, 120) + '…' : hit) + '</div>' : '') + '</td><td class="muted wrap">' + esc(o.category) + '</td><td class="muted">' + esc(o.platform || '—') + '</td><td class="muted wrap">' + esc(assignShort(o)) + '</td><td>' + badgeFor(o) + '</td></tr>').join('') : '<tr><td colspan="5"><div class="emptybox">Kein Objekt passt zu Filter und Suche.</div></td></tr>') +
    '</tbody></table>' + (list.length > shown.length ? '<p class="small muted" style="padding:10px 12px">Es werden die ersten ' + shown.length + ' Treffer angezeigt. Bitte Filter oder Suche verfeinern.</p>' : '') + '</div></section>' +
    '<aside class="panel detailcol" data-keep-scroll="detail">' + (sel ? detail(sel) : '<div class="emptybox">Objekt auswählen</div>') + '</aside></div>';
}

function assignShort(o) {
  if (!o.assignable) return '—';
  const inc = o.assignments.filter((a) => a.mode === 'include');
  const exc = o.assignments.filter((a) => a.mode === 'exclude');
  if (!inc.length) return 'Nicht zugewiesen';
  let s = inc.length <= 2 ? inc.map((a) => a.label + (a.intent ? ' (' + a.intent + ')' : '')).join(', ') : inc.length + ' Ziele';
  if (exc.length) s += ' · ' + exc.length + ' Ausschl.';
  return s;
}

function detail(o) {
  const dq = state.detailQ.trim().toLowerCase();
  const settings = dq ? o.settings.filter((s) => s.label.toLowerCase().includes(dq) || String(s.value).toLowerCase().includes(dq) || (s.path || '').toLowerCase().includes(dq)) : o.settings;
  const meta = [['Bereich', o.area], ['Kategorie', o.category]];
  if (o.platform) meta.push(['Plattform', o.platform]);
  for (const [k, v] of o.meta || []) meta.push([k, v]);
  if (o.scopeTags && o.scopeTags.length) meta.push(['Bereichsmarkierungen', o.scopeTags.join(', ')]);
  meta.push(['Erstellt', fmtDT(o.created)], ['Geändert', fmtDT(o.modified)]);
  let html = '<div style="display:flex;flex-direction:column;gap:6px"><span class="small muted">' + esc(o.area) + ' · ' + esc(o.category) + '</span><h2 style="font-size:18px">' + esc(o.name) + '</h2>' + badgeFor(o).replace('class="badge', 'style="align-self:flex-start" class="badge') + '</div>';
  if (o.description) html += '<p class="small" style="color:var(--text2)">' + esc(o.description) + '</p>';
  html += '<dl class="kv">' + meta.map(([k, v]) => '<dt>' + esc(k) + '</dt><dd>' + (k === 'Erstellt' || k === 'Geändert' ? v : esc(v)) + '</dd>').join('') + '</dl>';
  if (o.assignable) {
    html += '<div style="display:flex;flex-direction:column;gap:6px"><span class="sectlabel">Zuweisungen</span>' +
      (o.assignments.length ? o.assignments.map((a) => '<div class="assign"><span>' + (a.deletedGroup ? '<span class="badge b-bad">gelöscht</span> ' : '') + esc(a.label) + (a.dynamic ? ' <span class="faint small">(dynamisch)</span>' : '') +
        (a.filterName ? '<span class="small faint" style="display:block">Filter ' + (a.filterMode === 'exclude' ? 'Ausschluss' : 'Einschluss') + ': ' + esc(a.filterName) + '</span>' : '') + (a.extra ? '<span class="small faint" style="display:block">' + esc(a.extra) + '</span>' : '') + '</span>' +
        '<span class="small ' + (a.mode === 'exclude' ? 'm-exc' : 'm-inc') + '" style="text-align:right">' + (a.mode === 'exclude' ? 'ausgeschlossen' : 'eingeschlossen') + (a.intent ? '<br>' + esc(a.intent) : '') + '</span></div>').join('') : '<div class="assign"><span>Keine Zuweisung</span><span class="small" style="color:var(--amber)">Aufräum-Kandidat</span></div>') + '</div>';
  }
  html += '<div style="display:flex;flex-direction:column;gap:4px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span class="sectlabel">Einstellungen (' + o.settings.length + ')</span>' +
    (o.settings.length > 8 ? '<input class="input" style="max-width:200px;min-height:32px;padding:4px 10px;font-size:12px" id="detailQ" data-in="detailQ" placeholder="filtern" value="' + esc(state.detailQ) + '" aria-label="Einstellungen filtern">' : '') + '</div>' +
    (settings.length ? settings.map((s) => '<div class="setting d' + Math.min(2, s.depth || 0) + '"><span class="l">' + (s.path ? '<span class="p">' + esc(s.path) + '</span>' : '') + esc(s.label) + '</span><span class="v">' + esc(s.value) + '</span></div>').join('') : '<p class="small muted">' + (o.settings.length ? 'Kein Treffer.' : 'Keine konfigurierten Werte gefunden.') + '</p>') + '</div>';
  for (const c of o.code || []) html += '<details class="code"><summary>' + esc(c.title) + ' <span class="faint small">(' + c.content.split('\n').length + ' Zeilen)</span></summary><pre>' + esc(c.content) + '</pre></details>';
  html += '<label class="field" for="note">Notiz für die Doku<textarea class="input" id="note" data-in="note" data-uid="' + esc(o.uid) + '" placeholder="Zweck, Ansprechpartner, Ticket …">' + esc(state.notes[o.uid] || '') + '</textarea></label>';
  html += '<details class="code"><summary>Rohdaten (JSON)</summary><pre>' + esc(JSON.stringify(o.raw || {}, null, 2)) + '</pre></details>';
  return html;
}

// ---------------- Geräte ----------------
const DEV_FLAGS = [['all', 'Alle Geräte'], ['noncompliant', 'Nicht konform'], ['grace', 'Im Kulanzzeitraum'], ['stale', 'Über 30 Tage ohne Check-in'], ['unencrypted', 'Unverschlüsselt (Windows/macOS)'], ['jailbroken', 'Jailbreak / Root'], ['personal', 'Privatgeräte']];
const compBadge = (c) => {
  const l = COMPLIANCE[c] || c;
  const cls = c === 'compliant' ? 'b-ok' : c === 'noncompliant' || c === 'error' || c === 'conflict' ? 'b-bad' : c === 'inGracePeriod' ? 'b-warn' : 'b-neutral';
  return '<span class="badge ' + cls + '">' + esc(l) + '</span>';
};
function syncCell(iso) {
  if (!iso) return '—';
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86400000);
  const txt = days <= 0 ? 'heute' : days === 1 ? 'gestern' : 'vor ' + days + ' Tagen';
  return '<span' + (days > 30 ? ' style="color:var(--amber)"' : '') + ' title="' + fmtDT(iso) + '">' + txt + '</span>';
}

function viewDevices() {
  const all = state.snap.devices || [];
  const ap = state.snap.autopilot || [];
  const dv = state.an.devices;
  const tabs = '<div class="filters"><button class="pill' + (state.devTab === 'managed' ? ' on' : '') + '" data-act="devTab" data-tab="managed">Verwaltete Geräte<span class="n">' + all.length + '</span></button><button class="pill' + (state.devTab === 'autopilot' ? ' on' : '') + '" data-act="devTab" data-tab="autopilot">Autopilot-Geräte<span class="n">' + ap.length + '</span></button></div>';
  if (!all.length && !ap.length) {
    return head('Geräte', 'Inventar aller in Intune verwalteten Geräte.') + '<div class="panel"><div class="emptybox">Keine Geräte gefunden' + (state.snap.warnings.some((w) => /Geräte/.test(w.source)) ? ' – siehe Scan-Protokoll (evtl. fehlt DeviceManagementManagedDevices.Read.All).' : '.') + '</div></div>';
  }
  if (state.devTab === 'autopilot') return head('Geräte', 'Bei Windows Autopilot registrierte Hardware – auch Geräte, die noch nicht ausgerollt sind.') + tabs + viewAutopilot(ap, dv);

  const q = state.devQ.trim().toLowerCase();
  const list = all.filter((d) => {
    if (state.devPlatform !== 'Alle' && d.platform !== state.devPlatform) return false;
    if (state.devComp !== 'all' && d.compliance !== state.devComp) return false;
    if (state.devOwner !== 'all' && d.owner !== state.devOwner) return false;
    if (state.devFlag !== 'all' && !dv.flags[state.devFlag].has(d.id)) return false;
    if (q && ![d.name, d.user, d.userName, d.serial, d.model, d.osVersion, d.manufacturer, d.category].some((x) => String(x || '').toLowerCase().includes(q))) return false;
    return true;
  }).sort((a, b) => a.platform.localeCompare(b.platform) || a.name.localeCompare(b.name));
  const shown = list.slice(0, 1000);
  const sel = state.devSel ? all.find((d) => d.id === state.devSel) : null;
  const platCounts = dv.byPlatform;
  const vers = state.devPlatform !== 'Alle' ? (dv.versions[state.devPlatform] || []) : null;
  const countList = (pairs, max) => pairs.slice(0, max || 8).map(([k, n]) => '<div class="setting"><span class="l">' + esc(k) + '</span><span class="v">' + n + '</span></div>').join('') || '<p class="small muted">—</p>';
  const comps = [...new Set(all.map((d) => d.compliance))];
  return head('Geräte', 'Inventar aller in Intune verwalteten Geräte – ' + all.length + ' insgesamt.') + tabs +
    '<div class="kpis">' + platCounts.map(([p, n]) => '<button class="kpi" data-act="devPlatform" data-p="' + esc(p) + '"' + (state.devPlatform === p ? ' style="border-color:var(--accent)"' : '') + '><span class="lbl">' + esc(p) + '</span><span class="val">' + n + '</span><span class="sub">' + all.filter((d) => d.platform === p && (d.compliance === 'noncompliant' || d.compliance === 'error')).length + ' nicht konform · ' + all.filter((d) => d.platform === p && dv.flags.stale.has(d.id)).length + ' inaktiv</span></button>').join('') + '</div>' +
    '<div class="row"><section class="panel" style="flex:1 1 260px"><h2>' + (vers ? 'Versionen ' + esc(state.devPlatform) : 'Konformität') + '</h2>' + (vers ? countList(vers, 10) : countList(dv.byCompliance)) + '</section>' +
    '<section class="panel" style="flex:1 1 260px"><h2>Registrierungsart</h2>' + countList(state.devPlatform !== 'Alle' ? countPairs(all.filter((d) => d.platform === state.devPlatform), (d) => d.enrollType) : dv.byEnroll) + '</section>' +
    '<section class="panel" style="flex:1 1 260px"><h2>' + (state.devPlatform === 'Windows' ? 'Join-Typ' : 'Besitz') + '</h2>' + countList(state.devPlatform === 'Windows' ? dv.byJoin : countPairs(state.devPlatform !== 'Alle' ? all.filter((d) => d.platform === state.devPlatform) : all, (d) => d.owner)) + '</section></div>' +
    '<div class="filters"><button class="pill' + (state.devPlatform === 'Alle' ? ' on' : '') + '" data-act="devPlatform" data-p="Alle">Alle<span class="n">' + all.length + '</span></button>' + platCounts.map(([p, n]) => '<button class="pill' + (state.devPlatform === p ? ' on' : '') + '" data-act="devPlatform" data-p="' + esc(p) + '">' + esc(p) + '<span class="n">' + n + '</span></button>').join('') + '</div>' +
    '<div class="filters"><label class="sr" for="devFlag">Auffälligkeit</label><select class="input" id="devFlag" data-ch="devFlag">' + DEV_FLAGS.map(([k, l]) => '<option value="' + k + '"' + (state.devFlag === k ? ' selected' : '') + '>' + l + (k !== 'all' ? ' (' + dv.flags[k].size + ')' : '') + '</option>').join('') + '</select>' +
    '<label class="sr" for="devComp">Konformität</label><select class="input" id="devComp" data-ch="devComp"><option value="all">Alle Konformitätsstatus</option>' + comps.map((c) => '<option value="' + esc(c) + '"' + (state.devComp === c ? ' selected' : '') + '>' + esc(COMPLIANCE[c] || c) + '</option>').join('') + '</select>' +
    '<label class="sr" for="devOwner">Besitz</label><select class="input" id="devOwner" data-ch="devOwner"><option value="all">Firma & privat</option>' + ['Firma', 'Privat', 'Unbekannt'].map((o) => '<option' + (state.devOwner === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select>' +
    '<input class="input" style="max-width:280px;min-height:36px" id="devQ" data-in="devQ" placeholder="Gerät, Benutzer, Seriennummer" value="' + esc(state.devQ) + '" aria-label="Geräte durchsuchen">' +
    ((state.devPlatform !== 'Alle' || state.devComp !== 'all' || state.devOwner !== 'all' || state.devFlag !== 'all' || state.devQ) ? '<button class="btn ghost" data-act="devReset">Filter zurücksetzen</button>' : '') + '</div>' +
    '<div class="split"><section class="panel listcol" style="padding:6px 0"><div class="tablewrap" data-keep-scroll="devlist"><table class="t" style="min-width:640px"><thead><tr><th>Gerät</th><th>Plattform</th><th>Version</th><th>Benutzer</th><th>Konformität</th><th>Check-in</th></tr></thead><tbody>' +
    (shown.length ? shown.map((d) => '<tr class="click' + (sel && sel.id === d.id ? ' sel' : '') + '" data-act="devSelect" data-id="' + esc(d.id) + '"><td class="name wrap">' + esc(d.name) + (d.model ? '<div class="small faint" style="font-weight:400">' + esc(d.model) + '</div>' : '') + '</td><td class="muted">' + esc(d.platform) + '</td><td class="muted mono" style="font-size:12px">' + esc(d.osVersion) + '</td><td class="muted wrap">' + esc(d.userName || d.user || '—') + (d.owner === 'Privat' ? ' <span class="badge b-neutral">privat</span>' : '') + '</td><td>' + compBadge(d.compliance) + (d.jailbroken ? ' <span class="badge b-bad">Root</span>' : '') + '</td><td class="muted small">' + syncCell(d.lastSync) + '</td></tr>').join('') : '<tr><td colspan="6"><div class="emptybox">Kein Gerät passt zu den Filtern.</div></td></tr>') +
    '</tbody></table>' + (list.length > shown.length ? '<p class="small muted" style="padding:10px 12px">Es werden die ersten ' + shown.length + ' von ' + list.length + ' Geräten angezeigt.</p>' : '<p class="small muted" style="padding:10px 12px">' + list.length + ' Geräte</p>') + '</div></section>' +
    '<aside class="panel detailcol">' + (sel ? deviceDetail(sel) : '<div class="emptybox">Gerät auswählen für Details</div>') + '</aside></div>';
}
function countPairs(arr, fn) { const m = new Map(); for (const x of arr) { const k = fn(x) || '—'; m.set(k, (m.get(k) || 0) + 1); } return [...m.entries()].sort((a, b) => b[1] - a[1]); }

function deviceDetail(d) {
  const rows = [
    ['Plattform', d.os + (d.osVersion ? ' ' + d.osVersion : '')], ['Hersteller / Modell', [d.manufacturer, d.model].filter(Boolean).join(' ')], ['Seriennummer', d.serial],
    ['Benutzer', d.userName ? d.userName + (d.user ? ' (' + d.user + ')' : '') : d.user], ['Besitz', d.owner], ['Konformität', COMPLIANCE[d.compliance] || d.compliance],
    ['Registrierungsart', d.enrollType], ['Join-Typ', d.join], ['Verwaltung über', d.agent], ['Registrierungsprofil', d.profile], ['Kategorie', d.category],
    ['Verschlüsselt', d.encrypted ? 'Ja' : 'Nein'], ['Betreut (Supervised)', d.platform === 'iOS/iPadOS' ? (d.supervised ? 'Ja' : 'Nein') : ''], ['Jailbreak / Root', d.platform === 'iOS/iPadOS' || d.platform === 'Android' ? (d.jailbroken ? 'Ja' : 'Nein') : ''],
    ['Autopilot', d.platform === 'Windows' ? (d.autopilot ? 'Ja' : 'Nein') : ''], ['Sicherheitspatch', d.patch], ['Edition', d.sku], ['Speicher', d.storageTotal ? fmtBytes(d.storageFree) + ' frei von ' + fmtBytes(d.storageTotal) : ''],
    ['Registriert', d.enrolled ? fmtDT(d.enrolled) : ''], ['Letzter Check-in', d.lastSync ? fmtDT(d.lastSync) : ''], ['Status', d.state], ['Entra-Geräte-ID', d.entraId], ['Intune-Geräte-ID', d.id]
  ].filter(([, v]) => v);
  return '<div style="display:flex;flex-direction:column;gap:6px"><span class="small muted">' + esc(d.platform) + '</span><h2 style="font-size:18px">' + esc(d.name) + '</h2><div style="display:flex;gap:6px;flex-wrap:wrap">' + compBadge(d.compliance) + (state.an.devices.flags.stale.has(d.id) ? '<span class="badge b-warn">inaktiv</span>' : '') + '</div></div>' +
    '<dl class="kv">' + rows.map(([k, v]) => '<dt>' + esc(k) + '</dt><dd' + (/ID|Seriennummer/.test(k) ? ' class="mono" style="font-size:12px"' : '') + '>' + (k === 'Registriert' || k === 'Letzter Check-in' ? v : esc(v)) + '</dd>').join('') + '</dl>';
}

function viewAutopilot(ap, dv) {
  const q = state.devQ.trim().toLowerCase();
  const list = ap.filter((a) => !q || [a.serial, a.model, a.groupTag, a.user, a.displayName, a.order].some((x) => String(x || '').toLowerCase().includes(q)));
  const stBadge = (s) => '<span class="badge ' + (s === 'Registriert' ? 'b-ok' : s === 'Fehlgeschlagen' || s === 'Blockiert' ? 'b-bad' : 'b-neutral') + '">' + esc(s) + '</span>';
  return '<div class="row"><section class="panel" style="flex:1 1 260px"><h2>Group Tags</h2>' + dv.byGroupTag.slice(0, 10).map(([k, n]) => '<div class="setting"><span class="l">' + esc(k) + '</span><span class="v">' + n + '</span></div>').join('') + '</section>' +
    '<section class="panel" style="flex:1 1 260px"><h2>Status</h2>' + countPairs(ap, (a) => a.state).map(([k, n]) => '<div class="setting"><span class="l">' + esc(k) + '</span><span class="v">' + n + '</span></div>').join('') + '</section>' +
    '<section class="panel" style="flex:1 1 260px"><h2>Bereitstellungsprofil</h2>' + countPairs(ap, (a) => a.profile).map(([k, n]) => '<div class="setting"><span class="l">' + esc(k) + '</span><span class="v">' + n + '</span></div>').join('') + '</section></div>' +
    '<div class="filters"><input class="input" style="max-width:320px;min-height:36px" id="devQ" data-in="devQ" placeholder="Seriennummer, Modell, Group Tag" value="' + esc(state.devQ) + '" aria-label="Autopilot-Geräte durchsuchen"></div>' +
    '<section class="panel" style="padding:6px 0"><div class="tablewrap"><table class="t" style="min-width:760px"><thead><tr><th>Seriennummer</th><th>Hersteller / Modell</th><th>Group Tag</th><th>Status</th><th>Profil</th><th>Gerät</th><th>Letzter Kontakt</th></tr></thead><tbody>' +
    (list.length ? list.slice(0, 1500).map((a) => '<tr><td class="mono" style="font-size:12px">' + esc(a.serial) + '</td><td class="wrap">' + esc([a.manufacturer, a.model].filter(Boolean).join(' ')) + '</td><td class="muted">' + esc(a.groupTag || '—') + '</td><td>' + stBadge(a.state) + '</td><td class="muted">' + (a.profile === 'Kein Profil' ? '<span style="color:var(--amber)">Kein Profil</span>' : esc(a.profile)) + '</td><td class="muted">' + (a.managedDeviceId ? '<button class="btn ghost" style="padding:0;min-height:0" data-act="devJump" data-id="' + esc(a.managedDeviceId) + '">' + esc(a.displayName || 'öffnen') + '</button>' : '—') + '</td><td class="muted small">' + (a.lastContact ? syncCell(a.lastContact) : '—') + '</td></tr>').join('') : '<tr><td colspan="7"><div class="emptybox">Keine Autopilot-Geräte.</div></td></tr>') +
    '</tbody></table></div></section>';
}

// ---------------- Zuweisungen ----------------
function viewTargets() {
  const tq = state.targetQ.trim().toLowerCase();
  const targets = state.an.targets.filter((t) => !tq || t.label.toLowerCase().includes(tq));
  if (!state.targetKey || !state.an.targets.some((t) => t.key === state.targetKey)) state.targetKey = targets[0] ? targets[0].key : null;
  const t = state.an.targets.find((x) => x.key === state.targetKey);
  const icon = (k) => k.kind === 'allDevices' || k.kind === 'allUsers' ? '<span class="badge b-info">Alle</span>' : k.deleted ? '<span class="badge b-bad">gelöscht</span>' : k.dynamic ? '<span class="badge b-neutral">dyn.</span>' : '';
  let right = '<div class="emptybox">Keine Zuweisungen vorhanden.</div>';
  if (t) {
    const byArea = {};
    for (const i of t.items) (byArea[i.area] = byArea[i.area] || []).push(i);
    right = '<div style="display:flex;flex-direction:column;gap:4px"><span class="small muted">' + (t.kind === 'group' ? 'Entra-ID-Gruppe' + (t.dynamic ? ' (dynamisch)' : '') : 'Integriertes Ziel') + '</span><h2 style="font-size:18px">' + esc(t.label) + '</h2><span class="small muted">' + t.items.length + ' Zuweisungen · ' + t.items.filter((i) => i.mode === 'exclude').length + ' davon Ausschlüsse</span></div>' +
      Object.keys(byArea).sort((a, b) => AREAS.indexOf(a) - AREAS.indexOf(b)).map((area) => '<div style="display:flex;flex-direction:column;gap:4px"><span class="sectlabel">' + esc(area) + '</span><div class="tablewrap"><table class="t"><thead><tr><th>Objekt</th><th>Kategorie</th><th>Art</th><th>Absicht / Filter</th></tr></thead><tbody>' +
        byArea[area].map((i) => '<tr class="click" data-act="open" data-uid="' + esc(i.uid) + '"><td class="name wrap">' + esc(i.name) + '</td><td class="muted wrap">' + esc(i.category) + '</td><td>' + (i.mode === 'exclude' ? '<span class="badge b-bad">Ausgeschlossen</span>' : '<span class="badge b-ok">Eingeschlossen</span>') + '</td><td class="muted small wrap">' + esc([i.intent, i.filterName ? 'Filter ' + (i.filterMode === 'exclude' ? 'Ausschluss' : 'Einschluss') + ': ' + i.filterName : '', i.extra].filter(Boolean).join(' · ') || '—') + '</td></tr>').join('') +
        '</tbody></table></div></div>').join('');
  }
  return head('Zuweisungen nach Ziel', 'Welche Gruppe bekommt was – Konfiguration, Apps, Updates, Skripte und mehr.') +
    '<div class="split"><section class="panel" style="flex:1 1 280px;max-width:420px"><input class="input" id="targetQ" data-in="targetQ" placeholder="Gruppe suchen" value="' + esc(state.targetQ) + '" aria-label="Gruppe suchen"><div class="targetlist" data-keep-scroll="targets">' +
    targets.map((k) => '<button class="targetbtn' + (k.key === state.targetKey ? ' on' : '') + '" data-act="target" data-key="' + esc(k.key) + '">' + icon(k) + '<span style="min-width:0;overflow:hidden;text-overflow:ellipsis">' + esc(k.label) + '</span><span class="n">' + k.items.length + '</span></button>').join('') +
    '</div></section><section class="panel" style="flex:3 1 520px">' + right + '</section></div>';
}

// ---------------- Konflikte ----------------
function viewConflicts() {
  const all = state.an.conflicts;
  const list = all.filter((c) => c.kind === state.confKind);
  const sevB = { high: '<span class="badge b-bad">Hoch</span>', medium: '<span class="badge b-warn">Prüfen</span>', low: '<span class="badge b-info">Niedrig</span>' };
  return head('Konflikte & Dubletten', 'Gleiche Einstellung in mehreren zugewiesenen Objekten. „Hoch“ = die Zielgruppen überschneiden sich (gleiche Gruppe oder „Alle“).') +
    '<div class="filters"><button class="pill' + (state.confKind === 'conflict' ? ' on' : '') + '" data-act="confKind" data-kind="conflict">Widersprüchliche Werte<span class="n">' + all.filter((c) => c.kind === 'conflict').length + '</span></button><button class="pill' + (state.confKind === 'duplicate' ? ' on' : '') + '" data-act="confKind" data-kind="duplicate">Gleicher Wert mehrfach<span class="n">' + all.filter((c) => c.kind === 'duplicate').length + '</span></button></div>' +
    (list.length ? list.slice(0, 300).map((c) => '<section class="conf"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;align-items:center"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' + sevB[c.sev] + '<b style="font-size:15px">' + esc(c.label) + '</b></div><span class="small muted">' + c.entries.length + ' Objekte</span></div>' +
      '<div class="vals">' + c.entries.map((e) => '<button class="val" data-act="open" data-uid="' + esc(e.uid) + '"><span class="small muted">' + esc(e.name) + '</span><span class="v">' + esc(e.value) + '</span><span class="small faint">' + esc(e.assignmentLabels.join(', ') || '—') + '</span></button>').join('') + '</div>' +
      '<span class="small faint mono" style="word-break:break-all">' + esc(c.key) + '</span></section>').join('') : '<div class="panel"><div class="emptybox">Nichts gefunden.</div></div>') +
    (list.length > 300 ? '<p class="small muted">Es werden die ersten 300 angezeigt; der Export enthält alle.</p>' : '');
}

// ---------------- Snapshots ----------------
function viewSnapshots() {
  const demo = state.snap.demo;
  const list = demo ? [{ name: 'demo-vorher.json', tenant: 'Demo-Kunde GmbH', scannedAt: demoOlderSnapshot().scannedAt, count: demoOlderSnapshot().objects.length }] : state.snapshots;
  const diff = state.diff;
  return head('Snapshots & Vergleich', 'Jeder Scan wird automatisch lokal gespeichert. Zwei Stände vergleichen zeigt, was sich geändert hat.',
    '<label class="btn" for="importFile">Snapshot-Datei als Vergleich laden</label><input type="file" id="importFile" accept=".json,application/json" class="sr" data-ch="importFile">' +
    '<button class="btn" data-act="exportJson">Aktuellen Stand als JSON</button>') +
    '<div class="split"><section class="panel" style="flex:1 1 300px;max-width:440px"><h2>Gespeicherte Snapshots</h2>' +
    (list.length ? '<div class="targetlist" data-keep-scroll="snaps">' + list.map((s) => '<div class="assign" style="flex-direction:column;gap:6px"><div style="display:flex;justify-content:space-between;gap:8px"><b style="font-weight:500">' + fmtDT(s.scannedAt) + '</b><span class="small muted">' + (s.count || 0) + ' Objekte</span></div><span class="small muted">' + esc(s.tenant || '') + '</span><div style="display:flex;gap:6px;flex-wrap:wrap">' +
      '<button class="btn" style="min-height:32px" data-act="compare" data-name="' + esc(s.name) + '">' + (state.compareName === s.name ? '✓ Vergleichsbasis' : 'Vergleichen') + '</button>' +
      (!demo ? '<button class="btn" style="min-height:32px" data-act="openSnap" data-name="' + esc(s.name) + '">Ansehen</button><button class="btn ghost" style="min-height:32px" data-act="delSnap" data-name="' + esc(s.name) + '">Entfernen</button>' : '') + '</div></div>').join('') + '</div>'
      : '<p class="muted small">Noch keine gespeicherten Snapshots. Nach dem nächsten Scan liegt hier der erste.</p>') +
    '<p class="small faint">Ablage: ' + esc(state.info.dataDir || '') + '/snapshots</p></section>' +
    '<section class="panel" style="flex:3 1 520px">' + (diff ? '<h2>Änderungen seit ' + esc(state.compareLabel || '') + '</h2><div class="filters">' +
      ['Geändert', 'Zuweisung', 'Neu', 'Entfernt'].map((k) => '<span class="chip">' + k + ': ' + diff.filter((d) => d.kind === k).length + '</span>').join('') + '</div>' +
      (diff.length ? diff.map((d) => '<div class="setting" style="flex-direction:column;gap:4px"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' + ({ 'Neu': '<span class="badge b-ok">Neu</span>', 'Geändert': '<span class="badge b-info">Geändert</span>', 'Zuweisung': '<span class="badge b-warn">Zuweisung</span>', 'Entfernt': '<span class="badge b-bad">Entfernt</span>' }[d.kind]) +
        (d.kind !== 'Entfernt' ? '<button class="btn ghost" style="padding:0;min-height:0;font-weight:500" data-act="open" data-uid="' + esc(d.uid) + '">' + esc(d.name) + '</button>' : '<b style="font-weight:500">' + esc(d.name) + '</b>') + '<span class="small muted">' + esc(d.area) + ' · ' + esc(d.category) + '</span></div>' +
        (d.details.length ? '<ul class="small" style="margin:0;padding-left:18px;color:var(--text2)">' + d.details.slice(0, 40).map((x) => '<li class="mono" style="font-size:12px">' + esc(x) + '</li>').join('') + (d.details.length > 40 ? '<li>… ' + (d.details.length - 40) + ' weitere</li>' : '') + '</ul>' : '') + '</div>').join('') : '<div class="emptybox">Keine Unterschiede.</div>')
      : '<div class="emptybox">Links einen Snapshot als Vergleichsbasis wählen oder eine Snapshot-Datei laden.</div>') + '</section></div>';
}

// ---------------- Export ----------------
const FORMATS = [
  ['docx', 'Word', '.docx mit Titelseite & Inhaltsverzeichnis'], ['pdf', 'PDF', 'über den Druckdialog'], ['html', 'HTML-Bericht', 'eine Datei, im Browser lesbar'],
  ['md', 'Markdown', 'für Wiki, Git, IT-Glue'], ['csv-settings', 'Excel: Einstellungen', 'CSV, eine Zeile je Einstellung'], ['csv-assign', 'Excel: Zuweisungen', 'CSV, eine Zeile je Zuweisung'], ['csv-devices', 'Excel: Geräte', 'CSV, Inventar inkl. Autopilot'], ['json', 'JSON-Backup', 'vollständiger Rohdaten-Snapshot']
];
function viewExport() {
  const e = state.ex;
  const isCsv = e.format.startsWith('csv') || e.format === 'json';
  const counts = {};
  for (const o of state.snap.objects) counts[o.area] = (counts[o.area] || 0) + 1;
  const tocItems = X.SECTIONS.filter(([k]) => e.sections.has(k) && (k !== 'diff' || state.diff) && k !== 'code');
  return head('Dokumentation erzeugen', 'Ein Klick, fertige Kundendoku. Notizen aus der Objektansicht werden übernommen.') +
    '<div class="split"><section class="panel" style="flex:3 1 480px;gap:20px">' +
    '<div style="display:flex;flex-direction:column;gap:10px"><h2 style="font-size:14px">Format</h2><div class="formats">' +
    FORMATS.map(([k, l, s]) => '<button class="fmt' + (e.format === k ? ' on' : '') + '" data-act="fmt" data-fmt="' + k + '"><b>' + esc(l) + '</b><span class="s">' + esc(s) + '</span></button>').join('') + '</div></div>' +
    (!isCsv ? '<div style="display:flex;flex-direction:column;gap:10px"><h2 style="font-size:14px">Inhalt</h2><div class="checks">' +
      X.SECTIONS.map(([k, l]) => '<label class="check"><input type="checkbox" data-ch="sec" data-key="' + k + '"' + (e.sections.has(k) ? ' checked' : '') + (k === 'diff' && !state.diff ? ' disabled' : '') + '><span>' + esc(l) + (k === 'diff' && !state.diff ? ' <span class="faint">(erst Vergleich wählen)</span>' : '') + (k === 'devicelist' ? ' <span class="faint">(personenbezogen)</span>' : '') + '</span></label>').join('') + '</div></div>' : '') +
    (e.format !== 'json' ? '<div style="display:flex;flex-direction:column;gap:10px"><h2 style="font-size:14px">Bereiche</h2><div class="checks">' +
      AREAS.filter((a) => counts[a]).map((a) => '<label class="check"><input type="checkbox" data-ch="exArea" data-area="' + esc(a) + '"' + (e.areas.has(a) ? ' checked' : '') + '><span>' + esc(a) + ' <span class="faint mono">' + counts[a] + '</span></span></label>').join('') + '</div></div>' : '') +
    (!isCsv ? '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">' +
      '<label class="field" for="exCustomer">Kunde (Titel)<input class="input" id="exCustomer" data-in="exCustomer" placeholder="' + esc(state.snap.tenant.displayName || '') + '" value="' + esc(e.customer) + '"></label>' +
      '<label class="field" for="exPartner">Partner (Branding)<input class="input" id="exPartner" data-in="exPartner" placeholder="z. B. Muster IT-Partner GmbH" value="' + esc(e.partner) + '"></label>' +
      '<label class="field" for="exAuthor">Erstellt von<input class="input" id="exAuthor" data-in="exAuthor" placeholder="Name" value="' + esc(e.author) + '"></label></div>' : '') +
    '<button class="btn primary lg" data-act="doExport"' + (state.busy ? ' disabled' : '') + '>' + (state.busy ? 'Wird erzeugt …' : esc(FORMATS.find((f) => f[0] === e.format)[1]) + ' erzeugen') + '</button>' +
    (e.format === 'pdf' ? '<p class="small muted">Im Druckdialog als Ziel „Als PDF speichern“ bzw. „Microsoft Print to PDF“ wählen.</p>' : '') +
    (e.format === 'docx' ? '<p class="small muted">Word fragt beim Öffnen, ob Felder aktualisiert werden sollen – mit „Ja“ erscheint das Inhaltsverzeichnis.</p>' : '') +
    '</section><aside class="preview" style="flex:2 1 300px"><span class="k">Vorschau · Titelseite</span><h3>Intune-Dokumentation<br>' + esc(e.customer || state.snap.tenant.displayName || 'Mandant') + '</h3><span class="small" style="color:#4A5E5D">Stand ' + fmtDate(state.snap.scannedAt) + (e.partner ? ' · ' + esc(e.partner) : '') + (e.author ? ' · ' + esc(e.author) : '') + '</span><div class="bar"></div>' +
    (!isCsv ? '<div class="toc"><b>Inhalt</b>' + tocItems.map(([k, l]) => '<span>' + esc(l) + '</span>').join('') + '</div>' : '<p class="small" style="color:#4A5E5D">Tabellenexport mit Semikolon als Trennzeichen – lässt sich direkt in Excel öffnen.</p>') + '</aside></div>';
}

// ---------------- Protokoll & Einstellungen ----------------
function viewLog() {
  const s = state.snap;
  const counts = s.counts || {};
  return head('Scan-Protokoll', 'Was gelesen wurde und wo es Einschränkungen gab.') +
    '<section class="panel"><h2>Hinweise (' + s.warnings.length + ')</h2>' + (s.warnings.length ? '<div class="tablewrap"><table class="t"><thead><tr><th>Quelle</th><th>Hinweis</th></tr></thead><tbody>' + s.warnings.map((w) => '<tr><td class="name">' + esc(w.source) + '</td><td class="wrap">' + esc(w.message) + '</td></tr>').join('') + '</tbody></table></div>' : '<p class="muted">Alles vollständig gelesen.</p>') +
    '<p class="small muted">„Keine Berechtigung (403)“ bedeutet meist: Die Graph-Berechtigung fehlt in der App-Registrierung bzw. die Admin-Zustimmung ist veraltet, oder die angemeldete Person hat keine passende Intune-Rolle.</p></section>' +
    (Object.keys(counts).length ? '<section class="panel"><h2>Gelesene Quellen</h2><div class="tablewrap"><table class="t"><thead><tr><th>Quelle</th><th>Objekte</th></tr></thead><tbody>' + SOURCES.map((src) => '<tr><td>' + esc(src.label) + '</td><td class="mono">' + (counts[src.key] !== undefined ? counts[src.key] : '—') + '</td></tr>').join('') + '</tbody></table></div></section>' : '');
}

function viewSettings() {
  const ru = state.info.redirectUri || '';
  return head('Einstellungen', 'Verbindung und Darstellung.') +
    '<section class="panel" style="max-width:760px"><h2>App-Registrierung</h2>' +
    '<label class="field" for="cfgClient">Anwendungs-ID (Client-ID)<input class="input mono" id="cfgClient" value="' + esc(state.cfg.clientId || '') + '"></label>' +
    '<label class="field" for="cfgTenant">Standard-Tenant (optional)<input class="input mono" id="cfgTenant" value="' + esc(state.cfg.defaultTenant || '') + '"></label>' +
    '<label class="field" for="cfgBrand">Untertitel unter dem Logo (z. B. Firmen- oder Teamname)<input class="input" id="cfgBrand" placeholder="Intune-Dokumentation & Analyse" value="' + esc(state.cfg.brandLabel || '') + '"></label>' +
    '<div><button class="btn primary" data-act="saveSettings">Speichern</button></div>' +
    '<span class="sectlabel">Umleitungs-URI (SPA)</span><div class="copyrow"><code>' + esc(ru) + '</code><button class="btn" data-act="copy" data-text="' + esc(ru) + '">' + ICON.copy + 'Kopieren</button></div>' +
    '<span class="sectlabel">Benötigte Graph-Berechtigungen (delegiert)</span><div class="permlist">' + PERMS.map((p) => '<span class="chip mono">' + p + '</span>').join('') + '</div></section>' +
    '<section class="panel" style="max-width:760px"><h2>Darstellung & Daten</h2><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" data-act="theme">' + (document.documentElement.dataset.theme === 'light' ? 'Dunkles Design' : 'Helles Design') + '</button></div>' +
    '<dl class="kv"><dt>Version</dt><dd>' + esc(state.info.version || '') + '</dd><dt>Datenordner</dt><dd class="mono">' + esc(state.info.dataDir || '') + '</dd><dt>Angemeldet</dt><dd>' + esc(state.account ? state.account.username : '—') + '</dd></dl></section>';
}

// ---------------- Aktionen ----------------
function loadAnalysis(snap) {
  state.snap = snap;
  state.an = analyze(snap);
  state.selUid = null;
  state.ex.customer = '';
}

async function loadNotes() {
  if (state.snap.demo) { state.notes = state.notes || {}; return; }
  try { state.notes = await api('/api/notes/' + encodeURIComponent(noteKey())); } catch (e) { state.notes = {}; }
}
const noteKey = () => String(state.snap.tenant.id || state.snap.tenant.domain || 'tenant').replace(/[^A-Za-z0-9._-]/g, '_');
const saveNotes = debounce(async () => {
  if (state.snap.demo) return;
  try { await api('/api/notes/' + encodeURIComponent(noteKey()), { method: 'POST', body: JSON.stringify(state.notes) }); } catch (e) { toast('Notiz konnte nicht gespeichert werden: ' + e.message); }
}, 600);

async function refreshSnapshots() {
  if (state.snap && state.snap.demo) return;
  try {
    const all = await api('/api/snapshots');
    const tid = state.snap && state.snap.tenant.id;
    state.snapshots = all.filter((s) => !tid || !s.tenantId || s.tenantId === tid);
  } catch (e) { state.snapshots = []; }
}

function explainLoginError(e) {
  const m = String((e && (e.errorMessage || e.message)) || e);
  const code = (e && e.errorCode) || '';
  if (code === 'popup_window_error' || /popup/i.test(m) && /block/i.test(m)) return 'Das Anmeldefenster wurde blockiert. Bitte Pop-ups für <b>localhost</b> erlauben und erneut versuchen.';
  if (code === 'user_cancelled') return 'Anmeldung abgebrochen.';
  if (/AADSTS50011/.test(m)) return 'Die Umleitungs-URI passt nicht. In der App-Registrierung unter <b>Authentifizierung › Single-Page-Anwendung</b> genau <code>' + esc(state.info.redirectUri) + '</code> eintragen.';
  if (/AADSTS700016/.test(m)) return 'Die App-Registrierung wurde in diesem Tenant nicht gefunden. Ist sie als <b>mehrinstanzenfähig</b> konfiguriert und die Client-ID korrekt?';
  if (/AADSTS65001|AADSTS90094|consent/i.test(m)) {
    const t = (document.getElementById('loginTenant') || {}).value || 'organizations';
    const url = 'https://login.microsoftonline.com/' + encodeURIComponent(t.trim() || 'organizations') + '/adminconsent?client_id=' + encodeURIComponent(state.cfg.clientId || '');
    return 'Für diesen Tenant fehlt die Administratorzustimmung. Ein Administrator des Kunden (oder per GDAP mit der Rolle Cloudanwendungsadministrator) kann sie einmalig hier erteilen: <a href="' + esc(url) + '" target="_blank" rel="noopener">Admin-Zustimmung öffnen</a>';
  }
  if (/AADSTS90072|AADSTS50020/.test(m)) return 'Das Konto existiert im angegebenen Tenant nicht. Bei GDAP den Kundentenant angeben und mit dem Partnerkonto anmelden.';
  if (/AADSTS9002326|Cross-origin/i.test(m)) return 'Die Umleitungs-URI ist als „Web“ statt als <b>Single-Page-Anwendung</b> registriert. Bitte unter Authentifizierung als SPA anlegen.';
  return esc(m);
}

async function startScan() {
  state.screen = 'scanning';
  state.scan = { rows: {}, done: 0 };
  render();
  try {
    const snap = await scanTenant((p) => { state.scan.rows[p.key] = { label: p.label, state: p.state, info: p.info }; render(); });
    snap.scannedBy = state.account ? state.account.username : '';
    loadAnalysis(snap);
    state.viewingSaved = null;
    await loadNotes();
    try {
      const slug = String(snap.tenant.initialDomain || snap.tenant.domain || snap.tenant.id || 'tenant').replace(/\.onmicrosoft\.com$/, '').replace(/[^A-Za-z0-9-]/g, '-');
      const ts = snap.scannedAt.replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
      await api('/api/snapshots?name=' + encodeURIComponent(slug + '_' + ts + '.json'), { method: 'POST', body: JSON.stringify(snap) });
    } catch (e) { snap.warnings.push({ source: 'Snapshot', message: 'Konnte nicht lokal gespeichert werden: ' + e.message }); }
    await refreshSnapshots();
    state.screen = 'app';
    state.view = 'dashboard';
    render();
  } catch (e) {
    state.screen = 'login';
    state.error = 'Scan fehlgeschlagen: ' + esc(e.message || e);
    render();
  }
}

function startDemo() {
  loadAnalysis(demoSnapshot());
  state.notes = { [state.snap.objects[0].uid]: 'Abgestimmt mit Herrn Beispiel (IT-Leitung), Ticket #4711.' };
  state.viewingSaved = null;
  state.diff = null; state.compareName = '';
  state.screen = 'app'; state.view = 'dashboard';
  render();
}

async function setCompare(snapObj, label, name) {
  state.compareSnap = snapObj;
  state.compareName = name || '';
  state.compareLabel = label;
  state.diff = diffSnapshots(snapObj, state.snap);
  state.ex.sections.add('diff');
}

const ACTIONS = {
  async saveSetup() {
    const clientId = document.getElementById('cfgClient').value.trim();
    const defaultTenant = document.getElementById('cfgTenant').value.trim();
    if (!/^[0-9a-f-]{36}$/i.test(clientId)) { state.error = 'Bitte eine gültige Client-ID (GUID) eintragen.'; render(); return; }
    state.cfg = await api('/api/config', { method: 'POST', body: JSON.stringify({ clientId, defaultTenant, brandLabel: state.cfg.brandLabel || '' }) });
    state.error = '';
    state.screen = 'login';
    render();
  },
  async saveSettings() {
    const clientId = document.getElementById('cfgClient').value.trim();
    const defaultTenant = document.getElementById('cfgTenant').value.trim();
    if (clientId && !/^[0-9a-f-]{36}$/i.test(clientId)) { toast('Ungültige Client-ID'); return; }
    const brandLabel = document.getElementById('cfgBrand').value.trim();
    state.cfg = await api('/api/config', { method: 'POST', body: JSON.stringify({ clientId, defaultTenant, brandLabel }) });
    toast('Gespeichert'); render();
  },
  openSetup() { state.error = ''; state.screen = 'setup'; render(); },
  demo() { startDemo(); },
  async login() {
    if (!state.cfg.clientId) { state.screen = 'setup'; render(); return; }
    const tenant = document.getElementById('loginTenant').value.trim();
    lsSet('ii.lastTenant', tenant);
    state.error = ''; state.busy = true; render();
    try {
      await G.initAuth(state.cfg.clientId, tenant);
      state.account = await G.login();
      state.busy = false;
      await startScan();
    } catch (e) {
      state.busy = false;
      state.error = explainLoginError(e);
      render();
    }
  },
  async continue() {
    const tenant = document.getElementById('loginTenant').value.trim();
    lsSet('ii.lastTenant', tenant);
    try { await G.initAuth(state.cfg.clientId, tenant); state.account = G.currentAccount(); await startScan(); } catch (e) { state.error = explainLoginError(e); render(); }
  },
  async logout() {
    if (!confirm('Abmelden und zur Anmeldung zurückkehren?')) return;
    await G.logout();
    state.account = null; state.snap = null; state.an = null; state.diff = null; state.compareName = '';
    state.screen = 'login'; render();
  },
  async rescan() { await startScan(); },
  theme() { setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'); render(); },
  nav(el) { state.view = el.dataset.view; if (state.view === 'snapshots') refreshSnapshots().then(render); render(); document.getElementById('main') && window.scrollTo(0, 0); },
  area(el) { state.area = el.dataset.area; state.view = 'objects'; state.selUid = null; render(); },
  finding(el) {
    if (el.dataset.uid) { ACTIONS.open(el); return; }
    if (el.dataset.view === 'devices') { state.view = 'devices'; state.devTab = el.dataset.dfilter === 'autopilot' ? 'autopilot' : 'managed'; state.devFlag = el.dataset.dfilter && el.dataset.dfilter !== 'autopilot' ? el.dataset.dfilter : 'all'; state.devPlatform = 'Alle'; state.devComp = 'all'; state.devOwner = 'all'; state.devQ = ''; state.devSel = null; render(); window.scrollTo(0, 0); return; }
    state.view = el.dataset.view;
    if (el.dataset.filter) { state.statusF = el.dataset.filter; state.area = 'Alle'; state.platformF = 'Alle'; state.q = ''; }
    state.selUid = null; render(); window.scrollTo(0, 0);
  },
  resetFilters() { state.area = 'Alle'; state.statusF = 'all'; state.platformF = 'Alle'; state.q = ''; render(); },
  select(el) { state.selUid = el.dataset.uid; state.detailQ = ''; render(); },
  open(el) {
    const uid = el.dataset.uid;
    if (!state.snap.objects.some((o) => o.uid === uid)) { toast('Objekt ist im aktuellen Stand nicht vorhanden.'); return; }
    state.view = 'objects'; state.selUid = uid; state.area = 'Alle'; state.statusF = 'all'; state.platformF = 'Alle'; state.q = ''; state.detailQ = '';
    render(); window.scrollTo(0, 0);
  },
  target(el) { state.targetKey = el.dataset.key; render(); },
  devTab(el) { state.devTab = el.dataset.tab; state.devQ = ''; render(); },
  devPlatform(el) { state.devPlatform = el.dataset.p; state.devSel = null; render(); },
  devSelect(el) { state.devSel = el.dataset.id; render(); },
  devReset() { state.devPlatform = 'Alle'; state.devComp = 'all'; state.devOwner = 'all'; state.devFlag = 'all'; state.devQ = ''; render(); },
  devJump(el) { state.devTab = 'managed'; state.devPlatform = 'Alle'; state.devComp = 'all'; state.devOwner = 'all'; state.devFlag = 'all'; state.devQ = ''; state.devSel = el.dataset.id; render(); },
  confKind(el) { state.confKind = el.dataset.kind; render(); },
  fmt(el) { state.ex.format = el.dataset.fmt; render(); },
  copy(el) {
    const t = el.dataset.text;
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Kopiert'), () => toast('Kopieren nicht möglich – bitte manuell markieren.'));
  },
  async compare(el) {
    const name = el.dataset.name;
    if (state.snap.demo) { await setCompare(demoOlderSnapshot(), 'Demo-Snapshot vom ' + fmtDate(demoOlderSnapshot().scannedAt), name); render(); return; }
    try { const s = await api('/api/snapshots/' + encodeURIComponent(name)); await setCompare(s, 'Snapshot vom ' + fmtDT(s.scannedAt), name); render(); } catch (e) { toast('Snapshot nicht lesbar: ' + e.message); }
  },
  async openSnap(el) {
    try {
      const s = await api('/api/snapshots/' + encodeURIComponent(el.dataset.name));
      state.liveSnap = state.liveSnap || (state.viewingSaved ? state.liveSnap : state.snap);
      loadAnalysis(s); state.viewingSaved = fmtDT(s.scannedAt); state.diff = null; state.compareName = '';
      await loadNotes(); state.view = 'dashboard'; render();
    } catch (e) { toast('Snapshot nicht lesbar: ' + e.message); }
  },
  async backToLive() {
    if (state.liveSnap) { loadAnalysis(state.liveSnap); state.liveSnap = null; }
    state.viewingSaved = null; state.diff = null; state.compareName = '';
    await loadNotes(); render();
  },
  async delSnap(el) {
    if (!confirm('Snapshot in den Unterordner „_entfernt“ verschieben?')) return;
    try { await api('/api/snapshots/' + encodeURIComponent(el.dataset.name), { method: 'DELETE' }); if (state.compareName === el.dataset.name) { state.diff = null; state.compareName = ''; } await refreshSnapshots(); render(); } catch (e) { toast(e.message); }
  },
  exportJson() {
    const m = X.buildModel(state.snap, state.an, { sections: new Set(), customer: state.ex.customer });
    X.download(X.fileStem(m) + '.json', JSON.stringify(state.snap, null, 2), 'application/json');
  },
  async doExport() {
    const e = state.ex;
    lsSet('ii.partner', e.partner); lsSet('ii.author', e.author);
    const sections = new Set(e.sections);
    if (!state.diff) sections.delete('diff');
    const m = X.buildModel(state.snap, state.an, { sections, areas: e.areas, partner: e.partner, author: e.author, customer: e.customer, notes: state.notes, diff: state.diff, diffBase: state.compareLabel || '' });
    const stem = X.fileStem(m);
    try {
      state.busy = true; render();
      if (e.format === 'docx') {
        if (typeof docx === 'undefined') throw new Error('Word-Bibliothek nicht geladen.');
        X.download(stem + '.docx', await X.toDocx(m));
      } else if (e.format === 'pdf') X.printHtml(X.toHtml(m));
      else if (e.format === 'html') X.download(stem + '.html', X.toHtml(m), 'text/html;charset=utf-8');
      else if (e.format === 'md') X.download(stem + '.md', X.toMarkdown(m), 'text/markdown;charset=utf-8');
      else if (e.format === 'csv-settings') X.download(stem + '_Einstellungen.csv', X.toCsvSettings(m), 'text/csv;charset=utf-8');
      else if (e.format === 'csv-assign') X.download(stem + '_Zuweisungen.csv', X.toCsvAssignments(m), 'text/csv;charset=utf-8');
      else if (e.format === 'csv-devices') { X.download(stem + '_Geraete.csv', X.toCsvDevices(m), 'text/csv;charset=utf-8'); if (m.autopilot.length) setTimeout(() => X.download(stem + '_Autopilot.csv', X.toCsvAutopilot(m), 'text/csv;charset=utf-8'), 400); }
      else if (e.format === 'json') X.download(stem + '.json', JSON.stringify(state.snap, null, 2), 'application/json');
      state.busy = false; toast(e.format === 'pdf' ? 'Druckdialog geöffnet' : 'Datei erzeugt');
    } catch (err) {
      state.busy = false; toast('Export fehlgeschlagen: ' + err.message);
    }
  }
};

const INPUTS = {
  q(el) { state.q = el.value; if (state.view !== 'objects') { state.view = 'objects'; state.selUid = null; render(); } else renderSoon(); },
  detailQ(el) { state.detailQ = el.value; renderSoon(); },
  targetQ(el) { state.targetQ = el.value; renderSoon(); },
  devQ(el) { state.devQ = el.value; renderSoon(); },
  note(el) { const uid = el.dataset.uid; if (el.value) state.notes[uid] = el.value; else delete state.notes[uid]; saveNotes(); },
  exCustomer(el) { state.ex.customer = el.value; renderSoon(); },
  exPartner(el) { state.ex.partner = el.value; renderSoon(); },
  exAuthor(el) { state.ex.author = el.value; renderSoon(); }
};

const CHANGES = {
  statusF(el) { state.statusF = el.value; state.selUid = null; render(); },
  platformF(el) { state.platformF = el.value; state.selUid = null; render(); },
  devFlag(el) { state.devFlag = el.value; state.devSel = null; render(); },
  devComp(el) { state.devComp = el.value; state.devSel = null; render(); },
  devOwner(el) { state.devOwner = el.value; state.devSel = null; render(); },
  sec(el) { if (el.checked) state.ex.sections.add(el.dataset.key); else state.ex.sections.delete(el.dataset.key); render(); },
  exArea(el) { if (el.checked) state.ex.areas.add(el.dataset.area); else state.ex.areas.delete(el.dataset.area); render(); },
  importFile(el) {
    const f = el.files && el.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = async () => {
      try {
        const s = JSON.parse(r.result);
        if (!s || !Array.isArray(s.objects)) throw new Error('Keine Intune-Inspector-Snapshot-Datei.');
        await setCompare(s, 'Datei ' + f.name + ' (' + fmtDT(s.scannedAt) + ')', 'file:' + f.name);
        render();
      } catch (e) { toast('Datei nicht lesbar: ' + e.message); }
    };
    r.readAsText(f);
  }
};

root.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || !root.contains(el)) return;
  const fn = ACTIONS[el.dataset.act];
  if (fn) { e.preventDefault(); Promise.resolve(fn(el, e)).catch((err) => toast(err.message || String(err))); }
});
root.addEventListener('input', (e) => { const el = e.target.closest('[data-in]'); if (el && INPUTS[el.dataset.in]) INPUTS[el.dataset.in](el, e); });
root.addEventListener('change', (e) => { const el = e.target.closest('[data-ch]'); if (el && CHANGES[el.dataset.ch]) CHANGES[el.dataset.ch](el, e); });
root.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.target.id === 'loginTenant')) { e.preventDefault(); ACTIONS.login(); }
  if (e.key === 'Enter' && (e.target.id === 'cfgClient' || e.target.id === 'cfgTenant') && state.screen === 'setup') { e.preventDefault(); ACTIONS.saveSetup(); }
});
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && state.screen === 'app') { e.preventDefault(); const q = document.getElementById('q'); if (q) { q.focus(); q.select(); } }
  if (e.key === 'Escape' && document.activeElement && document.activeElement.id === 'q' && state.q) { state.q = ''; render(); }
});

// ---------------- Start ----------------
(async function boot() {
  try { state.info = await api('/api/info'); } catch (e) { state.info = { redirectUri: location.origin + '/redirect.html' }; }
  try { state.cfg = await api('/api/config'); } catch (e) { state.cfg = {}; }
  if (new URLSearchParams(location.search).has('demo')) { startDemo(); return; }
  if (!state.cfg.clientId) { state.screen = 'setup'; render(); return; }
  try { state.account = await G.initAuth(state.cfg.clientId, lsGet('ii.lastTenant', state.cfg.defaultTenant || '')); } catch (e) { state.account = null; }
  state.screen = 'login';
  render();
})();

// Intune Inspector – Oberfläche (Deutsch / Englisch)
import * as G from './graph.js';
import { scanTenant, SOURCES } from './scanner.js';
import { analyze, diffSnapshots, status } from './analyze.js';
import { AREAS } from './normalize.js';
import { demoSnapshot, demoOlderSnapshot } from './demo.js';
import * as X from './export.js';
import { COMPLIANCE, fmtBytes } from './devices.js';
import { T, tv, objName, setLang, getLang, detectLang, withLang, fmtDate as fD, fmtDateTime as fDT } from './i18n.js';

const root = document.getElementById('root');

// ---------------- Hilfen ----------------
const esc = (s) => String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const fmtDate = (iso) => esc(fD(iso));
const fmtDT = (iso) => esc(fDT(iso));
const ev = (s) => esc(tv(s)); // Datenbezeichnung übersetzen und kodieren
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* egal */ } };
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const ALL = 'Alle'; // interner Wert für „kein Filter“

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
  copy: I('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>', 16)
};
const msLogo = '<svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true"><rect x="1" y="1" width="9" height="9" fill="#F25022"/><rect x="11" y="1" width="9" height="9" fill="#7FBA00"/><rect x="1" y="11" width="9" height="9" fill="#00A4EF"/><rect x="11" y="11" width="9" height="9" fill="#FFB900"/></svg>';

// ---------------- Zustand ----------------
setLang(detectLang());
const state = {
  screen: 'boot', view: 'dashboard', info: {}, cfg: {}, account: null, error: '', busy: false,
  snap: null, an: null, notes: {}, viewingSaved: null,
  scan: { rows: {}, done: 0 },
  q: '', area: ALL, statusF: 'all', platformF: ALL, selUid: null, detailQ: '',
  targetKey: null, targetQ: '', confKind: 'conflict',
  devTab: 'managed', devPlatform: ALL, devComp: 'all', devOwner: 'all', devFlag: 'all', devQ: '', devSel: null,
  snapshots: [], compareName: '', compareSnap: null, compareMeta: null, diff: null,
  ex: { format: 'docx', lang: '', sections: new Set(X.SECTIONS.map((s) => s.key).filter((k) => k !== 'diff' && k !== 'devicelist')), areas: new Set(AREAS), partner: lsGet('ii.partner', ''), author: lsGet('ii.author', ''), customer: '' },
  toast: ''
};

function setTheme(t) { document.documentElement.dataset.theme = t; lsSet('ii.theme', t); }
setTheme(lsGet('ii.theme', 'dark'));

function switchLang(l) {
  setLang(l);
  lsSet('ii.lang', getLang());
  if (state.snap) state.an = analyze(state.snap);
  if (state.compareSnap) state.diff = diffSnapshots(state.compareSnap, state.snap);
  render();
}
const langBtn = (cls) => '<button class="' + (cls || 'btn ghost') + '" data-act="lang" title="' + T('Sprache: Deutsch → English', 'Language: English → Deutsch') + '" aria-label="' + T('Sprache wechseln', 'Change language') + '">' + T('EN', 'DE') + '</button>';
const themeLabel = () => document.documentElement.dataset.theme === 'light' ? T('Dunkles Design', 'Dark theme') : T('Helles Design', 'Light theme');

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
  return '<div class="brandrow"><div class="logo">' + ICON.shield + '</div><div><div class="name">Intune Inspector</div><div class="small muted">' + esc(state.cfg.brandLabel || T('Intune-Dokumentation & Analyse', 'Intune documentation & analysis')) + '</div></div></div>';
}

function screenSetup() {
  const ru = state.info.redirectUri || (location.origin + '/redirect.html');
  return '<div class="center"><div class="wrap wide">' + brand() +
    '<div class="card"><h1>' + T('Einmalige Einrichtung', 'One-time setup') + '</h1>' +
    '<p class="muted">' + T('Intune Inspector meldet sich über eine eigene App-Registrierung in Entra ID an. Diese wird einmal angelegt und kann für alle Kundentenants genutzt werden.', 'Intune Inspector signs in through its own app registration in Entra ID. You create it once and can use it for all customer tenants.') + '</p>' +
    '<ol class="steps">' +
    '<li>' + T('Im Entra Admin Center unter <b>App-Registrierungen › Neue Registrierung</b> eine App „Intune Inspector“ anlegen. Unterstützte Kontotypen: <b>Konten in einem beliebigen Organisationsverzeichnis (mehrinstanzenfähig)</b>.', 'In the Entra admin center, go to <b>App registrations › New registration</b> and create an app “Intune Inspector”. Supported account types: <b>Accounts in any organizational directory (multitenant)</b>.') + '</li>' +
    '<li>' + T('Plattform <b>Single-Page-Anwendung (SPA)</b> hinzufügen mit dieser Umleitungs-URI:', 'Add the platform <b>Single-page application (SPA)</b> with this redirect URI:') + '<div class="copyrow" style="margin-top:8px"><code>' + esc(ru) + '</code><button class="btn" data-act="copy" data-text="' + esc(ru) + '">' + ICON.copy + T('Kopieren', 'Copy') + '</button></div></li>' +
    '<li>' + T('Unter <b>API-Berechtigungen › Microsoft Graph › Delegiert</b> diese Rechte hinzufügen:', 'Under <b>API permissions › Microsoft Graph › Delegated</b>, add these permissions:') + '<div class="permlist" style="margin-top:8px">' + PERMS.map((p) => '<span class="chip mono">' + p + '</span>').join('') + '</div></li>' +
    '<li>' + T('Im jeweiligen Kundentenant einmal die <b>Administratorzustimmung</b> erteilen (passiert beim ersten Login eines Admins automatisch über den Zustimmungsdialog).', 'Grant <b>admin consent</b> once in each customer tenant (happens automatically in the consent dialog when an admin signs in for the first time).') + '</li>' +
    '<li>' + T('Die <b>Anwendungs-ID (Client-ID)</b> hier eintragen.', 'Enter the <b>Application (client) ID</b> here.') + '</li></ol>' +
    '<label class="field" for="cfgClient">' + T('Anwendungs-ID (Client-ID)', 'Application (client) ID') + '<input class="input mono" id="cfgClient" placeholder="00000000-0000-0000-0000-000000000000" value="' + esc(state.cfg.clientId || '') + '"></label>' +
    '<label class="field" for="cfgTenant">' + T('Standard-Tenant (optional, z. B. für den eigenen Tenant)', 'Default tenant (optional, e.g. your own tenant)') + '<input class="input mono" id="cfgTenant" placeholder="contoso.onmicrosoft.com" value="' + esc(state.cfg.defaultTenant || '') + '"></label>' +
    (state.error ? '<div class="err">' + esc(state.error) + '</div>' : '') +
    '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn primary lg" data-act="saveSetup">' + T('Speichern und weiter', 'Save and continue') + '</button><button class="btn lg" data-act="demo">' + T('Erst einmal die Demo ansehen', 'Try the demo first') + '</button></div>' +
    '</div><div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;align-items:center"><span class="small faint">' + T('Version ', 'Version ') + esc(state.info.version || '') + ' · ' + T('Daten bleiben lokal: ', 'Data stays local: ') + esc(state.info.dataDir || '') + '</span>' + langBtn() + '</div></div></div>';
}

function screenLogin() {
  const acc = state.account;
  return '<div class="center"><div class="wrap">' + brand() +
    '<div class="card"><div style="display:flex;flex-direction:column;gap:6px"><h1>' + T('Am Kundentenant anmelden', 'Sign in to the customer tenant') + '</h1><p class="muted">' + T('Liest alle Intune-Konfigurationen – ausschließlich lesend, es werden keine Änderungen vorgenommen.', 'Reads all Intune configuration – strictly read-only, nothing is changed.') + '</p></div>' +
    '<label class="field" for="loginTenant">' + T('Kundentenant (Domain oder Tenant-ID)', 'Customer tenant (domain or tenant ID)') + '<input class="input mono" id="loginTenant" placeholder="contoso.onmicrosoft.com" value="' + esc(lsGet('ii.lastTenant', state.cfg.defaultTenant || '')) + '"></label>' +
    '<p class="small faint" style="margin-top:-8px">' + T('Für Partner-Zugriff (GDAP) unbedingt den Kundentenant angeben, sonst landet die Anmeldung im eigenen Tenant.', 'For partner access (GDAP), always enter the customer tenant – otherwise you are signed in to your own tenant.') + '</p>' +
    (acc ? '<button class="btn primary lg" data-act="continue">' + T('Als ' + esc(acc.username) + ' fortfahren', 'Continue as ' + esc(acc.username)) + '</button>' : '') +
    '<button class="btn ms lg" data-act="login" ' + (state.busy ? 'disabled' : '') + '>' + msLogo + (acc ? T('Mit anderem Konto anmelden', 'Sign in with another account') : T('Mit Microsoft anmelden', 'Sign in with Microsoft')) + '</button>' +
    (state.error ? '<div class="err">' + state.error + '</div>' : '') +
    '<div style="display:flex;flex-wrap:wrap;gap:8px"><span class="chip">' + T('Nur Leserechte', 'Read-only permissions') + '</span><span class="chip">' + T('GDAP-fähig', 'GDAP ready') + '</span><span class="chip">' + T('Daten bleiben lokal', 'Data stays local') + '</span></div>' +
    '</div><div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap"><button class="btn ghost" data-act="demo">' + T('Demo mit Beispieldaten', 'Demo with sample data') + '</button><button class="btn ghost" data-act="openSetup">' + T('Einrichtung / Client-ID', 'Setup / client ID') + '</button><button class="btn ghost" data-act="theme">' + themeLabel() + '</button>' + langBtn() + '</div></div></div>';
}

function screenScanning() {
  const rows = SOURCES.map((s) => state.scan.rows[s.key] || { label: s.label, state: 'pending' }).concat(state.scan.rows.resolve ? [state.scan.rows.resolve] : []);
  const done = rows.filter((r) => r.state === 'done' || r.state === 'error').length;
  const pct = Math.round(done / (SOURCES.length + 1) * 100);
  const st = (s) => s === 'running' ? '<span class="spinner"></span>' : s === 'done' ? '<span style="color:var(--lime)">' + ICON.check + '</span>' : s === 'error' ? '<span style="color:var(--red-text)">' + ICON.x + '</span>' : '<span class="faint">·</span>';
  return '<div class="center"><div class="wrap wide">' + brand() + '<div class="card"><h1>' + T('Mandant wird gelesen …', 'Reading tenant …') + '</h1><p class="muted">' + T('Alle Bereiche werden nacheinander abgefragt. Bei großen Mandanten kann das ein paar Minuten dauern.', 'All areas are queried one after another. Large tenants can take a few minutes.') + '</p>' +
    '<div class="progress" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><div style="width:' + pct + '%"></div></div>' +
    '<div class="scanlist" data-keep-scroll="scan">' + rows.map((r) => '<div class="scanrow"><span class="st">' + st(r.state) + '</span><span>' + ev(r.label) + '</span><span class="info">' + ev(r.info || '') + '</span></div>').join('') + '</div></div></div></div>';
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
    '<div class="tenantpill"><span class="dot"></span><b class="small">' + esc(s.tenant.displayName || T('Mandant', 'Tenant')) + '</b><span class="dom">' + esc(s.tenant.domain || '') + '</span></div>' +
    '<div class="search"><label for="q">' + ICON.search + '<span class="sr">' + T('Suche', 'Search') + '</span><input id="q" data-in="q" placeholder="' + T('Objekte und Einstellungen durchsuchen, z. B. „BitLocker“', 'Search objects and settings, e.g. “BitLocker”') + '" value="' + esc(state.q) + '" autocomplete="off"><span class="kbd">' + T('Strg K', 'Ctrl K') + '</span></label></div>' +
    '<div class="right">' + (s.demo ? '<span class="badge b-warn">Demo</span>' : '<span class="badge b-ok">' + T('Nur lesen', 'Read-only') + '</span>') +
    langBtn('iconbtn') +
    '<button class="iconbtn" data-act="theme" aria-label="' + T('Design wechseln', 'Toggle theme') + '" title="' + T('Design wechseln', 'Toggle theme') + '">' + (document.documentElement.dataset.theme === 'light' ? ICON.moon : ICON.sun) + '</button>' +
    '<button class="avatar" data-act="logout" title="' + T('Abmelden', 'Sign out') + (state.account ? ' (' + esc(state.account.username) + ')' : '') + '" aria-label="' + T('Abmelden', 'Sign out') + '">' + esc(initials) + '</button></div></header>' +
    '<div class="body"><nav class="sidebar" aria-label="' + T('Hauptnavigation', 'Main navigation') + '">' +
    '<span class="sect">' + T('Analyse', 'Analysis') + '</span>' +
    nav('dashboard', ICON.dash, T('Übersicht', 'Overview')) +
    nav('devices', ICON.phone, T('Geräte', 'Devices'), (s.devices || []).length) +
    nav('objects', ICON.list, T('Objekte', 'Objects'), an.total) +
    nav('targets', ICON.users, T('Zuweisungen', 'Assignments'), an.targets.length) +
    nav('conflicts', ICON.alert, T('Konflikte', 'Conflicts'), realConf || null, realConf > 0) +
    '<span class="sect">' + T('Dokumentation', 'Documentation') + '</span>' +
    nav('snapshots', ICON.clock, T('Snapshots & Vergleich', 'Snapshots & compare')) +
    nav('export', ICON.file, T('Doku-Export', 'Export')) +
    nav('log', ICON.log, T('Scan-Protokoll', 'Scan log'), s.warnings.length || null) +
    nav('settings', ICON.gear, T('Einstellungen', 'Settings')) +
    '<div class="lastscan"><span class="muted">' + (state.viewingSaved ? T('Gespeicherter Snapshot', 'Saved snapshot') : T('Letzter Scan', 'Last scan')) + '</span><b>' + fmtDT(s.scannedAt) + '</b><span class="muted">' + an.total + T(' Objekte · ', ' objects · ') + an.settingsCount + T(' Einstellungen', ' settings') + '</span>' +
    (!s.demo ? '<button class="btn" style="margin-top:8px;min-height:34px" data-act="rescan">' + ICON.refresh + T('Neu scannen', 'Rescan') + '</button>' : '') + '</div>' +
    '</nav><main class="main" id="main"><div class="page">' +
    (state.viewingSaved ? '<div class="banner">' + T('Ansicht eines gespeicherten Snapshots (', 'Viewing a saved snapshot (') + esc(state.viewingSaved) + '). <button class="btn ghost" data-act="backToLive">' + T('Zurück zum aktuellen Scan', 'Back to the current scan') + '</button></div>' : '') +
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
  return head(T('Übersicht', 'Overview'), T('Bestandsaufnahme der Intune-Konfiguration von ', 'Inventory of the Intune configuration of ') + esc(state.snap.tenant.displayName || state.snap.tenant.domain), '<button class="btn primary" data-act="nav" data-view="export">' + T('Dokumentation erzeugen', 'Create documentation') + '</button>') +
    '<div class="kpis">' +
    kpi(T('Objekte gesamt', 'Total objects'), an.total, an.byArea.length + T(' Bereiche · ', ' areas · ') + an.settingsCount + T(' Einstellungen', ' settings'), 'objects', null) +
    kpi(T('Nicht zugewiesen', 'Unassigned'), an.unassigned.length, T('Kandidaten zum Aufräumen', 'Clean-up candidates'), 'objects', 'unassigned', 'var(--amber)') +
    kpi(T('Einstellungskonflikte', 'Setting conflicts'), realConf.length, realConf.filter((c) => c.sev === 'high').length + T(' mit überlappender Zuweisung', ' with overlapping assignment'), 'conflicts', null, 'var(--red-text)') +
    kpi(T('Gelöschte Gruppen', 'Deleted groups'), an.deletedGroupRefs.length, T('Objekte mit verwaisten Zuweisungen', 'Objects with orphaned assignments'), 'objects', 'deletedgroup', an.deletedGroupRefs.length ? 'var(--red-text)' : null) +
    kpi(T('Verwaltete Geräte', 'Managed devices'), an.devices.total, an.devices.byPlatform.map(([p, n]) => n + ' ' + tv(p)).join(' · ') || T('keine', 'none'), 'devices', null) +
    kpi(T('Mit Beschreibung', 'With description'), pctDesc + ' %', T('Dokumentationsgrad in Intune', 'Documentation level in Intune'), 'objects', null, 'var(--lime)') +
    '</div>' + connectorPanel() + '<div class="row">' +
    '<section class="panel" style="flex:3 1 420px"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><h2>' + T('Objekte nach Bereich', 'Objects by area') + '</h2></div><div class="bars">' +
    an.byArea.map((b) => '<button class="bar" style="background:none;border:none;color:inherit;text-align:left;padding:0" data-act="area" data-area="' + esc(b.area) + '"><div class="top"><span>' + ev(b.area) + '</span><span class="mono muted">' + b.total + '</span></div><div class="track"><div class="a" style="width:' + (b.assigned / max * 100) + '%"></div><div class="u" style="width:' + (b.unassigned / max * 100) + '%"></div><div class="i" style="width:' + (b.info / max * 100) + '%"></div></div></button>').join('') +
    '</div><div class="legend"><span><i style="background:var(--accent)"></i>' + T('zugewiesen', 'assigned') + '</span><span><i style="background:var(--amber)"></i>' + T('nicht zugewiesen', 'unassigned') + '</span><span><i style="background:var(--blue);opacity:.7"></i>' + T('mandantenweit', 'tenant-wide') + '</span></div></section>' +
    '<section class="panel" style="flex:2 1 340px"><h2>' + T('Wichtigste Befunde', 'Key findings') + '</h2>' +
    (an.findings.length ? an.findings.map((f) => '<button class="finding" data-act="finding" data-view="' + f.view + '" data-filter="' + (f.filter || '') + '" data-uid="' + esc(f.uid || '') + '" data-dfilter="' + (f.dfilter || '') + '"><span class="d d-' + f.sev + '"></span><span style="display:flex;flex-direction:column;gap:2px"><b style="font-weight:500">' + esc(f.title) + '</b><span class="small muted">' + esc(f.text) + '</span></span></button>').join('') : '<p class="muted">' + T('Keine Auffälligkeiten.', 'Nothing to report.') + '</p>') +
    '</section></div>' +
    '<section class="panel"><div style="display:flex;justify-content:space-between;align-items:baseline"><h2>' + T('Zuletzt geändert', 'Recently changed') + '</h2><button class="btn ghost" data-act="nav" data-view="objects">' + T('Alle Objekte', 'All objects') + '</button></div><div class="tablewrap"><table class="t"><thead><tr><th>' + T('Name', 'Name') + '</th><th>' + T('Bereich', 'Area') + '</th><th>' + T('Kategorie', 'Category') + '</th><th>' + T('Geändert', 'Modified') + '</th></tr></thead><tbody>' +
    recent.map((o) => '<tr class="click" data-act="open" data-uid="' + esc(o.uid) + '"><td class="name">' + esc(objName(o)) + '</td><td class="muted">' + ev(o.area) + '</td><td class="muted">' + ev(o.category) + '</td><td class="muted">' + fmtDate(o.modified) + '</td></tr>').join('') +
    '</tbody></table></div></section>';
}
function daysBadge(r) {
  if (r.days === null || r.days === undefined) return r.sev === 'info' ? '<span class="badge b-neutral">' + T('nicht verbunden', 'not bound') + '</span>' : r.sev === 'medium' || r.sev === 'high' ? '<span class="badge b-warn">' + T('prüfen', 'check') + '</span>' : '<span class="badge b-ok">OK</span>';
  const cls = r.sev === 'high' ? 'b-bad' : r.sev === 'medium' ? 'b-warn' : 'b-ok';
  return '<span class="badge ' + cls + '">' + (r.days < 0 ? T('abgelaufen', 'expired') : T('noch ' + r.days + ' Tage', r.days + ' days left')) + '</span>';
}
function connectorPanel() {
  const rows = state.an.connectors;
  if (!rows.length) return '';
  return '<section class="panel"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap"><h2>' + T('Plattform-Anbindungen & Ablaufdaten', 'Platform connectors & expiry dates') + '</h2><span class="small muted">' + T('Zertifikate und Token, deren Ablauf die Geräteverwaltung stoppt', 'Certificates and tokens whose expiry stops device management') + '</span></div><div class="tablewrap"><table class="t"><thead><tr><th>' + T('Anbindung', 'Connector') + '</th><th>Name</th><th>' + T('Plattform', 'Platform') + '</th><th>' + T('Gültig bis', 'Valid until') + '</th><th>Status</th></tr></thead><tbody>' +
    rows.map((r) => '<tr class="click" data-act="open" data-uid="' + esc(r.uid) + '"><td class="wrap">' + ev(r.category) + '</td><td class="name wrap">' + ev(r.name) + '</td><td class="muted">' + esc(r.platform || '—') + '</td><td class="muted">' + (r.expiry ? fmtDate(r.expiry) : '—') + '</td><td>' + daysBadge(r) + '</td></tr>').join('') +
    '</tbody></table></div></section>';
}
function kpi(lbl, val, sub, view, filter, color) {
  return '<button class="kpi" data-act="finding" data-view="' + view + '" data-filter="' + (filter || '') + '"><span class="lbl">' + esc(lbl) + '</span><span class="val"' + (color ? ' style="color:' + color + '"' : '') + '>' + esc(val) + '</span><span class="sub">' + esc(sub) + '</span></button>';
}

// ---------------- Objekte ----------------
const STATUS_F = () => [
  ['all', T('Alle Status', 'All statuses')], ['assigned', T('Zugewiesen', 'Assigned')], ['unassigned', T('Nicht zugewiesen', 'Unassigned')], ['info', T('Mandantenweit', 'Tenant-wide')],
  ['conflict', T('Mit Konflikt', 'With conflict')], ['deletedgroup', T('Gelöschte Gruppe', 'Deleted group')], ['inexclude', T('Ein- & Ausschluss gleiche Gruppe', 'Same group included & excluded')],
  ['dupname', T('Doppelter Name', 'Duplicate name')], ['stale', T('Über 12 Monate unverändert', 'Unchanged for over 12 months')]
];

function matchQuery(o, q) {
  if (!q) return { ok: true };
  const has = (x) => String(x || '').toLowerCase().includes(q) || String(tv(x) || '').toLowerCase().includes(q);
  if (has(o.name) || has(o.category) || has(o.description) || has(o.area)) return { ok: true };
  const s = o.settings.find((x) => has(x.label) || has(x.value) || has(x.path));
  if (s) return { ok: true, hit: tv(s.label) + ' = ' + tv(s.value) };
  const a = o.assignments.find((x) => has(x.label) || has(x.filterName));
  if (a) return { ok: true, hit: T('Zuweisung: ', 'Assignment: ') + X.assignmentText(a) };
  if ((o.code || []).some((c) => c.content.toLowerCase().includes(q))) return { ok: true, hit: T('Treffer im Skriptinhalt', 'Match in script content') };
  if ((state.notes[o.uid] || '').toLowerCase().includes(q)) return { ok: true, hit: T('Treffer in Notiz', 'Match in note') };
  return { ok: false };
}

function filteredObjects() {
  const q = state.q.trim().toLowerCase();
  const out = [];
  for (const o of state.snap.objects) {
    if (state.area !== ALL && o.area !== state.area) continue;
    if (state.platformF !== ALL && o.platform !== state.platformF) continue;
    const sf = state.statusF;
    if (sf !== 'all') {
      if (['assigned', 'unassigned', 'info'].includes(sf)) { if (status(o) !== sf) continue; }
      else if (state.an.flags[sf] && !state.an.flags[sf].has(o.uid)) continue;
    }
    const m = matchQuery(o, q);
    if (!m.ok) continue;
    out.push([o, m.hit]);
  }
  out.sort((a, b) => AREAS.indexOf(a[0].area) - AREAS.indexOf(b[0].area) || tv(a[0].category).localeCompare(tv(b[0].category)) || a[0].name.localeCompare(b[0].name));
  return out;
}

function badgeFor(o) {
  const st = status(o);
  if (state.an.flags.conflict.has(o.uid)) return '<span class="badge b-bad">' + T('Konflikt', 'Conflict') + '</span>';
  if (state.an.flags.deletedgroup.has(o.uid)) return '<span class="badge b-bad">' + T('Gelöschte Gruppe', 'Deleted group') + '</span>';
  if (st === 'unassigned') return '<span class="badge b-warn">' + T('Nicht zugewiesen', 'Unassigned') + '</span>';
  if (st === 'info') return '<span class="badge b-neutral">' + T('Mandantenweit', 'Tenant-wide') + '</span>';
  if (o.assignments.some((a) => a.filterName)) return '<span class="badge b-info">' + T('Mit Filter', 'With filter') + '</span>';
  return '<span class="badge b-ok">' + T('Zugewiesen', 'Assigned') + '</span>';
}

function viewObjects() {
  const list = filteredObjects();
  const counts = {};
  for (const o of state.snap.objects) counts[o.area] = (counts[o.area] || 0) + 1;
  const platforms = [...new Set(state.snap.objects.map((o) => o.platform).filter(Boolean))].sort();
  const shown = list.slice(0, 600);
  if (state.selUid && !state.snap.objects.some((o) => o.uid === state.selUid)) state.selUid = null;
  const sel = state.selUid ? state.snap.objects.find((o) => o.uid === state.selUid) : (shown[0] && shown[0][0]);
  return head(T('Objekte', 'Objects'), T(list.length + ' von ' + state.an.total + ' Objekten', list.length + ' of ' + state.an.total + ' objects') + (state.q ? T(' · Suche „' + esc(state.q) + '“', ' · search “' + esc(state.q) + '”') : '')) +
    '<div class="filters">' + [ALL].concat(AREAS.filter((a) => counts[a])).map((a) => '<button class="pill' + (state.area === a ? ' on' : '') + '" data-act="area" data-area="' + esc(a) + '">' + (a === ALL ? T('Alle', 'All') : ev(a)) + '<span class="n">' + (a === ALL ? state.an.total : counts[a]) + '</span></button>').join('') + '</div>' +
    '<div class="filters"><label class="sr" for="statusF">Status</label><select class="input" id="statusF" data-ch="statusF">' + STATUS_F().map(([k, l]) => '<option value="' + k + '"' + (state.statusF === k ? ' selected' : '') + '>' + l + '</option>').join('') + '</select>' +
    '<label class="sr" for="platformF">' + T('Plattform', 'Platform') + '</label><select class="input" id="platformF" data-ch="platformF"><option value="' + ALL + '">' + T('Alle Plattformen', 'All platforms') + '</option>' + platforms.map((p) => '<option value="' + esc(p) + '"' + (state.platformF === p ? ' selected' : '') + '>' + ev(p) + '</option>').join('') + '</select>' +
    ((state.area !== ALL || state.statusF !== 'all' || state.platformF !== ALL || state.q) ? '<button class="btn ghost" data-act="resetFilters">' + T('Filter zurücksetzen', 'Reset filters') + '</button>' : '') + '</div>' +
    '<div class="split"><section class="panel listcol" style="padding:6px 0"><div class="tablewrap" data-keep-scroll="objlist"><table class="t" style="min-width:640px"><thead><tr><th style="width:32%">Name</th><th style="width:20%">' + T('Kategorie', 'Category') + '</th><th>' + T('Plattform', 'Platform') + '</th><th style="width:24%">' + T('Zuweisung', 'Assignment') + '</th><th>Status</th></tr></thead><tbody>' +
    (shown.length ? shown.map(([o, hit]) => '<tr class="click' + (sel && sel.uid === o.uid ? ' sel' : '') + '" data-act="select" data-uid="' + esc(o.uid) + '"><td class="name wrap">' + esc(objName(o)) + (hit ? '<div class="small faint" style="font-weight:400">' + esc(hit.length > 120 ? hit.slice(0, 120) + '…' : hit) + '</div>' : '') + '</td><td class="muted wrap">' + ev(o.category) + '</td><td class="muted">' + ev(o.platform || '—') + '</td><td class="muted wrap">' + esc(assignShort(o)) + '</td><td>' + badgeFor(o) + '</td></tr>').join('') : '<tr><td colspan="5"><div class="emptybox">' + T('Kein Objekt passt zu Filter und Suche.', 'No object matches the filters and search.') + '</div></td></tr>') +
    '</tbody></table>' + (list.length > shown.length ? '<p class="small muted" style="padding:10px 12px">' + T('Es werden die ersten ' + shown.length + ' Treffer angezeigt. Bitte Filter oder Suche verfeinern.', 'Showing the first ' + shown.length + ' results. Please refine filters or search.') + '</p>' : '') + '</div></section>' +
    '<aside class="panel detailcol" data-keep-scroll="detail">' + (sel ? detail(sel) : '<div class="emptybox">' + T('Objekt auswählen', 'Select an object') + '</div>') + '</aside></div>';
}

function assignShort(o) {
  if (!o.assignable) return '—';
  const inc = o.assignments.filter((a) => a.mode === 'include');
  const exc = o.assignments.filter((a) => a.mode === 'exclude');
  if (!inc.length) return T('Nicht zugewiesen', 'Unassigned');
  let s = inc.length <= 2 ? inc.map((a) => tv(a.label) + (a.intent ? ' (' + tv(a.intent) + ')' : '')).join(', ') : T(inc.length + ' Ziele', inc.length + ' targets');
  if (exc.length) s += T(' · ' + exc.length + ' Ausschl.', ' · ' + exc.length + ' excl.');
  return s;
}

function detail(o) {
  const dq = state.detailQ.trim().toLowerCase();
  const has = (x) => String(x || '').toLowerCase().includes(dq) || String(tv(x) || '').toLowerCase().includes(dq);
  const settings = dq ? o.settings.filter((s) => has(s.label) || has(s.value) || has(s.path)) : o.settings;
  const meta = [[T('Bereich', 'Area'), ev(o.area)], [T('Kategorie', 'Category'), ev(o.category)]];
  if (o.platform) meta.push([T('Plattform', 'Platform'), ev(o.platform)]);
  for (const [k, v] of o.meta || []) meta.push([ev(k), ev(v)]);
  if (o.scopeTags && o.scopeTags.length) meta.push([T('Bereichsmarkierungen', 'Scope tags'), esc(o.scopeTags.join(', '))]);
  meta.push([T('Erstellt', 'Created'), fmtDT(o.created)], [T('Geändert', 'Modified'), fmtDT(o.modified)]);
  let html = '<div style="display:flex;flex-direction:column;gap:6px"><span class="small muted">' + ev(o.area) + ' · ' + ev(o.category) + '</span><h2 style="font-size:18px">' + esc(objName(o)) + '</h2>' + badgeFor(o).replace('class="badge', 'style="align-self:flex-start" class="badge') + '</div>';
  if (o.description) html += '<p class="small" style="color:var(--text2)">' + esc(o.description) + '</p>';
  html += '<dl class="kv">' + meta.map(([k, v]) => '<dt>' + k + '</dt><dd>' + v + '</dd>').join('') + '</dl>';
  if (o.assignable) {
    html += '<div style="display:flex;flex-direction:column;gap:6px"><span class="sectlabel">' + T('Zuweisungen', 'Assignments') + '</span>' +
      (o.assignments.length ? o.assignments.map((a) => '<div class="assign"><span>' + (a.deletedGroup ? '<span class="badge b-bad">' + T('gelöscht', 'deleted') + '</span> ' : '') + ev(a.label) + (a.dynamic ? ' <span class="faint small">' + T('(dynamisch)', '(dynamic)') + '</span>' : '') +
        (a.filterName ? '<span class="small faint" style="display:block">' + (a.filterMode === 'exclude' ? T('Filter Ausschluss: ', 'Filter exclude: ') : T('Filter Einschluss: ', 'Filter include: ')) + esc(a.filterName) + '</span>' : '') + (a.extra ? '<span class="small faint" style="display:block">' + ev(a.extra) + '</span>' : '') + '</span>' +
        '<span class="small ' + (a.mode === 'exclude' ? 'm-exc' : 'm-inc') + '" style="text-align:right">' + (a.mode === 'exclude' ? T('ausgeschlossen', 'excluded') : T('eingeschlossen', 'included')) + (a.intent ? '<br>' + ev(a.intent) : '') + '</span></div>').join('') : '<div class="assign"><span>' + T('Keine Zuweisung', 'No assignment') + '</span><span class="small" style="color:var(--amber)">' + T('Aufräum-Kandidat', 'Clean-up candidate') + '</span></div>') + '</div>';
  }
  html += '<div style="display:flex;flex-direction:column;gap:4px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span class="sectlabel">' + T('Einstellungen', 'Settings') + ' (' + o.settings.length + ')</span>' +
    (o.settings.length > 8 ? '<input class="input" style="max-width:200px;min-height:32px;padding:4px 10px;font-size:12px" id="detailQ" data-in="detailQ" placeholder="' + T('filtern', 'filter') + '" value="' + esc(state.detailQ) + '" aria-label="' + T('Einstellungen filtern', 'Filter settings') + '">' : '') + '</div>' +
    (settings.length ? settings.map((s) => '<div class="setting d' + Math.min(2, s.depth || 0) + '"><span class="l">' + (s.path ? '<span class="p">' + ev(s.path) + '</span>' : '') + ev(s.label) + '</span><span class="v">' + ev(s.value) + '</span></div>').join('') : '<p class="small muted">' + (o.settings.length ? T('Kein Treffer.', 'No match.') : T('Keine konfigurierten Werte gefunden.', 'No configured values found.')) + '</p>') + '</div>';
  for (const c of o.code || []) html += '<details class="code"><summary>' + ev(c.title) + ' <span class="faint small">(' + c.content.split('\n').length + T(' Zeilen', ' lines') + ')</span></summary><pre>' + esc(c.content) + '</pre></details>';
  html += '<label class="field" for="note">' + T('Notiz für die Doku', 'Note for the documentation') + '<textarea class="input" id="note" data-in="note" data-uid="' + esc(o.uid) + '" placeholder="' + T('Zweck, Ansprechpartner, Ticket …', 'Purpose, contact, ticket …') + '">' + esc(state.notes[o.uid] || '') + '</textarea></label>';
  html += '<details class="code"><summary>' + T('Rohdaten (JSON)', 'Raw data (JSON)') + '</summary><pre>' + esc(JSON.stringify(o.raw || {}, null, 2)) + '</pre></details>';
  return html;
}

// ---------------- Geräte ----------------
const DEV_FLAGS = () => [['all', T('Alle Geräte', 'All devices')], ['noncompliant', T('Nicht konform', 'Noncompliant')], ['grace', T('Im Kulanzzeitraum', 'In grace period')], ['stale', T('Über 30 Tage ohne Check-in', 'No check-in for over 30 days')], ['unencrypted', T('Unverschlüsselt (Windows/macOS)', 'Unencrypted (Windows/macOS)')], ['jailbroken', T('Jailbreak / Root', 'Jailbroken / rooted')], ['personal', T('Privatgeräte', 'Personal devices')]];
const compBadge = (c) => {
  const cls = c === 'compliant' ? 'b-ok' : c === 'noncompliant' || c === 'error' || c === 'conflict' ? 'b-bad' : c === 'inGracePeriod' ? 'b-warn' : 'b-neutral';
  return '<span class="badge ' + cls + '">' + ev(COMPLIANCE[c] || c) + '</span>';
};
function syncCell(iso) {
  if (!iso) return '—';
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86400000);
  const txt = days <= 0 ? T('heute', 'today') : days === 1 ? T('gestern', 'yesterday') : T('vor ' + days + ' Tagen', days + ' days ago');
  return '<span' + (days > 30 ? ' style="color:var(--amber)"' : '') + ' title="' + fmtDT(iso) + '">' + txt + '</span>';
}
const countRows = (pairs, max) => pairs.slice(0, max || 8).map(([k, n]) => '<div class="setting"><span class="l">' + ev(k) + '</span><span class="v">' + n + '</span></div>').join('') || '<p class="small muted">—</p>';
function countPairs(arr, fn) { const m = new Map(); for (const x of arr) { const k = fn(x) || '—'; m.set(k, (m.get(k) || 0) + 1); } return [...m.entries()].sort((a, b) => b[1] - a[1]); }

function viewDevices() {
  const all = state.snap.devices || [];
  const ap = state.snap.autopilot || [];
  const dv = state.an.devices;
  const tabs = '<div class="filters"><button class="pill' + (state.devTab === 'managed' ? ' on' : '') + '" data-act="devTab" data-tab="managed">' + T('Verwaltete Geräte', 'Managed devices') + '<span class="n">' + all.length + '</span></button><button class="pill' + (state.devTab === 'autopilot' ? ' on' : '') + '" data-act="devTab" data-tab="autopilot">' + T('Autopilot-Geräte', 'Autopilot devices') + '<span class="n">' + ap.length + '</span></button></div>';
  if (!all.length && !ap.length) {
    return head(T('Geräte', 'Devices'), T('Inventar aller in Intune verwalteten Geräte.', 'Inventory of all devices managed by Intune.')) + '<div class="panel"><div class="emptybox">' + T('Keine Geräte gefunden', 'No devices found') + (state.snap.warnings.some((w) => /Geräte|Device/.test(w.source)) ? T(' – siehe Scan-Protokoll (evtl. fehlt DeviceManagementManagedDevices.Read.All).', ' – see scan log (DeviceManagementManagedDevices.Read.All may be missing).') : '.') + '</div></div>';
  }
  if (state.devTab === 'autopilot') return head(T('Geräte', 'Devices'), T('Bei Windows Autopilot registrierte Hardware – auch Geräte, die noch nicht ausgerollt sind.', 'Hardware registered with Windows Autopilot – including devices not yet deployed.')) + tabs + viewAutopilot(ap, dv);

  const q = state.devQ.trim().toLowerCase();
  const list = all.filter((d) => {
    if (state.devPlatform !== ALL && d.platform !== state.devPlatform) return false;
    if (state.devComp !== 'all' && d.compliance !== state.devComp) return false;
    if (state.devOwner !== 'all' && d.owner !== state.devOwner) return false;
    if (state.devFlag !== 'all' && !dv.flags[state.devFlag].has(d.id)) return false;
    if (q && ![d.name, d.user, d.userName, d.serial, d.model, d.osVersion, d.manufacturer, d.category].some((x) => String(x || '').toLowerCase().includes(q))) return false;
    return true;
  }).sort((a, b) => a.platform.localeCompare(b.platform) || a.name.localeCompare(b.name));
  const shown = list.slice(0, 1000);
  const sel = state.devSel ? all.find((d) => d.id === state.devSel) : null;
  const platCounts = dv.byPlatform;
  const vers = state.devPlatform !== ALL ? (dv.versions[state.devPlatform] || []) : null;
  const comps = [...new Set(all.map((d) => d.compliance))];
  const inPlat = state.devPlatform !== ALL ? all.filter((d) => d.platform === state.devPlatform) : all;
  return head(T('Geräte', 'Devices'), T('Inventar aller in Intune verwalteten Geräte – ' + all.length + ' insgesamt.', 'Inventory of all devices managed by Intune – ' + all.length + ' in total.')) + tabs +
    '<div class="kpis">' + platCounts.map(([p, n]) => '<button class="kpi" data-act="devPlatform" data-p="' + esc(p) + '"' + (state.devPlatform === p ? ' style="border-color:var(--accent)"' : '') + '><span class="lbl">' + ev(p) + '</span><span class="val">' + n + '</span><span class="sub">' + all.filter((d) => d.platform === p && (d.compliance === 'noncompliant' || d.compliance === 'error')).length + T(' nicht konform · ', ' noncompliant · ') + all.filter((d) => d.platform === p && dv.flags.stale.has(d.id)).length + T(' inaktiv', ' inactive') + '</span></button>').join('') + '</div>' +
    '<div class="row"><section class="panel" style="flex:1 1 260px"><h2>' + (vers ? T('Versionen ', 'Versions ') + ev(state.devPlatform) : T('Konformität', 'Compliance')) + '</h2>' + (vers ? countRows(vers, 10) : countRows(dv.byCompliance)) + '</section>' +
    '<section class="panel" style="flex:1 1 260px"><h2>' + T('Registrierungsart', 'Enrollment type') + '</h2>' + countRows(state.devPlatform !== ALL ? countPairs(inPlat, (d) => d.enrollType) : dv.byEnroll) + '</section>' +
    '<section class="panel" style="flex:1 1 260px"><h2>' + (state.devPlatform === 'Windows' ? T('Join-Typ', 'Join type') : T('Besitz', 'Ownership')) + '</h2>' + countRows(state.devPlatform === 'Windows' ? dv.byJoin : countPairs(inPlat, (d) => d.owner)) + '</section></div>' +
    '<div class="filters"><button class="pill' + (state.devPlatform === ALL ? ' on' : '') + '" data-act="devPlatform" data-p="' + ALL + '">' + T('Alle', 'All') + '<span class="n">' + all.length + '</span></button>' + platCounts.map(([p, n]) => '<button class="pill' + (state.devPlatform === p ? ' on' : '') + '" data-act="devPlatform" data-p="' + esc(p) + '">' + ev(p) + '<span class="n">' + n + '</span></button>').join('') + '</div>' +
    '<div class="filters"><label class="sr" for="devFlag">' + T('Auffälligkeit', 'Issue') + '</label><select class="input" id="devFlag" data-ch="devFlag">' + DEV_FLAGS().map(([k, l]) => '<option value="' + k + '"' + (state.devFlag === k ? ' selected' : '') + '>' + l + (k !== 'all' ? ' (' + dv.flags[k].size + ')' : '') + '</option>').join('') + '</select>' +
    '<label class="sr" for="devComp">' + T('Konformität', 'Compliance') + '</label><select class="input" id="devComp" data-ch="devComp"><option value="all">' + T('Alle Konformitätsstatus', 'All compliance states') + '</option>' + comps.map((c) => '<option value="' + esc(c) + '"' + (state.devComp === c ? ' selected' : '') + '>' + ev(COMPLIANCE[c] || c) + '</option>').join('') + '</select>' +
    '<label class="sr" for="devOwner">' + T('Besitz', 'Ownership') + '</label><select class="input" id="devOwner" data-ch="devOwner"><option value="all">' + T('Firma & privat', 'Corporate & personal') + '</option>' + ['Firma', 'Privat', 'Unbekannt'].map((o) => '<option value="' + o + '"' + (state.devOwner === o ? ' selected' : '') + '>' + ev(o) + '</option>').join('') + '</select>' +
    '<input class="input" style="max-width:280px;min-height:36px" id="devQ" data-in="devQ" placeholder="' + T('Gerät, Benutzer, Seriennummer', 'Device, user, serial number') + '" value="' + esc(state.devQ) + '" aria-label="' + T('Geräte durchsuchen', 'Search devices') + '">' +
    ((state.devPlatform !== ALL || state.devComp !== 'all' || state.devOwner !== 'all' || state.devFlag !== 'all' || state.devQ) ? '<button class="btn ghost" data-act="devReset">' + T('Filter zurücksetzen', 'Reset filters') + '</button>' : '') + '</div>' +
    '<div class="split"><section class="panel listcol" style="padding:6px 0"><div class="tablewrap" data-keep-scroll="devlist"><table class="t" style="min-width:640px"><thead><tr><th>' + T('Gerät', 'Device') + '</th><th>' + T('Plattform', 'Platform') + '</th><th>Version</th><th>' + T('Benutzer', 'User') + '</th><th>' + T('Konformität', 'Compliance') + '</th><th>Check-in</th></tr></thead><tbody>' +
    (shown.length ? shown.map((d) => '<tr class="click' + (sel && sel.id === d.id ? ' sel' : '') + '" data-act="devSelect" data-id="' + esc(d.id) + '"><td class="name wrap">' + esc(d.name) + (d.model ? '<div class="small faint" style="font-weight:400">' + esc(d.model) + '</div>' : '') + '</td><td class="muted">' + ev(d.platform) + '</td><td class="muted mono" style="font-size:12px">' + esc(d.osVersion) + '</td><td class="muted wrap">' + esc(d.userName || d.user || '—') + (d.owner === 'Privat' ? ' <span class="badge b-neutral">' + T('privat', 'personal') + '</span>' : '') + '</td><td>' + compBadge(d.compliance) + (d.jailbroken ? ' <span class="badge b-bad">Root</span>' : '') + '</td><td class="muted small">' + syncCell(d.lastSync) + '</td></tr>').join('') : '<tr><td colspan="6"><div class="emptybox">' + T('Kein Gerät passt zu den Filtern.', 'No device matches the filters.') + '</div></td></tr>') +
    '</tbody></table>' + (list.length > shown.length ? '<p class="small muted" style="padding:10px 12px">' + T('Es werden die ersten ' + shown.length + ' von ' + list.length + ' Geräten angezeigt.', 'Showing the first ' + shown.length + ' of ' + list.length + ' devices.') + '</p>' : '<p class="small muted" style="padding:10px 12px">' + list.length + T(' Geräte', ' devices') + '</p>') + '</div></section>' +
    '<aside class="panel detailcol">' + (sel ? deviceDetail(sel) : '<div class="emptybox">' + T('Gerät auswählen für Details', 'Select a device for details') + '</div>') + '</aside></div>';
}

function deviceDetail(d) {
  const yn = (b) => b ? T('Ja', 'Yes') : T('Nein', 'No');
  const rows = [
    [T('Plattform', 'Platform'), d.os + (d.osVersion ? ' ' + d.osVersion : '')], [T('Hersteller / Modell', 'Manufacturer / model'), [d.manufacturer, d.model].filter(Boolean).join(' ')], [T('Seriennummer', 'Serial number'), d.serial, 'mono'],
    [T('Benutzer', 'User'), d.userName ? d.userName + (d.user ? ' (' + d.user + ')' : '') : d.user], [T('Besitz', 'Ownership'), tv(d.owner)], [T('Konformität', 'Compliance'), tv(COMPLIANCE[d.compliance] || d.compliance)],
    [T('Registrierungsart', 'Enrollment type'), tv(d.enrollType)], [T('Join-Typ', 'Join type'), tv(d.join)], [T('Verwaltung über', 'Managed by'), tv(d.agent)], [T('Registrierungsprofil', 'Enrollment profile'), d.profile], [T('Kategorie', 'Category'), d.category],
    [T('Verschlüsselt', 'Encrypted'), yn(d.encrypted)], [T('Betreut (Supervised)', 'Supervised'), d.platform === 'iOS/iPadOS' ? yn(d.supervised) : ''], [T('Jailbreak / Root', 'Jailbroken / rooted'), d.platform === 'iOS/iPadOS' || d.platform === 'Android' ? yn(d.jailbroken) : ''],
    ['Autopilot', d.platform === 'Windows' ? yn(d.autopilot) : ''], [T('Sicherheitspatch', 'Security patch'), d.patch], ['Edition', d.sku], [T('Speicher', 'Storage'), d.storageTotal ? fmtBytes(d.storageFree) + T(' frei von ', ' free of ') + fmtBytes(d.storageTotal) : ''],
    [T('Registriert', 'Enrolled'), d.enrolled ? fDT(d.enrolled) : ''], [T('Letzter Check-in', 'Last check-in'), d.lastSync ? fDT(d.lastSync) : ''], ['Status', tv(d.state)], [T('Entra-Geräte-ID', 'Entra device ID'), d.entraId, 'mono'], [T('Intune-Geräte-ID', 'Intune device ID'), d.id, 'mono']
  ].filter(([, v]) => v);
  return '<div style="display:flex;flex-direction:column;gap:6px"><span class="small muted">' + ev(d.platform) + '</span><h2 style="font-size:18px">' + esc(d.name) + '</h2><div style="display:flex;gap:6px;flex-wrap:wrap">' + compBadge(d.compliance) + (state.an.devices.flags.stale.has(d.id) ? '<span class="badge b-warn">' + T('inaktiv', 'inactive') + '</span>' : '') + '</div></div>' +
    '<dl class="kv">' + rows.map(([k, v, cls]) => '<dt>' + esc(k) + '</dt><dd' + (cls === 'mono' ? ' class="mono" style="font-size:12px"' : '') + '>' + esc(v) + '</dd>').join('') + '</dl>';
}

function viewAutopilot(ap, dv) {
  const q = state.devQ.trim().toLowerCase();
  const list = ap.filter((a) => !q || [a.serial, a.model, a.groupTag, a.user, a.displayName, a.order].some((x) => String(x || '').toLowerCase().includes(q)));
  const stBadge = (s) => '<span class="badge ' + (s === 'Registriert' ? 'b-ok' : s === 'Fehlgeschlagen' || s === 'Blockiert' ? 'b-bad' : 'b-neutral') + '">' + ev(s) + '</span>';
  return '<div class="row"><section class="panel" style="flex:1 1 260px"><h2>Group Tags</h2>' + countRows(dv.byGroupTag, 10) + '</section>' +
    '<section class="panel" style="flex:1 1 260px"><h2>Status</h2>' + countRows(countPairs(ap, (a) => a.state)) + '</section>' +
    '<section class="panel" style="flex:1 1 260px"><h2>' + T('Bereitstellungsprofil', 'Deployment profile') + '</h2>' + countRows(countPairs(ap, (a) => a.profile)) + '</section></div>' +
    '<div class="filters"><input class="input" style="max-width:320px;min-height:36px" id="devQ" data-in="devQ" placeholder="' + T('Seriennummer, Modell, Group Tag', 'Serial number, model, group tag') + '" value="' + esc(state.devQ) + '" aria-label="' + T('Autopilot-Geräte durchsuchen', 'Search Autopilot devices') + '"></div>' +
    '<section class="panel" style="padding:6px 0"><div class="tablewrap"><table class="t" style="min-width:760px"><thead><tr><th>' + T('Seriennummer', 'Serial number') + '</th><th>' + T('Hersteller / Modell', 'Manufacturer / model') + '</th><th>Group Tag</th><th>Status</th><th>' + T('Profil', 'Profile') + '</th><th>' + T('Gerät', 'Device') + '</th><th>' + T('Letzter Kontakt', 'Last contact') + '</th></tr></thead><tbody>' +
    (list.length ? list.slice(0, 1500).map((a) => '<tr><td class="mono" style="font-size:12px">' + esc(a.serial) + '</td><td class="wrap">' + esc([a.manufacturer, a.model].filter(Boolean).join(' ')) + '</td><td class="muted">' + esc(a.groupTag || '—') + '</td><td>' + stBadge(a.state) + '</td><td class="muted">' + (a.profile === 'Kein Profil' ? '<span style="color:var(--amber)">' + ev(a.profile) + '</span>' : ev(a.profile)) + '</td><td class="muted">' + (a.managedDeviceId ? '<button class="btn ghost" style="padding:0;min-height:0" data-act="devJump" data-id="' + esc(a.managedDeviceId) + '">' + esc(a.displayName || T('öffnen', 'open')) + '</button>' : '—') + '</td><td class="muted small">' + (a.lastContact ? syncCell(a.lastContact) : '—') + '</td></tr>').join('') : '<tr><td colspan="7"><div class="emptybox">' + T('Keine Autopilot-Geräte.', 'No Autopilot devices.') + '</div></td></tr>') +
    '</tbody></table></div></section>';
}

// ---------------- Zuweisungen ----------------
function viewTargets() {
  const tq = state.targetQ.trim().toLowerCase();
  const targets = state.an.targets.filter((t) => !tq || t.label.toLowerCase().includes(tq) || String(tv(t.label)).toLowerCase().includes(tq));
  if (!state.targetKey || !state.an.targets.some((t) => t.key === state.targetKey)) state.targetKey = targets[0] ? targets[0].key : null;
  const t = state.an.targets.find((x) => x.key === state.targetKey);
  const icon = (k) => k.kind === 'allDevices' || k.kind === 'allUsers' ? '<span class="badge b-info">' + T('Alle', 'All') + '</span>' : k.deleted ? '<span class="badge b-bad">' + T('gelöscht', 'deleted') + '</span>' : k.dynamic ? '<span class="badge b-neutral">' + T('dyn.', 'dyn.') + '</span>' : '';
  let right = '<div class="emptybox">' + T('Keine Zuweisungen vorhanden.', 'No assignments.') + '</div>';
  if (t) {
    const byArea = {};
    for (const i of t.items) (byArea[i.area] = byArea[i.area] || []).push(i);
    right = '<div style="display:flex;flex-direction:column;gap:4px"><span class="small muted">' + (t.kind === 'group' ? T('Entra-ID-Gruppe', 'Entra ID group') + (t.dynamic ? T(' (dynamisch)', ' (dynamic)') : '') : T('Integriertes Ziel', 'Built-in target')) + '</span><h2 style="font-size:18px">' + ev(t.label) + '</h2><span class="small muted">' + T(t.items.length + ' Zuweisungen · ' + t.items.filter((i) => i.mode === 'exclude').length + ' davon Ausschlüsse', t.items.length + ' assignments · ' + t.items.filter((i) => i.mode === 'exclude').length + ' of them exclusions') + '</span></div>' +
      Object.keys(byArea).sort((a, b) => AREAS.indexOf(a) - AREAS.indexOf(b)).map((area) => '<div style="display:flex;flex-direction:column;gap:4px"><span class="sectlabel">' + ev(area) + '</span><div class="tablewrap"><table class="t"><thead><tr><th>' + T('Objekt', 'Object') + '</th><th>' + T('Kategorie', 'Category') + '</th><th>' + T('Art', 'Mode') + '</th><th>' + T('Absicht / Filter', 'Intent / filter') + '</th></tr></thead><tbody>' +
        byArea[area].map((i) => '<tr class="click" data-act="open" data-uid="' + esc(i.uid) + '"><td class="name wrap">' + esc(i.name) + '</td><td class="muted wrap">' + ev(i.category) + '</td><td>' + (i.mode === 'exclude' ? '<span class="badge b-bad">' + T('Ausgeschlossen', 'Excluded') + '</span>' : '<span class="badge b-ok">' + T('Eingeschlossen', 'Included') + '</span>') + '</td><td class="muted small wrap">' + esc([tv(i.intent), i.filterName ? (i.filterMode === 'exclude' ? T('Filter Ausschluss: ', 'Filter exclude: ') : T('Filter Einschluss: ', 'Filter include: ')) + i.filterName : '', tv(i.extra)].filter(Boolean).join(' · ') || '—') + '</td></tr>').join('') +
        '</tbody></table></div></div>').join('');
  }
  return head(T('Zuweisungen nach Ziel', 'Assignments by target'), T('Welche Gruppe bekommt was – Konfiguration, Apps, Updates, Skripte und mehr.', 'Which group gets what – configuration, apps, updates, scripts and more.')) +
    '<div class="split"><section class="panel" style="flex:1 1 280px;max-width:420px"><input class="input" id="targetQ" data-in="targetQ" placeholder="' + T('Gruppe suchen', 'Search groups') + '" value="' + esc(state.targetQ) + '" aria-label="' + T('Gruppe suchen', 'Search groups') + '"><div class="targetlist" data-keep-scroll="targets">' +
    targets.map((k) => '<button class="targetbtn' + (k.key === state.targetKey ? ' on' : '') + '" data-act="target" data-key="' + esc(k.key) + '">' + icon(k) + '<span style="min-width:0;overflow:hidden;text-overflow:ellipsis">' + ev(k.label) + '</span><span class="n">' + k.items.length + '</span></button>').join('') +
    '</div></section><section class="panel" style="flex:3 1 520px">' + right + '</section></div>';
}

// ---------------- Konflikte ----------------
function viewConflicts() {
  const all = state.an.conflicts;
  const list = all.filter((c) => c.kind === state.confKind);
  const sevB = { high: '<span class="badge b-bad">' + T('Hoch', 'High') + '</span>', medium: '<span class="badge b-warn">' + T('Prüfen', 'Check') + '</span>', low: '<span class="badge b-info">' + T('Niedrig', 'Low') + '</span>' };
  return head(T('Konflikte & Dubletten', 'Conflicts & duplicates'), T('Gleiche Einstellung in mehreren zugewiesenen Objekten. „Hoch“ = die Zielgruppen überschneiden sich (gleiche Gruppe oder „Alle“).', 'Same setting in several assigned objects. “High” = the target groups overlap (same group or “All”).')) +
    '<div class="filters"><button class="pill' + (state.confKind === 'conflict' ? ' on' : '') + '" data-act="confKind" data-kind="conflict">' + T('Widersprüchliche Werte', 'Contradicting values') + '<span class="n">' + all.filter((c) => c.kind === 'conflict').length + '</span></button><button class="pill' + (state.confKind === 'duplicate' ? ' on' : '') + '" data-act="confKind" data-kind="duplicate">' + T('Gleicher Wert mehrfach', 'Same value repeated') + '<span class="n">' + all.filter((c) => c.kind === 'duplicate').length + '</span></button></div>' +
    (list.length ? list.slice(0, 300).map((c) => '<section class="conf"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;align-items:center"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' + sevB[c.sev] + '<b style="font-size:15px">' + ev(c.label) + '</b></div><span class="small muted">' + c.entries.length + T(' Objekte', ' objects') + '</span></div>' +
      '<div class="vals">' + c.entries.map((e) => '<button class="val" data-act="open" data-uid="' + esc(e.uid) + '"><span class="small muted">' + esc(e.name) + '</span><span class="v">' + ev(e.value) + '</span><span class="small faint">' + esc(e.assignmentLabels.map(tv).join(', ') || '—') + '</span></button>').join('') + '</div>' +
      '<span class="small faint mono" style="word-break:break-all">' + esc(c.key) + '</span></section>').join('') : '<div class="panel"><div class="emptybox">' + T('Nichts gefunden.', 'Nothing found.') + '</div></div>') +
    (list.length > 300 ? '<p class="small muted">' + T('Es werden die ersten 300 angezeigt; der Export enthält alle.', 'Showing the first 300; the export contains all.') + '</p>' : '');
}

// ---------------- Snapshots ----------------
function compareLabel() {
  const m = state.compareMeta;
  if (!m) return '';
  if (m.type === 'file') return T('Datei ', 'file ') + m.file + ' (' + fDT(m.at) + ')';
  if (m.type === 'demo') return T('Demo-Snapshot vom ', 'demo snapshot of ') + fD(m.at);
  return T('Snapshot vom ', 'snapshot of ') + fDT(m.at);
}
function viewSnapshots() {
  const demo = state.snap.demo;
  const list = demo ? [{ name: 'demo-vorher.json', tenant: state.snap.tenant.displayName, scannedAt: demoOlderSnapshot().scannedAt, count: demoOlderSnapshot().objects.length }] : state.snapshots;
  const diff = state.diff;
  const kindBadge = { 'Neu': 'b-ok', 'Geändert': 'b-info', 'Zuweisung': 'b-warn', 'Entfernt': 'b-bad' };
  return head(T('Snapshots & Vergleich', 'Snapshots & compare'), T('Jeder Scan wird automatisch lokal gespeichert. Zwei Stände vergleichen zeigt, was sich geändert hat.', 'Every scan is saved locally. Comparing two states shows what has changed.'),
    '<label class="btn" for="importFile">' + T('Snapshot-Datei als Vergleich laden', 'Load snapshot file for comparison') + '</label><input type="file" id="importFile" accept=".json,application/json" class="sr" data-ch="importFile">' +
    '<button class="btn" data-act="exportJson">' + T('Aktuellen Stand als JSON', 'Current state as JSON') + '</button>') +
    '<div class="split"><section class="panel" style="flex:1 1 300px;max-width:440px"><h2>' + T('Gespeicherte Snapshots', 'Saved snapshots') + '</h2>' +
    (list.length ? '<div class="targetlist" data-keep-scroll="snaps">' + list.map((s) => '<div class="assign" style="flex-direction:column;gap:6px"><div style="display:flex;justify-content:space-between;gap:8px"><b style="font-weight:500">' + fmtDT(s.scannedAt) + '</b><span class="small muted">' + (s.count || 0) + T(' Objekte', ' objects') + '</span></div><span class="small muted">' + esc(s.tenant || '') + '</span><div style="display:flex;gap:6px;flex-wrap:wrap">' +
      '<button class="btn" style="min-height:32px" data-act="compare" data-name="' + esc(s.name) + '">' + (state.compareName === s.name ? T('✓ Vergleichsbasis', '✓ Baseline') : T('Vergleichen', 'Compare')) + '</button>' +
      (!demo ? '<button class="btn" style="min-height:32px" data-act="openSnap" data-name="' + esc(s.name) + '">' + T('Ansehen', 'View') + '</button><button class="btn ghost" style="min-height:32px" data-act="delSnap" data-name="' + esc(s.name) + '">' + T('Entfernen', 'Remove') + '</button>' : '') + '</div></div>').join('') + '</div>'
      : '<p class="muted small">' + T('Noch keine gespeicherten Snapshots. Nach dem nächsten Scan liegt hier der erste.', 'No saved snapshots yet. The first one appears here after the next scan.') + '</p>') +
    '<p class="small faint">' + T('Ablage: ', 'Location: ') + esc(state.info.dataDir || '') + '/snapshots</p></section>' +
    '<section class="panel" style="flex:3 1 520px">' + (diff ? '<h2>' + T('Änderungen seit ', 'Changes since ') + esc(compareLabel()) + '</h2><div class="filters">' +
      ['Geändert', 'Zuweisung', 'Neu', 'Entfernt'].map((k) => '<span class="chip">' + ev(k) + ': ' + diff.filter((d) => d.kind === k).length + '</span>').join('') + '</div>' +
      (diff.length ? diff.map((d) => '<div class="setting" style="flex-direction:column;gap:4px"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="badge ' + kindBadge[d.kind] + '">' + ev(d.kind) + '</span>' +
        (d.kind !== 'Entfernt' ? '<button class="btn ghost" style="padding:0;min-height:0;font-weight:500" data-act="open" data-uid="' + esc(d.uid) + '">' + esc(d.name) + '</button>' : '<b style="font-weight:500">' + esc(d.name) + '</b>') + '<span class="small muted">' + ev(d.area) + ' · ' + ev(d.category) + '</span></div>' +
        (d.details.length ? '<ul class="small" style="margin:0;padding-left:18px;color:var(--text2)">' + d.details.slice(0, 40).map((x) => '<li class="mono" style="font-size:12px">' + esc(x) + '</li>').join('') + (d.details.length > 40 ? '<li>… ' + (d.details.length - 40) + T(' weitere', ' more') + '</li>' : '') + '</ul>' : '') + '</div>').join('') : '<div class="emptybox">' + T('Keine Unterschiede.', 'No differences.') + '</div>')
      : '<div class="emptybox">' + T('Links einen Snapshot als Vergleichsbasis wählen oder eine Snapshot-Datei laden.', 'Pick a snapshot on the left as baseline, or load a snapshot file.') + '</div>') + '</section></div>';
}

// ---------------- Export ----------------
const FORMATS = () => [
  ['docx', 'Word', T('.docx mit Titelseite & Inhaltsverzeichnis', '.docx with cover page & table of contents')], ['pdf', 'PDF', T('über den Druckdialog', 'via the print dialog')], ['html', T('HTML-Bericht', 'HTML report'), T('eine Datei, im Browser lesbar', 'single file, readable in a browser')],
  ['md', 'Markdown', T('für Wiki, Git, IT-Glue', 'for wiki, Git, IT Glue')], ['csv-settings', T('Excel: Einstellungen', 'Excel: settings'), T('CSV, eine Zeile je Einstellung', 'CSV, one row per setting')], ['csv-assign', T('Excel: Zuweisungen', 'Excel: assignments'), T('CSV, eine Zeile je Zuweisung', 'CSV, one row per assignment')],
  ['csv-devices', T('Excel: Geräte', 'Excel: devices'), T('CSV, Inventar inkl. Autopilot', 'CSV, inventory incl. Autopilot')], ['json', T('JSON-Backup', 'JSON backup'), T('vollständiger Rohdaten-Snapshot', 'complete raw data snapshot')]
];
const exLang = () => state.ex.lang || getLang();
function viewExport() {
  const e = state.ex;
  const isCsv = e.format.startsWith('csv') || e.format === 'json';
  const counts = {};
  for (const o of state.snap.objects) counts[o.area] = (counts[o.area] || 0) + 1;
  const xl = exLang();
  const tocItems = withLang(xl, () => X.SECTIONS.filter((s) => e.sections.has(s.key) && (s.key !== 'diff' || state.diff) && s.key !== 'code').map((s) => s.label()));
  const previewTitle = withLang(xl, () => T('Intune-Dokumentation', 'Intune documentation'));
  const fmtLabel = FORMATS().find((f) => f[0] === e.format)[1];
  return head(T('Dokumentation erzeugen', 'Create documentation'), T('Ein Klick, fertige Kundendoku. Notizen aus der Objektansicht werden übernommen.', 'One click, finished customer documentation. Notes from the object view are included.')) +
    '<div class="split"><section class="panel" style="flex:3 1 480px;gap:20px">' +
    '<div style="display:flex;flex-direction:column;gap:10px"><h2 style="font-size:14px">' + T('Format', 'Format') + '</h2><div class="formats">' +
    FORMATS().map(([k, l, s]) => '<button class="fmt' + (e.format === k ? ' on' : '') + '" data-act="fmt" data-fmt="' + k + '"><b>' + esc(l) + '</b><span class="s">' + esc(s) + '</span></button>').join('') + '</div></div>' +
    (e.format !== 'json' ? '<div style="display:flex;flex-direction:column;gap:10px"><h2 style="font-size:14px">' + T('Sprache der Dokumentation', 'Documentation language') + '</h2><div class="filters">' +
      [['de', 'Deutsch'], ['en', 'English']].map(([k, l]) => '<button class="pill' + (xl === k ? ' on' : '') + '" data-act="exLang" data-lang="' + k + '">' + l + '</button>').join('') + '</div></div>' : '') +
    (!isCsv ? '<div style="display:flex;flex-direction:column;gap:10px"><h2 style="font-size:14px">' + T('Inhalt', 'Content') + '</h2><div class="checks">' +
      X.SECTIONS.map((s) => '<label class="check"><input type="checkbox" data-ch="sec" data-key="' + s.key + '"' + (e.sections.has(s.key) ? ' checked' : '') + (s.key === 'diff' && !state.diff ? ' disabled' : '') + '><span>' + esc(s.label()) + (s.key === 'diff' && !state.diff ? ' <span class="faint">' + T('(erst Vergleich wählen)', '(pick a comparison first)') + '</span>' : '') + (s.key === 'devicelist' ? ' <span class="faint">' + T('(personenbezogen)', '(personal data)') + '</span>' : '') + '</span></label>').join('') + '</div></div>' : '') +
    (e.format !== 'json' ? '<div style="display:flex;flex-direction:column;gap:10px"><h2 style="font-size:14px">' + T('Bereiche', 'Areas') + '</h2><div class="checks">' +
      AREAS.filter((a) => counts[a]).map((a) => '<label class="check"><input type="checkbox" data-ch="exArea" data-area="' + esc(a) + '"' + (e.areas.has(a) ? ' checked' : '') + '><span>' + ev(a) + ' <span class="faint mono">' + counts[a] + '</span></span></label>').join('') + '</div></div>' : '') +
    (!isCsv ? '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">' +
      '<label class="field" for="exCustomer">' + T('Kunde (Titel)', 'Customer (title)') + '<input class="input" id="exCustomer" data-in="exCustomer" placeholder="' + esc(state.snap.tenant.displayName || '') + '" value="' + esc(e.customer) + '"></label>' +
      '<label class="field" for="exPartner">' + T('Partner (Branding)', 'Partner (branding)') + '<input class="input" id="exPartner" data-in="exPartner" placeholder="' + T('z. B. Muster IT-Partner GmbH', 'e.g. Example IT Partner Ltd') + '" value="' + esc(e.partner) + '"></label>' +
      '<label class="field" for="exAuthor">' + T('Erstellt von', 'Created by') + '<input class="input" id="exAuthor" data-in="exAuthor" placeholder="Name" value="' + esc(e.author) + '"></label></div>' : '') +
    '<button class="btn primary lg" data-act="doExport"' + (state.busy ? ' disabled' : '') + '>' + (state.busy ? T('Wird erzeugt …', 'Creating …') : T(esc(fmtLabel) + ' erzeugen', 'Create ' + esc(fmtLabel))) + '</button>' +
    (e.format === 'pdf' ? '<p class="small muted">' + T('Im Druckdialog als Ziel „Als PDF speichern“ bzw. „Microsoft Print to PDF“ wählen.', 'In the print dialog, choose “Save as PDF” or “Microsoft Print to PDF”.') + '</p>' : '') +
    (e.format === 'docx' ? '<p class="small muted">' + T('Word fragt beim Öffnen, ob Felder aktualisiert werden sollen – mit „Ja“ erscheint das Inhaltsverzeichnis.', 'Word asks to update fields when opening – answer “Yes” to fill the table of contents.') + '</p>' : '') +
    '</section><aside class="preview" style="flex:2 1 300px"><span class="k">' + T('Vorschau · Titelseite', 'Preview · cover page') + '</span><h3>' + esc(previewTitle) + '<br>' + esc(e.customer || state.snap.tenant.displayName || '') + '</h3><span class="small" style="color:#4A5E5D">' + withLang(xl, () => esc(T('Stand ', 'As of ') + fD(state.snap.scannedAt))) + (e.partner ? ' · ' + esc(e.partner) : '') + (e.author ? ' · ' + esc(e.author) : '') + '</span><div class="bar"></div>' +
    (!isCsv ? '<div class="toc"><b>' + withLang(xl, () => T('Inhalt', 'Contents')) + '</b>' + tocItems.map((l) => '<span>' + esc(l) + '</span>').join('') + '</div>' : '<p class="small" style="color:#4A5E5D">' + (xl === 'en' ? T('Tabellenexport mit Komma als Trennzeichen – lässt sich direkt in Excel öffnen.', 'Table export with comma separator – opens directly in Excel.') : T('Tabellenexport mit Semikolon als Trennzeichen – lässt sich direkt in Excel öffnen.', 'Table export with semicolon separator – opens directly in German Excel.')) + '</p>') + '</aside></div>';
}

// ---------------- Protokoll & Einstellungen ----------------
function viewLog() {
  const s = state.snap;
  const counts = s.counts || {};
  return head(T('Scan-Protokoll', 'Scan log'), T('Was gelesen wurde und wo es Einschränkungen gab.', 'What was read and where there were restrictions.')) +
    '<section class="panel"><h2>' + T('Hinweise', 'Notes') + ' (' + s.warnings.length + ')</h2>' + (s.warnings.length ? '<div class="tablewrap"><table class="t"><thead><tr><th>' + T('Quelle', 'Source') + '</th><th>' + T('Hinweis', 'Note') + '</th></tr></thead><tbody>' + s.warnings.map((w) => '<tr><td class="name">' + ev(w.source) + '</td><td class="wrap">' + ev(w.message) + '</td></tr>').join('') + '</tbody></table></div>' : '<p class="muted">' + T('Alles vollständig gelesen.', 'Everything was read completely.') + '</p>') +
    '<p class="small muted">' + T('„Keine Berechtigung (403)“ bedeutet meist: Die Graph-Berechtigung fehlt in der App-Registrierung bzw. die Admin-Zustimmung ist veraltet, oder die angemeldete Person hat keine passende Intune-Rolle.', '“Access denied (403)” usually means: the Graph permission is missing from the app registration or admin consent is outdated, or the signed-in user lacks a suitable Intune role.') + '</p></section>' +
    (Object.keys(counts).length ? '<section class="panel"><h2>' + T('Gelesene Quellen', 'Sources read') + '</h2><div class="tablewrap"><table class="t"><thead><tr><th>' + T('Quelle', 'Source') + '</th><th>' + T('Objekte', 'Objects') + '</th></tr></thead><tbody>' + SOURCES.map((src) => '<tr><td>' + ev(src.label) + '</td><td class="mono">' + (counts[src.key] !== undefined ? counts[src.key] : '—') + '</td></tr>').join('') + '</tbody></table></div></section>' : '');
}

function viewSettings() {
  const ru = state.info.redirectUri || '';
  return head(T('Einstellungen', 'Settings'), T('Verbindung und Darstellung.', 'Connection and appearance.')) +
    '<section class="panel" style="max-width:760px"><h2>' + T('App-Registrierung', 'App registration') + '</h2>' +
    '<label class="field" for="cfgClient">' + T('Anwendungs-ID (Client-ID)', 'Application (client) ID') + '<input class="input mono" id="cfgClient" value="' + esc(state.cfg.clientId || '') + '"></label>' +
    '<label class="field" for="cfgTenant">' + T('Standard-Tenant (optional)', 'Default tenant (optional)') + '<input class="input mono" id="cfgTenant" value="' + esc(state.cfg.defaultTenant || '') + '"></label>' +
    '<label class="field" for="cfgBrand">' + T('Untertitel unter dem Logo (z. B. Firmen- oder Teamname)', 'Subtitle below the logo (e.g. company or team name)') + '<input class="input" id="cfgBrand" placeholder="' + T('Intune-Dokumentation & Analyse', 'Intune documentation & analysis') + '" value="' + esc(state.cfg.brandLabel || '') + '"></label>' +
    '<div><button class="btn primary" data-act="saveSettings">' + T('Speichern', 'Save') + '</button></div>' +
    '<span class="sectlabel">' + T('Umleitungs-URI (SPA)', 'Redirect URI (SPA)') + '</span><div class="copyrow"><code>' + esc(ru) + '</code><button class="btn" data-act="copy" data-text="' + esc(ru) + '">' + ICON.copy + T('Kopieren', 'Copy') + '</button></div>' +
    '<span class="sectlabel">' + T('Benötigte Graph-Berechtigungen (delegiert)', 'Required Graph permissions (delegated)') + '</span><div class="permlist">' + PERMS.map((p) => '<span class="chip mono">' + p + '</span>').join('') + '</div></section>' +
    '<section class="panel" style="max-width:760px"><h2>' + T('Darstellung & Daten', 'Appearance & data') + '</h2><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">' +
    '<span class="small muted">' + T('Sprache', 'Language') + '</span>' + [['de', 'Deutsch'], ['en', 'English']].map(([k, l]) => '<button class="pill' + (getLang() === k ? ' on' : '') + '" data-act="setLang" data-lang="' + k + '">' + l + '</button>').join('') +
    '<button class="btn" data-act="theme">' + themeLabel() + '</button></div>' +
    '<dl class="kv"><dt>Version</dt><dd>' + esc(state.info.version || '') + '</dd><dt>' + T('Datenordner', 'Data folder') + '</dt><dd class="mono">' + esc(state.info.dataDir || '') + '</dd><dt>' + T('Angemeldet', 'Signed in') + '</dt><dd>' + esc(state.account ? state.account.username : '—') + '</dd></dl></section>';
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
  try { await api('/api/notes/' + encodeURIComponent(noteKey()), { method: 'POST', body: JSON.stringify(state.notes) }); } catch (e) { toast(T('Notiz konnte nicht gespeichert werden: ', 'Note could not be saved: ') + e.message); }
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
  if (code === 'popup_window_error' || /popup/i.test(m) && /block/i.test(m)) return T('Das Anmeldefenster wurde blockiert. Bitte Pop-ups für <b>localhost</b> erlauben und erneut versuchen.', 'The sign-in window was blocked. Please allow pop-ups for <b>localhost</b> and try again.');
  if (code === 'user_cancelled') return T('Anmeldung abgebrochen.', 'Sign-in cancelled.');
  if (/AADSTS50011/.test(m)) return T('Die Umleitungs-URI passt nicht. In der App-Registrierung unter <b>Authentifizierung › Single-Page-Anwendung</b> genau <code>' + esc(state.info.redirectUri) + '</code> eintragen.', 'The redirect URI does not match. In the app registration under <b>Authentication › Single-page application</b>, enter exactly <code>' + esc(state.info.redirectUri) + '</code>.');
  if (/AADSTS700016/.test(m)) return T('Die App-Registrierung wurde in diesem Tenant nicht gefunden. Ist sie als <b>mehrinstanzenfähig</b> konfiguriert und die Client-ID korrekt?', 'The app registration was not found in this tenant. Is it configured as <b>multitenant</b> and is the client ID correct?');
  if (/AADSTS65001|AADSTS90094|consent/i.test(m)) {
    const t = (document.getElementById('loginTenant') || {}).value || 'organizations';
    const url = 'https://login.microsoftonline.com/' + encodeURIComponent(t.trim() || 'organizations') + '/adminconsent?client_id=' + encodeURIComponent(state.cfg.clientId || '');
    return T('Für diesen Tenant fehlt die Administratorzustimmung. Ein Administrator des Kunden (oder per GDAP mit der Rolle Cloudanwendungsadministrator) kann sie einmalig hier erteilen: ', 'Admin consent is missing for this tenant. A customer administrator (or via GDAP with the Cloud Application Administrator role) can grant it once here: ') + '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + T('Admin-Zustimmung öffnen', 'Open admin consent') + '</a>';
  }
  if (/AADSTS90072|AADSTS50020/.test(m)) return T('Das Konto existiert im angegebenen Tenant nicht. Bei GDAP den Kundentenant angeben und mit dem Partnerkonto anmelden.', 'The account does not exist in the specified tenant. For GDAP, enter the customer tenant and sign in with the partner account.');
  if (/AADSTS9002326|Cross-origin/i.test(m)) return T('Die Umleitungs-URI ist als „Web“ statt als <b>Single-Page-Anwendung</b> registriert. Bitte unter Authentifizierung als SPA anlegen.', 'The redirect URI is registered as “Web” instead of <b>Single-page application</b>. Please add it as SPA under Authentication.');
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
    state.error = T('Scan fehlgeschlagen: ', 'Scan failed: ') + esc(e.message || e);
    render();
  }
}

function startDemo() {
  loadAnalysis(demoSnapshot());
  state.notes = { [state.snap.objects[0].uid]: T('Abgestimmt mit Herrn Beispiel (IT-Leitung), Ticket #4711.', 'Agreed with Mr Example (head of IT), ticket #4711.') };
  state.viewingSaved = null;
  state.diff = null; state.compareName = ''; state.compareSnap = null; state.compareMeta = null;
  state.screen = 'app'; state.view = 'dashboard';
  render();
}

function setCompare(snapObj, meta, name) {
  state.compareSnap = snapObj;
  state.compareName = name || '';
  state.compareMeta = meta;
  state.diff = diffSnapshots(snapObj, state.snap);
  state.ex.sections.add('diff');
}
function clearCompare() { state.diff = null; state.compareName = ''; state.compareSnap = null; state.compareMeta = null; }

const ACTIONS = {
  async saveSetup() {
    const clientId = document.getElementById('cfgClient').value.trim();
    const defaultTenant = document.getElementById('cfgTenant').value.trim();
    if (!/^[0-9a-f-]{36}$/i.test(clientId)) { state.error = T('Bitte eine gültige Client-ID (GUID) eintragen.', 'Please enter a valid client ID (GUID).'); render(); return; }
    state.cfg = await api('/api/config', { method: 'POST', body: JSON.stringify({ clientId, defaultTenant, brandLabel: state.cfg.brandLabel || '' }) });
    state.error = '';
    state.screen = 'login';
    render();
  },
  async saveSettings() {
    const clientId = document.getElementById('cfgClient').value.trim();
    const defaultTenant = document.getElementById('cfgTenant').value.trim();
    if (clientId && !/^[0-9a-f-]{36}$/i.test(clientId)) { toast(T('Ungültige Client-ID', 'Invalid client ID')); return; }
    const brandLabel = document.getElementById('cfgBrand').value.trim();
    state.cfg = await api('/api/config', { method: 'POST', body: JSON.stringify({ clientId, defaultTenant, brandLabel }) });
    toast(T('Gespeichert', 'Saved')); render();
  },
  openSetup() { state.error = ''; state.screen = 'setup'; render(); },
  demo() { startDemo(); },
  lang() { switchLang(getLang() === 'de' ? 'en' : 'de'); },
  setLang(el) { switchLang(el.dataset.lang); },
  exLang(el) { state.ex.lang = el.dataset.lang; render(); },
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
    if (!confirm(T('Abmelden und zur Anmeldung zurückkehren?', 'Sign out and return to the sign-in page?'))) return;
    await G.logout();
    state.account = null; state.snap = null; state.an = null; clearCompare();
    state.screen = 'login'; render();
  },
  async rescan() { await startScan(); },
  theme() { setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'); render(); },
  nav(el) { state.view = el.dataset.view; if (state.view === 'snapshots') refreshSnapshots().then(render); render(); window.scrollTo(0, 0); },
  area(el) { state.area = el.dataset.area; state.view = 'objects'; state.selUid = null; render(); },
  finding(el) {
    if (el.dataset.uid) { ACTIONS.open(el); return; }
    if (el.dataset.view === 'devices') { state.view = 'devices'; state.devTab = el.dataset.dfilter === 'autopilot' ? 'autopilot' : 'managed'; state.devFlag = el.dataset.dfilter && el.dataset.dfilter !== 'autopilot' ? el.dataset.dfilter : 'all'; state.devPlatform = ALL; state.devComp = 'all'; state.devOwner = 'all'; state.devQ = ''; state.devSel = null; render(); window.scrollTo(0, 0); return; }
    state.view = el.dataset.view;
    if (el.dataset.filter) { state.statusF = el.dataset.filter; state.area = ALL; state.platformF = ALL; state.q = ''; }
    state.selUid = null; render(); window.scrollTo(0, 0);
  },
  resetFilters() { state.area = ALL; state.statusF = 'all'; state.platformF = ALL; state.q = ''; render(); },
  select(el) { state.selUid = el.dataset.uid; state.detailQ = ''; render(); },
  open(el) {
    const uid = el.dataset.uid;
    if (!state.snap.objects.some((o) => o.uid === uid)) { toast(T('Objekt ist im aktuellen Stand nicht vorhanden.', 'Object does not exist in the current state.')); return; }
    state.view = 'objects'; state.selUid = uid; state.area = ALL; state.statusF = 'all'; state.platformF = ALL; state.q = ''; state.detailQ = '';
    render(); window.scrollTo(0, 0);
  },
  target(el) { state.targetKey = el.dataset.key; render(); },
  devTab(el) { state.devTab = el.dataset.tab; state.devQ = ''; render(); },
  devPlatform(el) { state.devPlatform = el.dataset.p; state.devSel = null; render(); },
  devSelect(el) { state.devSel = el.dataset.id; render(); },
  devReset() { state.devPlatform = ALL; state.devComp = 'all'; state.devOwner = 'all'; state.devFlag = 'all'; state.devQ = ''; render(); },
  devJump(el) { state.devTab = 'managed'; state.devPlatform = ALL; state.devComp = 'all'; state.devOwner = 'all'; state.devFlag = 'all'; state.devQ = ''; state.devSel = el.dataset.id; render(); },
  confKind(el) { state.confKind = el.dataset.kind; render(); },
  fmt(el) { state.ex.format = el.dataset.fmt; render(); },
  copy(el) {
    const t = el.dataset.text;
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast(T('Kopiert', 'Copied')), () => toast(T('Kopieren nicht möglich – bitte manuell markieren.', 'Copy not possible – please select manually.')));
  },
  async compare(el) {
    const name = el.dataset.name;
    if (state.snap.demo) { const o = demoOlderSnapshot(); setCompare(o, { type: 'demo', at: o.scannedAt }, name); render(); return; }
    try { const s = await api('/api/snapshots/' + encodeURIComponent(name)); setCompare(s, { type: 'snapshot', at: s.scannedAt }, name); render(); } catch (e) { toast(T('Snapshot nicht lesbar: ', 'Snapshot not readable: ') + e.message); }
  },
  async openSnap(el) {
    try {
      const s = await api('/api/snapshots/' + encodeURIComponent(el.dataset.name));
      state.liveSnap = state.liveSnap || (state.viewingSaved ? state.liveSnap : state.snap);
      loadAnalysis(s); state.viewingSaved = fDT(s.scannedAt); clearCompare();
      await loadNotes(); state.view = 'dashboard'; render();
    } catch (e) { toast(T('Snapshot nicht lesbar: ', 'Snapshot not readable: ') + e.message); }
  },
  async backToLive() {
    if (state.liveSnap) { loadAnalysis(state.liveSnap); state.liveSnap = null; }
    state.viewingSaved = null; clearCompare();
    await loadNotes(); render();
  },
  async delSnap(el) {
    if (!confirm(T('Snapshot in den Unterordner „_entfernt“ verschieben?', 'Move snapshot to the “_entfernt” subfolder?'))) return;
    try { await api('/api/snapshots/' + encodeURIComponent(el.dataset.name), { method: 'DELETE' }); if (state.compareName === el.dataset.name) clearCompare(); await refreshSnapshots(); render(); } catch (e) { toast(e.message); }
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
    try {
      state.busy = true; render();
      if (e.format === 'docx' && typeof docx === 'undefined') throw new Error(T('Word-Bibliothek nicht geladen.', 'Word library not loaded.'));
      // Alle Texte in der gewählten Doku-Sprache erzeugen (Analyse und Vergleich werden dafür neu berechnet).
      const job = withLang(exLang(), () => {
        const an = analyze(state.snap);
        const diff = state.compareSnap ? diffSnapshots(state.compareSnap, state.snap) : null;
        const m = X.buildModel(state.snap, an, { sections, areas: e.areas, partner: e.partner, author: e.author, customer: e.customer, notes: state.notes, diff, diffBase: compareLabel() });
        const stem = X.fileStem(m);
        const f = e.format;
        if (f === 'docx') return { promise: X.toDocx(m), name: stem + '.docx' };
        if (f === 'pdf') return { print: X.toHtml(m) };
        if (f === 'html') return { files: [[stem + '.html', X.toHtml(m), 'text/html;charset=utf-8']] };
        if (f === 'md') return { files: [[stem + '.md', X.toMarkdown(m), 'text/markdown;charset=utf-8']] };
        if (f === 'csv-settings') return { files: [[stem + T('_Einstellungen', '_Settings') + '.csv', X.toCsvSettings(m), 'text/csv;charset=utf-8']] };
        if (f === 'csv-assign') return { files: [[stem + T('_Zuweisungen', '_Assignments') + '.csv', X.toCsvAssignments(m), 'text/csv;charset=utf-8']] };
        if (f === 'csv-devices') return { files: [[stem + T('_Geraete', '_Devices') + '.csv', X.toCsvDevices(m), 'text/csv;charset=utf-8']].concat(m.autopilot.length ? [[stem + '_Autopilot.csv', X.toCsvAutopilot(m), 'text/csv;charset=utf-8']] : []) };
        return { files: [[stem + '.json', JSON.stringify(state.snap, null, 2), 'application/json']] };
      });
      if (job.promise) X.download(job.name, await job.promise);
      if (job.print) X.printHtml(job.print);
      (job.files || []).forEach(([n, d, t], i) => setTimeout(() => X.download(n, d, t), i * 400));
      state.busy = false; toast(job.print ? T('Druckdialog geöffnet', 'Print dialog opened') : T('Datei erzeugt', 'File created'));
    } catch (err) {
      state.busy = false; toast(T('Export fehlgeschlagen: ', 'Export failed: ') + err.message);
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
    r.onload = () => {
      try {
        const s = JSON.parse(r.result);
        if (!s || !Array.isArray(s.objects)) throw new Error(T('Keine Intune-Inspector-Snapshot-Datei.', 'Not an Intune Inspector snapshot file.'));
        setCompare(s, { type: 'file', file: f.name, at: s.scannedAt }, 'file:' + f.name);
        render();
      } catch (e) { toast(T('Datei nicht lesbar: ', 'File not readable: ') + e.message); }
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
  const params = new URLSearchParams(location.search);
  if (params.get('lang') === 'de' || params.get('lang') === 'en') setLang(params.get('lang'));
  if (params.has('demo')) { startDemo(); return; }
  if (!state.cfg.clientId) { state.screen = 'setup'; render(); return; }
  try { state.account = await G.initAuth(state.cfg.clientId, lsGet('ii.lastTenant', state.cfg.defaultTenant || '')); } catch (e) { state.account = null; }
  state.screen = 'login';
  render();
})();

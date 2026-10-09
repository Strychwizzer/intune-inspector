// Zweisprachigkeit (Deutsch / Englisch).
//
// T(de, en)  – Oberflächentext: beide Sprachen stehen direkt im Code.
// tv(text)   – Datenbezeichnung: Scanner und Analyse speichern deutsche Bezeichnungen in Snapshots
//              (damit ältere Snapshots und der Vergleich sprachunabhängig bleiben). tv() übersetzt sie
//              beim Anzeigen/Exportieren über das Wörterbuch DATA_EN und einige Muster.

let lang = 'de';

export function detectLang() {
  try { const s = localStorage.getItem('ii.lang'); if (s === 'de' || s === 'en') return s; } catch (e) { /* */ }
  const n = (typeof navigator !== 'undefined' && (navigator.language || '')) || '';
  return /^de/i.test(n) ? 'de' : 'en';
}
export function setLang(l) {
  lang = l === 'en' ? 'en' : 'de';
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
}
export function getLang() { return lang; }
export const isEn = () => lang === 'en';

// Führt fn mit vorübergehend anderer Sprache aus (synchron), z. B. für den Export.
export function withLang(l, fn) {
  const prev = lang;
  setLang(l);
  try { return fn(); } finally { setLang(prev); }
}

export function T(de, en) { return lang === 'en' ? en : de; }

export const locale = () => (lang === 'en' ? 'en-GB' : 'de-DE');
export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d) ? String(iso) : d.toLocaleDateString(locale(), { day: '2-digit', month: '2-digit', year: 'numeric' });
}
export function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d) ? String(iso) : d.toLocaleString(locale(), { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
// Excel erwartet in Deutschland Semikolon, in englischen Umgebungen Komma.
export const csvSep = () => (lang === 'en' ? ',' : ';');

// ---------------------------------------------------------------------------
// Datenbezeichnungen DE → EN
// ---------------------------------------------------------------------------
const DATA_EN = {
  // Bereiche
  'Konfiguration': 'Configuration', 'App-Schutz': 'App protection', 'App-Konfiguration': 'App configuration',
  'Skripte & Remediations': 'Scripts & remediations', 'Plattform-Anbindungen': 'Platform connectors', 'Mandant & Verwaltung': 'Tenant & administration',
  // Allgemein
  'Ja': 'Yes', 'Nein': 'No', 'Aktiviert': 'Enabled', 'Deaktiviert': 'Disabled', 'Alle': 'All', 'Alle Geräte': 'All devices', 'Alle Benutzer': 'All users',
  'Alle Geräte und Benutzer': 'All devices and users', '(ausgeblendet)': '(hidden)', '(verschlüsselt)': '(encrypted)', '(geheimer Wert)': '(secret value)',
  '(ohne Namen)': '(no name)', '(Inhalt nicht lesbar)': '(content not readable)', 'Wert': 'Value', 'Regel': 'Rule', 'Typ': 'Type', 'Status': 'Status',
  'Vorlage': 'Template', 'Technologie': 'Technology', 'Profiltyp': 'Profile type', 'Herausgeber': 'Publisher', 'Version': 'Version', 'Priorität': 'Priority',
  'Standard (0)': 'Default (0)', 'App-Auswahl': 'App selection', 'Integrierte Rolle': 'Built-in role', 'Benutzerdefinierte Rolle': 'Custom role',
  'ADE-Token': 'ADE token', 'Standardprofil': 'Default profile', 'keiner': 'none', 'Berechtigungen': 'Permissions',
  // Zuweisungen
  'Erforderlich': 'Required', 'Verfügbar': 'Available', 'Deinstallieren': 'Uninstall', 'Verfügbar ohne Registrierung': 'Available without enrollment',
  'VPN zugewiesen': 'VPN assigned',
  // Kategorien Konfiguration / Security
  'Datenträgerverschlüsselung': 'Disk encryption', 'Endpunkterkennung und -reaktion (EDR)': 'Endpoint detection and response (EDR)',
  'Verringerung der Angriffsfläche': 'Attack surface reduction', 'Kontoschutz': 'Account protection', 'App-Steuerung': 'App control',
  'Enrollment-Konfiguration': 'Enrollment configuration', 'Unternehmensportal': 'Company Portal', 'Ruhezeiten': 'Quiet time',
  'Windows-Wiederherstellung': 'Windows recovery', 'Update-Ring (Windows)': 'Update ring (Windows)', 'Update-Richtlinie (Apple)': 'Update policy (Apple)',
  'Benutzerdefiniert (OMA-URI / Profil)': 'Custom (OMA-URI / profile)', 'Endpoint Protection (Vorlage)': 'Endpoint protection (template)',
  'Zertifikate': 'Certificates', 'WLAN': 'Wi-Fi', 'E-Mail': 'Email', 'Gerätefunktionen': 'Device features', 'Integritätsüberwachung': 'Health monitoring',
  'Domänenbeitritt (Hybrid)': 'Domain join (hybrid)', 'Edition-Upgrade': 'Edition upgrade', 'Freigegebener PC': 'Shared PC',
  'Übermittlungsoptimierung': 'Delivery optimization', 'Geräteeinschränkungen': 'Device restrictions', 'Erweiterungen': 'Extensions', 'Spezialgeräte': 'Special devices',
  'Administrative Vorlagen': 'Administrative templates', 'Compliance-Richtlinie': 'Compliance policy', 'Compliance (Settings Catalog)': 'Compliance (settings catalog)',
  'Benutzerdefinierte Compliance-Skripte': 'Custom compliance scripts', 'Feature-Updates': 'Feature updates', 'Quality-Updates (beschleunigt)': 'Quality updates (expedited)',
  'Treiber-Updates': 'Driver updates', 'Verwaltete Geräte': 'Managed devices', 'Verwaltete Apps': 'Managed apps', 'App-Schutz iOS/iPadOS': 'App protection iOS/iPadOS',
  'App-Schutz Android': 'App protection Android', 'App-Schutz Windows (Edge)': 'App protection Windows (Edge)', 'PowerShell-Skripte (Windows)': 'PowerShell scripts (Windows)',
  'Shell-Skripte (macOS)': 'Shell scripts (macOS)', 'Benutzerdefinierte Attribute (macOS)': 'Custom attributes (macOS)', 'Autopilot-Profile': 'Autopilot profiles',
  'Android Enterprise-Registrierungsprofile': 'Android Enterprise enrollment profiles', 'Zuweisungsfilter': 'Assignment filters',
  'Bereichsmarkierungen (Scope Tags)': 'Scope tags', 'Intune-Rollen': 'Intune roles', 'Gerätekategorien': 'Device categories', 'Nutzungsbedingungen': 'Terms and conditions',
  'Unternehmensportal-Branding': 'Company Portal branding', 'Benachrichtigungsvorlagen': 'Notification templates', 'Mandanteneinstellungen': 'Tenant settings',
  'Compliance-Einstellungen des Mandanten': 'Tenant compliance settings', 'Apple ADE-Registrierungsprofile': 'Apple ADE enrollment profiles',
  // Enrollment
  'Registrierungseinschränkungen (Plattform)': 'Enrollment restrictions (platform)', 'Registrierungseinschränkungen': 'Enrollment restrictions',
  'Gerätelimit': 'Device limit', 'Entfernen': 'Remove',
  'Geräteeinschränkungen (AOSP)': 'Device restrictions (AOSP)', 'Geräteeinschränkungen (Android Enterprise)': 'Device restrictions (Android Enterprise)', 'Geräteeinschränkungen (Arbeitsprofil)': 'Device restrictions (work profile)', 'Registrierungsbenachrichtigung': 'Enrollment notification',
  // Apps
  'Win32-App': 'Win32 app', 'MSI (Branchen-App)': 'MSI (line-of-business)', 'Microsoft Store (alt)': 'Microsoft Store (legacy)',
  'Microsoft Store für Unternehmen': 'Microsoft Store for Business', 'Volumenlizenz-App (VPP)': 'Volume-purchased app (VPP)', 'Store-App': 'Store app',
  'Branchen-App (LOB)': 'Line-of-business app', 'Store-App (verwaltet)': 'Store app (managed)', 'Branchen-App (verwaltet)': 'Line-of-business app (managed)',
  'Managed Google Play Web-App': 'Managed Google Play web app', 'PKG-App': 'PKG app', 'DMG-App': 'DMG app', 'Web-Link': 'Web link',
  'Installationsverhalten': 'Install behavior', 'Mindest-Betriebssystem': 'Minimum OS', 'Architekturen': 'Architectures', 'Erkennungsregel': 'Detection rule',
  'Anforderungsregel': 'Requirement rule', 'Erkennungsskript': 'Detection script', 'Anforderungsskript': 'Requirement script', 'Korrekturskript': 'Remediation script',
  'Skriptinhalt': 'Script content', 'Ausgeschlossene Office-Apps': 'Excluded Office apps', 'Geschützte Apps': 'Protected apps', 'Ziel-Apps (IDs)': 'Target apps (IDs)',
  'Ziel-Apps': 'Target apps', 'Konfigurations-XML': 'Configuration XML', 'Konfiguration (JSON)': 'Configuration (JSON)', 'Profil-Datei': 'Profile file',
  'Aktion bei Nichtkonformität': 'Action for noncompliance', 'Gilt für': 'Applies to',
  // Plattform-Anbindungen
  'Apple MDM-Push-Zertifikat (APNs)': 'Apple MDM push certificate (APNs)', 'Apple MDM-Push-Zertifikat': 'Apple MDM push certificate',
  'Apple Automated Device Enrollment (ADE-Token)': 'Apple Automated Device Enrollment (ADE token)', 'ADE-Token': 'ADE token',
  'Apple VPP-Token (Apps & Bücher)': 'Apple VPP token (apps & books)', 'Managed Google Play (Android Enterprise)': 'Managed Google Play (Android Enterprise)',
  'Mobile Threat Defense / Defender-Anbindung': 'Mobile Threat Defense / Defender connector', 'Mobile Threat Defense-Partner': 'Mobile Threat Defense partner',
  'Geräteverwaltungs-Partner': 'Device management partner', 'Apple Business Manager': 'Apple Business Manager', 'Apple School Manager': 'Apple School Manager',
  'Apple-ID (für die Verlängerung zwingend dieselbe!)': 'Apple ID (renewal must use the same one!)', 'Apple-ID': 'Apple ID', 'Gültig bis': 'Valid until',
  'Token gültig bis': 'Token valid until', 'Topic-ID': 'Topic ID', 'Seriennummer': 'Serial number', 'Upload-Status': 'Upload status',
  'Letzte erfolgreiche Synchronisierung': 'Last successful sync', 'Synchronisierte Geräte': 'Synced devices', 'Letzter Sync-Fehlercode': 'Last sync error code',
  'Datenfreigabe an Apple erteilt': 'Data sharing with Apple consented', 'Organisation': 'Organization', 'Standort': 'Location', 'Letzte Synchronisierung': 'Last sync',
  'Sync-Status': 'Sync status', 'Apps automatisch aktualisieren': 'Update apps automatically', 'Land/Region': 'Country/region', 'Verbindungsstatus': 'Binding status',
  'Verknüpftes Google-Konto (Besitzer)': 'Linked Google account (owner)', 'Letzte App-Synchronisierung': 'Last app sync',
  'Arbeitsprofil-Registrierung erlaubt für': 'Work profile enrollment allowed for', 'Vollständig verwaltete Geräte erlaubt': 'Fully managed devices allowed',
  'Letztes Lebenszeichen': 'Last heartbeat', 'Android-Geräte verbinden': 'Connect Android devices', 'iOS-Geräte verbinden': 'Connect iOS devices',
  'Windows-Geräte verbinden': 'Connect Windows devices', 'macOS-Geräte verbinden': 'Connect macOS devices', 'Geräte ohne Unterstützung blockieren': 'Block unsupported devices',
  'Gültig': 'Valid', 'Abgelaufen': 'Expired', 'Ungültig': 'Invalid', 'Anderem MDM zugeordnet': 'Assigned to another MDM', 'Doppelte Standort-ID': 'Duplicate location ID',
  'Nicht verbunden': 'Not bound', 'Verbunden': 'Bound', 'Verbunden und geprüft': 'Bound and validated', 'Wird getrennt': 'Unbinding',
  'Nicht verfügbar': 'Unavailable', 'Aktiv': 'Enabled', 'Antwortet nicht': 'Unresponsive', 'Nicht eingerichtet': 'Not set up', 'Fehler': 'Error',
  // Geräte
  'Firma': 'Corporate', 'Privat': 'Personal', 'Unbekannt': 'Unknown', 'Konform': 'Compliant', 'Nicht konform': 'Noncompliant', 'Kulanzzeitraum': 'In grace period',
  'Konflikt': 'Conflict', 'Benutzerregistrierung': 'User enrollment', 'Geräteregistrierungs-Manager (DEM)': 'Device enrollment manager (DEM)',
  'Apple ADE mit Benutzer': 'Apple ADE with user', 'Apple ADE ohne Benutzer': 'Apple ADE without user', 'Entra Join': 'Entra join', 'Windows Bulk (Paket)': 'Windows bulk (package)',
  'Automatische Registrierung': 'Automatic enrollment', 'Windows Bulk Entra Join': 'Windows bulk Entra join',
  'Entra Join (Geräteauth., z. B. Autopilot Self-Deploying)': 'Entra join (device auth, e.g. Autopilot self-deploying)', 'Apple Benutzerregistrierung': 'Apple user enrollment',
  'Apple Benutzerregistrierung (Dienstkonto)': 'Apple user enrollment (service account)', 'Entra Join (Azure-VM)': 'Entra join (Azure VM)',
  'Android Enterprise – dediziert': 'Android Enterprise – dedicated', 'Android Enterprise – vollständig verwaltet': 'Android Enterprise – fully managed',
  'Android Enterprise – Firmen-Arbeitsprofil': 'Android Enterprise – corporate work profile', 'Android AOSP – benutzerzugeordnet': 'Android AOSP – user-associated',
  'Android AOSP – ohne Benutzer': 'Android AOSP – userless', 'Apple ADE (Unternehmensportal)': 'Apple ADE (Company Portal)', 'Apple ADE (Setup-Assistent)': 'Apple ADE (Setup Assistant)',
  'Apple ADE (moderne Authentifizierung)': 'Apple ADE (modern authentication)', 'Entra registriert': 'Entra registered', 'Hybrid Entra Join': 'Hybrid Entra join',
  'Intune-Agent (PC)': 'Intune agent (PC)', 'Co-Management + EAS': 'Co-management + EAS', 'Co-Management': 'Co-management',
  'Defender for Endpoint (Sicherheitsverwaltung)': 'Defender for Endpoint (security management)', 'Microsoft 365 verwaltet': 'Microsoft 365 managed',
  'Verwaltet': 'Managed', 'Abkoppeln ausstehend': 'Retire pending', 'Abkoppeln fehlgeschlagen': 'Retire failed', 'Zurücksetzen ausstehend': 'Wipe pending',
  'Zurücksetzen fehlgeschlagen': 'Wipe failed', 'Fehlerhaft': 'Unhealthy', 'Löschen ausstehend': 'Delete pending', 'Erkannt': 'Discovered',
  'Registriert': 'Enrolled', 'Noch nicht gestartet': 'Not contacted', 'Fehlgeschlagen': 'Failed', 'Blockiert': 'Blocked', 'Zugewiesen': 'Assigned',
  'Zugewiesen (nicht synchron)': 'Assigned (out of sync)', 'Kein Profil': 'No profile', 'Ausstehend': 'Pending', '(ohne Group Tag)': '(no group tag)',
  // Snapshot-Vergleich (Art)
  'Neu': 'New', 'Geändert': 'Changed', 'Zuweisung': 'Assignment', 'Entfernt': 'Removed',
  // Scanner-Quellen
  'Settings Catalog, Endpoint Security & Baselines': 'Settings catalog, endpoint security & baselines', 'Konfigurationsprofile, Custom & Update-Ringe': 'Configuration profiles, custom & update rings',
  'Administrative Vorlagen (ADMX)': 'Administrative templates (ADMX)', 'Endpoint Security & Baselines (ältere Vorlagen)': 'Endpoint security & baselines (legacy templates)',
  'Compliance-Richtlinien': 'Compliance policies', 'Compliance-Skripte': 'Compliance scripts', 'Quality-Updates': 'Quality updates', 'Apps (zugewiesen)': 'Apps (assigned)',
  'App-Schutz Windows': 'App protection Windows', 'App-Konfiguration (Geräte)': 'App configuration (devices)', 'App-Konfiguration (Apps)': 'App configuration (apps)',
  'PowerShell-Skripte': 'PowerShell scripts', 'Registrierung (ESP, Einschränkungen, Windows Hello)': 'Enrollment (ESP, restrictions, Windows Hello)',
  'Apple ADE-Token & Registrierungsprofile': 'Apple ADE tokens & enrollment profiles', 'Apple VPP-Token': 'Apple VPP tokens',
  'Mobile Threat Defense / Defender for Endpoint': 'Mobile Threat Defense / Defender for Endpoint', 'Geräteverwaltungs-Partner (z. B. Jamf)': 'Device management partners (e.g. Jamf)',
  'Geräteinventar (Windows, iOS, Android, macOS)': 'Device inventory (Windows, iOS, Android, macOS)', 'Autopilot-Geräte': 'Autopilot devices',
  'Gruppen, Filter und Bereichsmarkierungen auflösen': 'Resolving groups, filters and scope tags', 'Mandant': 'Tenant', 'Snapshot': 'Snapshot', 'Demo': 'Demo',
  'Keine Berechtigung (403) – fehlende Graph-Berechtigung oder Intune-Rolle.': 'Access denied (403) – missing Graph permission or Intune role.',
  'Beispieldaten – kein echter Mandant.': 'Sample data – not a real tenant.'
};

const PATTERNS_EN = [
  [/^(\d+) Einträge$/, '$1 entries'],
  [/^\(Binärdaten, (\d+) Zeichen\)$/, '(binary data, $1 characters)'],
  [/^Vorlage: (.*)$/, 'Template: $1'],
  [/^täglich \(alle (\d+) Tage\)(.*)$/, 'daily (every $1 days)$2'],
  [/^täglich(.*)$/, 'daily$1'],
  [/^alle (\d+) Std\.$/, 'every $1 h'],
  [/^einmalig (.*)$/, 'once $1'],
  [/^Benachrichtigungen: (.*)$/, 'Notifications: $1'],
  [/^Stichtag (.*)$/, 'Deadline $1'],
  [/^(.+) nach (\d+) Tag\(en\)$/, '$1 after $2 day(s)'],
  [/^(.+) nach (\d+) Std\.$/, '$1 after $2 h'],
  [/^(.+) sofort$/, '$1 immediately'],
  [/^Berechtigungen \((\d+)\)$/, 'Permissions ($1)'],
  [/^(\d+) \(integriert\)$/, '$1 (built-in)'],
  [/^Nachricht \((.+)\) – Standard$/, 'Message ($1) – default'],
  [/^Nachricht \((.+)\)$/, 'Message ($1)'],
  [/^Zuweisung „(.*)“$/, 'Assignment “$1”'],
  [/^Mitglieder: (.*)$/, (m, a) => 'Members: ' + a],
  [/^Bereich: (.*)$/, (m, a) => 'Scope: ' + tv(a)],
  [/^Gruppe (.*)$/, 'Group $1'],
  [/^\(gelöschte Gruppe (.*)\)$/, '(deleted group $1)'],
  [/^ConfigMgr-Sammlung (.*)$/, 'ConfigMgr collection $1'],
  [/^Benutzer( › .*)?$/, (m, a) => 'User' + (a || '')],
  [/^Computer( › .*)?$/, (m, a) => 'Computer' + (a || '')],
  [/^(\d{2})\.(\d{2})\.(\d{4})(?:, (\d{2}:\d{2}))?$/, (m, d, mo, y, hm) => d + '/' + mo + '/' + y + (hm ? ' ' + hm : '')],
  [/^In diesem Mandanten nicht verfügbar oder nicht lizenziert \((\d+)\)\.$/, 'Not available or not licensed in this tenant ($1).'],
  [/^(\d+) Objekt\(e\) ohne vollständige Details\.$/, '$1 object(s) without complete details.'],
  [/^Aufbereitung fehlgeschlagen für „(.*)“: (.*)$/, 'Processing failed for “$1”: $2'],
  [/^Konnte nicht lokal gespeichert werden: (.*)$/, 'Could not be saved locally: $1']
];

export function tv(s) {
  if (lang === 'de' || s === null || s === undefined) return s;
  const str = String(s);
  if (Object.prototype.hasOwnProperty.call(DATA_EN, str)) return DATA_EN[str];
  if (str.includes(' · ')) return str.split(' · ').map(tv).join(' · ');
  // Zusammengesetzte Werte aus fmtValue(), z. B. „Eula Hidden: Ja; User Type: standard“
  if (/: (Ja|Nein|\(ausgeblendet\))(;|\s\||$)/.test(str)) return str.replace(/: Ja(?=;|\s\||$)/g, ': Yes').replace(/: Nein(?=;|\s\||$)/g, ': No').replace(/: \(ausgeblendet\)/g, ': (hidden)');
  for (const [re, rep] of PATTERNS_EN) if (re.test(str)) return str.replace(re, rep);
  return str;
}

// Objektname: Kundennamen bleiben unverändert, nur vom Tool selbst vergebene Namen werden übersetzt.
const SYSTEM_NAMED = new Set(['tenantsettings', 'apns', 'mgp', 'mtd']);
export const objName = (o) => (o && SYSTEM_NAMED.has(o.sourceKey) ? tv(o.name) : (o ? o.name : ''));

// Für Tests: Anzahl der hinterlegten Übersetzungen
export const dataEntryCount = () => Object.keys(DATA_EN).length;

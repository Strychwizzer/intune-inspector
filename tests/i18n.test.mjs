// Prüft die englische Ausgabe auf übrig gebliebene deutsche Texte.
// Objekt-, Gruppen- und Gerätenamen aus dem Demo-Mandanten (Kundendaten) sind bewusst deutsch und werden ausgenommen.
const { setLang, tv, withLang, T } = await import('../web/js/i18n.js');
const { demoSnapshot, demoOlderSnapshot } = await import('../web/js/demo.js');
const { analyze, diffSnapshots } = await import('../web/js/analyze.js');
const X = await import('../web/js/export.js');
const assert = (await import('node:assert/strict')).default;

const snap = demoSnapshot();
const old = demoOlderSnapshot();

function render(lang) {
  return withLang(lang, () => {
    const an = analyze(snap);
    const diff = diffSnapshots(old, snap);
    const m = X.buildModel(snap, an, { sections: new Set(X.SECTIONS.map((s) => s.key)), notes: {}, diff, diffBase: 'X' });
    return { md: X.toMarkdown(m), html: X.toHtml(m), csv: X.toCsvSettings(m) + X.toCsvAssignments(m) + X.toCsvDevices(m) + X.toCsvAutopilot(m), an, sections: X.SECTIONS.map((s) => s.label()) };
  });
}

const en = render('en');
const de = render('de');

// Alles, was aus Kundendaten stammt, vor der Prüfung entfernen
let text = en.md + '\n' + en.csv;
const dataNames = new Set();
for (const o of snap.objects) { dataNames.add(o.name); if (o.description) dataNames.add(o.description); }
for (const d of snap.devices) { dataNames.add(d.name); dataNames.add(d.userName); dataNames.add(d.model); }
for (const a of snap.autopilot) { dataNames.add(a.groupTag); dataNames.add(a.displayName); }
for (const o of snap.objects) for (const a of o.assignments) dataNames.add(a.label);
dataNames.add(snap.tenant.displayName);
for (const n of [...dataNames].filter(Boolean).sort((a, b) => b.length - a.length)) text = text.split(n).join('<DATA>');

const GERMAN = /[äöüÄÖÜß]|\b(und|oder|nicht|mit|ohne|für|der|die|das|des|von|Einstellung\w*|Zuweisung\w*|Gerät\w*|Bereich\w*|Objekt\w*|Richtlinie\w*|Ja|Nein|Seite|Inhalt|Erstellt|Geändert|Stand|Mandant\w*|Benutzer|Firma|Privat|Aktiviert|Deaktiviert|Zertifikat\w*|Gültig|Konform\w*|Registr\w*|Verwalt\w*|Hinweis\w*)\b/;
const leftovers = new Set();
for (const line of text.split('\n')) {
  for (const cell of line.split(/[|,;]/)) {
    const c = cell.trim();
    if (c && GERMAN.test(c) && !c.includes('<DATA>')) leftovers.add(c.slice(0, 120));
  }
}
if (leftovers.size) console.log('Mögliche deutsche Reste in EN:\n - ' + [...leftovers].slice(0, 60).join('\n - '));
assert.equal(leftovers.size, 0, 'Englische Ausgabe enthält noch deutsche Texte');

// Stichproben
assert.ok(en.an.findings.some((f) => /push certificate expires in/.test(f.title)), 'EN-Befund APNs');
assert.ok(de.an.findings.some((f) => /Push-Zertifikat läuft in/.test(f.title)), 'DE-Befund APNs');
assert.equal(withLang('en', () => tv('Skripte & Remediations')), 'Scripts & remediations');
assert.equal(withLang('en', () => tv('täglich 12:00 · Benachrichtigungen: hideAll')), 'daily 12:00 · Notifications: hideAll');
assert.equal(withLang('en', () => tv('Block nach 3 Tag(en)')), 'Block after 3 day(s)');
assert.equal(withLang('en', () => tv('Mitglieder: GRP-IT · Bereich: Alle Geräte')), 'Members: GRP-IT · Scope: All devices');
assert.equal(withLang('de', () => tv('Skripte & Remediations')), 'Skripte & Remediations');
assert.ok(en.html.startsWith('<!doctype html><html lang="en">'));
assert.ok(en.csv.includes(',') && de.csv.includes(';'), 'CSV-Trennzeichen je Sprache');
assert.ok(en.sections.every((l) => !/[äöüß]/.test(l)), 'Abschnittsnamen EN');
setLang('de');
console.log('\nOK – Zweisprachigkeit geprüft (' + en.md.length + ' Zeichen EN, ' + de.md.length + ' Zeichen DE)');

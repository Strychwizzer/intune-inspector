"""Erzeugt die Beispiel-Screenshots für die Dokumentation aus dem Demo-Modus.

Voraussetzung: Intune Inspector läuft auf http://localhost:8400 mit einem leeren Datenordner,
Python-Paket playwright inkl. Chromium ist installiert.
Aufruf:  python tools/screenshots.py docs/screenshots
"""
import sys
from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else 'docs/screenshots'
BASE = 'http://localhost:8400'
W, H = 1440, 900


def shot(pg, name, full=False):
    pg.wait_for_timeout(350)
    pg.screenshot(path=f'{OUT}/{name}.png', full_page=full)
    print('ok', name)


with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1, color_scheme='dark')
    pg = ctx.new_page()
    errors = []
    pg.on('pageerror', lambda e: errors.append(str(e)))

    pg.goto(BASE + '/'); pg.wait_for_timeout(900)
    shot(pg, '01-einrichtung', full=True)

    pg.fill('#cfgClient', '3f1c2a7e-8b4d-4e21-9c55-2d7a0b6e91f4')
    pg.click('[data-act=saveSetup]'); pg.wait_for_timeout(500)
    pg.fill('#loginTenant', 'kunde.onmicrosoft.com')
    shot(pg, '02-anmeldung')

    pg.goto(BASE + '/?demo'); pg.wait_for_timeout(800)
    shot(pg, '03-uebersicht', full=True)

    pg.click('[data-act=nav][data-view=devices]')
    shot(pg, '04-geraete', full=True)
    pg.click('[data-act=devPlatform][data-p=Windows] >> nth=0')
    pg.click('[data-act=devSelect] >> nth=4')
    shot(pg, '05-geraete-windows')
    pg.click('[data-act=devTab][data-tab=autopilot]')
    shot(pg, '06-autopilot')

    pg.click('[data-act=nav][data-view=objects]')
    pg.fill('#q', 'bitlocker'); pg.wait_for_timeout(500)
    pg.click('text=WIN – BitLocker Basis')
    shot(pg, '07-objekte-suche')
    pg.fill('#q', ''); pg.wait_for_timeout(400)
    pg.click('[data-act=area][data-area="Skripte & Remediations"]')
    pg.click('text=Remediation – Temp bereinigen')
    pg.click('details.code summary >> nth=0')
    shot(pg, '08-objekt-skript')

    pg.click('[data-act=nav][data-view=targets]')
    pg.click('[data-act=target] >> nth=2')
    shot(pg, '09-zuweisungen')

    pg.click('[data-act=nav][data-view=conflicts]')
    shot(pg, '10-konflikte')

    pg.click('[data-act=nav][data-view=snapshots]')
    pg.click('[data-act=compare]')
    shot(pg, '11-snapshot-vergleich')

    pg.click('[data-act=nav][data-view=export]')
    pg.fill('#exPartner', 'Muster IT-Partner GmbH')
    pg.fill('#exAuthor', 'Max Mustermann')
    pg.wait_for_timeout(300)
    shot(pg, '12-export', full=True)

    pg.click('[data-act=fmt][data-fmt=docx]')
    with pg.expect_download() as dl:
        pg.click('[data-act=doExport]')
    dl.value.save_as(f'{OUT}/../beispiel/Beispiel-Dokumentation.docx')
    pg.click('[data-act=fmt][data-fmt=html]')
    with pg.expect_download() as dl:
        pg.click('[data-act=doExport]')
    dl.value.save_as(f'{OUT}/../beispiel/Beispiel-Dokumentation.html')
    pg.click('[data-act=fmt][data-fmt=md]')
    with pg.expect_download() as dl:
        pg.click('[data-act=doExport]')
    dl.value.save_as(f'{OUT}/../beispiel/Beispiel-Dokumentation.md')

    pg.click('[data-act=theme]')
    pg.click('[data-act=nav][data-view=dashboard]')
    shot(pg, '13-helles-design')

    pg.wait_for_timeout(3600)
    pg.set_viewport_size({'width': 390, 'height': 844})
    pg.click('[data-act=nav][data-view=devices]')
    shot(pg, '14-mobil')
    b.close()
    print('Fehler:', errors or 'keine')

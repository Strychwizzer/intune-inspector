"""Rendert tools/social-preview.html nach docs/social-preview.png (1280x640, für GitHub „Social preview“)."""
import pathlib
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parent.parent
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1280, 'height': 640})
    pg.goto((root / 'tools' / 'social-preview.html').as_uri())
    pg.wait_for_timeout(600)
    pg.screenshot(path=str(root / 'docs' / 'social-preview.png'))
    b.close()
print('docs/social-preview.png')

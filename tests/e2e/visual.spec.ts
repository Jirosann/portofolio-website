import path from 'node:path';
import { test, expect, THEMES, scrollThrough, gotoHome } from './fixtures';

// Baseline hanya valid di Linux (font dan rendering berbeda per OS). Buat dan jalankan lewat
// `npm run test:e2e:update` / `npm run test:e2e:docker`, image yang sama dengan CI.
test.skip(process.platform !== 'linux', 'regresi visual hanya di Linux (pakai npm run test:e2e:docker)');

// Matikan animasi scroll (.reveal) dan transisi agar tangkapan deterministik.
test.use({ reducedMotion: 'reduce' });

const TARGETS = [
  { name: 'hero', selector: 'main > section:first-of-type' },
  { name: 'about', selector: '#about' },
  { name: 'projects', selector: '#projects' },
  { name: 'experience', selector: '#experience' },
  { name: 'skills', selector: '#skills' },
  { name: 'contact', selector: '#contact' },
  { name: 'footer', selector: 'footer' },
];

// visual.css menyembunyikan header sticky agar tidak menimpa section. Tahun di footer berubah tiap Januari, jadi di-mask.
const STYLE_PATH = path.join(__dirname, 'visual.css');

for (const width of [390, 1440])
  for (const theme of THEMES)
    test(`section ${width}px ${theme}`, async ({ page, setup }) => {
      await setup({ width, theme });
      await gotoHome(page);
      await scrollThrough(page);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));

      for (const { name, selector } of TARGETS) {
        const target = page.locator(selector);
        await expect.soft(target).toHaveScreenshot(`${name}-${width}-${theme}.png`, {
          stylePath: STYLE_PATH,
          mask: [page.locator('footer').getByText(/^© \d{4}$/)],
        });
      }
    });

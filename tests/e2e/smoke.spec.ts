import type { Page } from '@playwright/test';
import { test, expect, WIDTHS, THEMES, LANGS, PROJECT_SLUGS, scrollThrough, gotoHome } from './fixtures';

async function expectHealthyPage(page: Page) {
  await scrollThrough(page);

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth, 'scroll horizontal').toBeLessThanOrEqual(overflow.clientWidth);

  // Gambar lazy dipaksa termuat; img yang disembunyikan CSS (varian tema lain) tetap harus valid.
  const broken = await page.evaluate(async () => {
    const imgs = Array.from(document.images);
    imgs.forEach((img) => (img.loading = 'eager'));
    await Promise.all(imgs.map((img) => (img.complete ? null : img.decode().catch(() => null))));
    return imgs.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.currentSrc || img.src);
  });
  expect(broken, 'gambar gagal dimuat').toEqual([]);
}

test.describe('smoke: halaman utama', () => {
  for (const width of WIDTHS)
    for (const theme of THEMES)
      for (const lang of LANGS) {
        test(`${width}px ${theme} ${lang}`, async ({ page, setup, problems }) => {
          await setup({ width, theme, lang });
          await gotoHome(page);
          await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
          await expect(page.locator('html')).toHaveAttribute('lang', lang);
          await expectHealthyPage(page);
          expect(problems.console, 'error console').toEqual([]);
          expect(problems.requests, 'request gagal').toEqual([]);
        });
      }
});

test.describe('smoke: halaman lain', () => {
  for (const width of [390, 1440])
    for (const slug of PROJECT_SLUGS) {
      test(`/projects/${slug} ${width}px`, async ({ page, setup, problems }) => {
        await setup({ width });
        const res = await page.goto(`/projects/${slug}`);
        expect(res?.status()).toBe(200);
        await expectHealthyPage(page);
        expect(problems.console).toEqual([]);
        expect(problems.requests).toEqual([]);
      });
    }

  for (const width of [390, 1440])
    test(`404 ${width}px`, async ({ page, setup, problems }) => {
      await setup({ width });
      const res = await page.goto('/halaman-yang-tidak-ada');
      expect(res?.status()).toBe(404);
      await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
      await expectHealthyPage(page);
      // Status 404 dokumen memang diharapkan; Chromium juga mencatatnya sebagai error console.
      const notDoc = (s: string) => !s.includes('/halaman-yang-tidak-ada') && !/status of 404/.test(s);
      expect(problems.console.filter(notDoc)).toEqual([]);
      expect(problems.requests.filter(notDoc)).toEqual([]);
    });
});

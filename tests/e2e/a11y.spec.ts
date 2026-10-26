import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';
import { test, expect, THEMES, LANGS, PROJECT_SLUGS, scrollThrough, gotoHome, visible } from './fixtures';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// @axe-core/playwright membaca tipe dari playwright-core di root (1.57, ditarik @mermaid-js/mermaid-cli),
// bukan 1.64 milik @playwright/test. API yang dipakai sama; hanya tipenya yang tidak cocok.
type AxePage = ConstructorParameters<typeof AxeBuilder>[0]['page'];

/**
 * KNOWN-ISSUE: pelanggaran yang sudah dilaporkan tapi belum diperbaiki (docs/audit/qa-sesi-14.md).
 * Dikecualikan per halaman + rule + target, jadi pelanggaran baru tetap gagal. Begitu diperbaiki,
 * tes gagal dengan pesan "hapus dari KNOWN_ISSUES" supaya daftar ini tidak basi.
 */
const KNOWN_ISSUES = [
  // aria-label "Repository for <judul> (opens in new tab)" tidak memuat teks terlihat "View Repository" (WCAG 2.5.3).
  { path: '/projects/clash-of-bang', rule: 'label-content-name-mismatch', target: '#project-repo-link' },
  { path: '/projects/faceattend', rule: 'label-content-name-mismatch', target: '#project-repo-link' },
];

async function expectNoSeriousViolations(page: Page, testInfo: TestInfo, include?: string) {
  let builder = new AxeBuilder({ page: page as unknown as AxePage }).withTags(TAGS);
  if (include) builder = builder.include(include);
  const results = await builder.analyze();
  const path = new URL(page.url()).pathname;
  const known = KNOWN_ISSUES.filter((k) => k.path === path);

  const found = results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .flatMap((v) => v.nodes.map((n) => ({ rule: v.id, impact: v.impact, target: n.target.join(' '), html: n.html, summary: n.failureSummary })));
  const same = (a: { rule: string; target: string }, b: { rule: string; target: string }) =>
    a.rule === b.rule && a.target === b.target;

  for (const k of known)
    if (found.some((f) => same(f, k))) testInfo.annotations.push({ type: 'known-issue', description: `${k.rule} ${k.target}` });

  const unexpected = found.filter((f) => !known.some((k) => same(f, k)));
  if (unexpected.length)
    await testInfo.attach('axe-violations.json', { body: JSON.stringify(unexpected, null, 2), contentType: 'application/json' });
  expect(unexpected.map((f) => `${f.impact} ${f.rule}: ${f.target}`)).toEqual([]);

  // Hanya berlaku untuk pemindaian seluruh halaman; pemindaian terbatas (include) bisa tidak mencakup target.
  if (!include) {
    const fixed = known.filter((k) => !found.some((f) => same(f, k)));
    expect(fixed.map((k) => `sudah diperbaiki, hapus dari KNOWN_ISSUES: ${k.rule} ${k.target}`)).toEqual([]);
  }
}

test.describe('axe: halaman utama', () => {
  for (const width of [390, 1440])
    for (const theme of THEMES)
      for (const lang of LANGS)
        test(`${width}px ${theme} ${lang}`, async ({ page, setup }, testInfo) => {
          await setup({ width, theme, lang });
          await gotoHome(page);
          // Pastikan gambar dan animasi scroll sudah dalam kondisi akhir sebelum kontras dihitung.
          await scrollThrough(page);
          await expectNoSeriousViolations(page, testInfo);
        });
});

test.describe('axe: halaman lain', () => {
  for (const slug of PROJECT_SLUGS)
    test(`/projects/${slug}`, async ({ page, setup }, testInfo) => {
      await setup({ width: 1440 });
      await page.goto(`/projects/${slug}`);
      await expectNoSeriousViolations(page, testInfo);
    });

  test('404', async ({ page, setup }, testInfo) => {
    await setup({ width: 390 });
    await page.goto('/halaman-yang-tidak-ada');
    await expectNoSeriousViolations(page, testInfo);
    await page.getByRole('button', { name: 'Play' }).click();
    await expect(page.getByText('Headline 1 of 5')).toBeVisible();
    await expectNoSeriousViolations(page, testInfo);
  });
});

test.describe('axe: kondisi interaktif', () => {
  for (const theme of THEMES) {
    test(`menu mobile terbuka ${theme}`, async ({ page, setup }, testInfo) => {
      await setup({ width: 390, theme });
      await gotoHome(page);
      await page.getByRole('button', { name: 'Open menu' }).click();
      await expect(page.locator('#mobile-menu')).toBeVisible();
      await expectNoSeriousViolations(page, testInfo);
    });

    test(`menu bahasa terbuka ${theme}`, async ({ page, setup }, testInfo) => {
      await setup({ width: 1440, theme });
      await gotoHome(page);
      await visible(page.getByRole('button', { name: /Change language/ })).click();
      await expect(visible(page.getByRole('menuitemradio', { name: 'Indonesia' }))).toBeVisible();
      await expectNoSeriousViolations(page, testInfo, 'header');
    });

    test(`Try the model dan kartu stack terbuka ${theme}`, async ({ page, setup }, testInfo) => {
      await setup({ width: 1440, theme });
      await gotoHome(page);
      const model = page.waitForResponse('**/models/fake-news/model.json');
      await page.getByRole('button', { name: /Try the model/ }).click();
      await model;
      await page.getByRole('button', { name: 'Real 1' }).click();
      await expect(page.locator('#try-model-fake-news [aria-live="polite"]')).toContainText('Prediction:');
      await page.locator('button.sc-btn').first().click();
      await expect(page.locator('li.sc[data-flipped]')).toHaveCount(1);
      await expectNoSeriousViolations(page, testInfo, 'main');
    });
  }
});

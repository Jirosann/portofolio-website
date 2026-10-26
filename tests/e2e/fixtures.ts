import { test as base, expect, type Locator, type Page } from '@playwright/test';

export type Theme = 'dark' | 'light';
export type Lang = 'en' | 'id';

export const WIDTHS = [320, 390, 768, 1024, 1440] as const;
export const THEMES: Theme[] = ['dark', 'light'];
export const LANGS: Lang[] = ['en', 'id'];

/** Section di halaman utama, sesuai urutan render (src/app/page.tsx). Hero tidak punya id. */
export const SECTIONS = ['about', 'projects', 'experience', 'skills', 'contact'] as const;
export const PROJECT_SLUGS = ['clash-of-bang', 'faceattend', 'kasirai'] as const;

/** scroll-margin-top dari globals.css: nav-offset + nav-clearance. */
export const scrollMarginFor = (width: number) => (width >= 1024 ? 88 : 80);

type Problems = { console: string[]; requests: string[] };

type Fixtures = {
  /** Set viewport, tema (localStorage `theme`) dan bahasa (cookie `NEXT_LOCALE`) sebelum navigasi. */
  setup: (opts: { width: number; height?: number; theme?: Theme; lang?: Lang }) => Promise<void>;
  /** Error console, request gagal dan respons >= 400 selama tes. */
  problems: Problems;
};

export const test = base.extend<Fixtures>({
  setup: async ({ page, context, baseURL }, use) => {
    await use(async ({ width, height = 900, theme, lang = 'en' }) => {
      await page.setViewportSize({ width, height });
      await context.addCookies([{ name: 'NEXT_LOCALE', value: lang, url: baseURL! }]);
      // Tanpa `theme`, situs memakai default (gelap) dan pilihan pengguna bertahan antar-reload.
      if (theme)
        await context.addInitScript((t) => {
          try {
            localStorage.setItem('theme', t);
          } catch {}
        }, theme);
    });
  },
  problems: async ({ page }, use) => {
    const problems: Problems = { console: [], requests: [] };
    page.on('console', (msg) => {
      if (msg.type() === 'error') problems.console.push(msg.text());
    });
    page.on('pageerror', (err) => problems.console.push(`pageerror: ${err.message}`));
    page.on('requestfailed', (req) => {
      const reason = req.failure()?.errorText ?? '';
      // Navigasi yang dibatalkan (mis. prefetch RSC saat pindah halaman) bukan kegagalan.
      if (reason.includes('ERR_ABORTED')) return;
      problems.requests.push(`${req.method()} ${req.url()} ${reason}`);
    });
    page.on('response', (res) => {
      if (res.status() >= 400) problems.requests.push(`${res.status()} ${res.url()}`);
    });
    await use(problems);
  },
});

export { expect };

/** Kontrol yang dirender dua kali (desktop dan mobile): ambil yang terlihat. */
export const visible = (locator: Locator) => locator.locator('visible=true').first();

/** Tunggu sampai scroll berhenti: tidak ada perubahan scrollY selama beberapa frame. */
export async function waitForScrollEnd(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let last = window.scrollY;
        let still = 0;
        const tick = () => {
          if (Math.abs(window.scrollY - last) < 0.5) still++;
          else still = 0;
          last = window.scrollY;
          if (still >= 10) resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
  );
}

/** Scroll bertahap ke bawah agar gambar lazy dan animasi scroll ikut termuat, lalu kembali ke atas. */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 120));
  });
}

/** Buka halaman dan tunggu hidrasi (StackCards mengaktifkan tombol setelah mount). */
export async function gotoHome(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('load');
  await expect(page.locator('button.sc-btn').first()).toBeEnabled();
  await page.evaluate(() => document.fonts.ready);
}

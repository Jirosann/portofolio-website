import { lookup } from 'node:dns/promises';
import type { APIRequestContext, Page } from '@playwright/test';
import { test, expect, PROJECT_SLUGS, type Lang } from './fixtures';

const PAGES = ['/', ...PROJECT_SLUGS.map((s) => `/projects/${s}`), '/halaman-yang-tidak-ada'];

/** Host yang memblokir bot (LinkedIn membalas 999). Dicatat sebagai peringatan, bukan kegagalan. */
const BOT_BLOCKING_HOSTS = ['linkedin.com'];
const BOT_BLOCK_STATUSES = [403, 429, 999];

type Link = { href: string; from: string };

async function collectLinks(page: Page, lang: Lang, baseURL: string): Promise<Link[]> {
  await page.context().addCookies([{ name: 'NEXT_LOCALE', value: lang, url: baseURL }]);
  const links: Link[] = [];
  for (const path of PAGES) {
    await page.goto(path);
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => (a as HTMLAnchorElement).href));
    links.push(...hrefs.map((href) => ({ href, from: `${path} (${lang})` })));
  }
  return links;
}

async function status(request: APIRequestContext, url: string) {
  const opts = { timeout: 10_000, maxRedirects: 5, failOnStatusCode: false };
  try {
    const head = await request.head(url, opts);
    // Beberapa server menolak HEAD; ulangi dengan GET.
    if (head.status() < 400) return head.status();
  } catch {}
  return (await request.get(url, opts)).status();
}

test.describe('tautan', () => {
  let links: Link[] = [];

  test.beforeAll(async ({ browser, baseURL }) => {
    const page = await browser.newPage();
    for (const lang of ['en', 'id'] as const) links.push(...(await collectLinks(page, lang, baseURL!)));
    await page.close();
    // Satu entri per URL tanpa fragmen; fragmen dicek terpisah.
    const seen = new Set<string>();
    links = links.filter((l) => {
      const key = l.href;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });

  test('tautan internal membalas 2xx/3xx dan anchor ada', async ({ page, request, baseURL }) => {
    const origin = new URL(baseURL!).origin;
    const internal = links.filter((l) => l.href.startsWith(origin));
    expect(internal.length).toBeGreaterThan(5);

    const bad: string[] = [];
    const checked = new Set<string>();
    for (const { href, from } of internal) {
      const url = new URL(href);
      const path = url.pathname + url.search;
      if (!checked.has(path)) {
        checked.add(path);
        const res = await request.get(href, { maxRedirects: 0, failOnStatusCode: false });
        if (res.status() >= 400) bad.push(`${res.status()} ${href} (dari ${from})`);
      }
      if (url.hash.length > 1) {
        await page.goto(path);
        const id = decodeURIComponent(url.hash.slice(1));
        if ((await page.locator(`[id="${id}"]`).count()) === 0) bad.push(`anchor hilang ${href} (dari ${from})`);
      }
    }
    expect(bad).toEqual([]);
  });

  test('tautan eksternal membalas 2xx/3xx', async ({ request, baseURL }) => {
    test.skip(!!process.env.E2E_SKIP_EXTERNAL, 'E2E_SKIP_EXTERNAL diset');
    const online = await lookup('github.com').then(
      () => true,
      () => false,
    );
    test.skip(!online, 'offline: tautan eksternal dilewati');
    test.setTimeout(180_000);

    const origin = new URL(baseURL!).origin;
    const external = links.filter((l) => /^https?:/.test(l.href) && !l.href.startsWith(origin));
    const unique = [...new Map(external.map((l) => [l.href.split('#')[0], l])).values()];
    expect(unique.length).toBeGreaterThan(0);

    const bad: string[] = [];
    for (const { href, from } of unique) {
      let code: number;
      try {
        code = await status(request, href);
      } catch (err) {
        bad.push(`ERR ${href} (dari ${from}): ${(err as Error).message.split('\n')[0]}`);
        continue;
      }
      if (code < 400) continue;
      const host = new URL(href).hostname;
      if (BOT_BLOCKING_HOSTS.some((h) => host === h || host.endsWith(`.${h}`)) && BOT_BLOCK_STATUSES.includes(code)) {
        test.info().annotations.push({ type: 'warning', description: `${code} ${href} (host memblokir bot)` });
        continue;
      }
      bad.push(`${code} ${href} (dari ${from})`);
    }
    expect(bad).toEqual([]);
  });
});

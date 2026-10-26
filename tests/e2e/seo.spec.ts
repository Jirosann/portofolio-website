import { test, expect, PROJECT_SLUGS } from './fixtures';

// Semua URL absolut berasal dari getSiteUrl() (NEXT_PUBLIC_SITE_URL). Dibandingkan lewat URL#href
// agar "https://x" dan "https://x/" dianggap sama.
const href = (u: string | null | undefined) => new URL(u ?? '').href;

test.describe('seo: URL situs', () => {
  let site: string;
  test.beforeAll(({ baseURL }) => {
    site = (process.env.NEXT_PUBLIC_SITE_URL ?? baseURL!).replace(/\/$/, '');
  });

  test('beranda: canonical, og:url, JSON-LD', async ({ page }) => {
    await page.goto('/');
    expect(href(await page.locator('link[rel="canonical"]').getAttribute('href'))).toBe(href(site));
    expect(href(await page.locator('meta[property="og:url"]').getAttribute('content'))).toBe(href(site));

    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
    const urls = (ld['@graph'] as { url: string }[]).map((n) => href(n.url));
    expect(urls).toEqual([href(site), href(site)]);
  });

  test('halaman proyek: canonical dan og:url', async ({ page }) => {
    const slug = PROJECT_SLUGS[0];
    await page.goto(`/projects/${slug}`);
    expect(href(await page.locator('link[rel="canonical"]').getAttribute('href'))).toBe(href(`${site}/projects/${slug}`));
    expect(href(await page.locator('meta[property="og:url"]').getAttribute('content'))).toBe(href(`${site}/projects/${slug}`));
  });

  test('robots.txt dan sitemap.xml', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain(`Sitemap: ${site}/sitemap.xml`);

    const sitemap = await (await request.get('/sitemap.xml')).text();
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => href(m[1]));
    expect(locs).toEqual([href(site)]);
  });
});

import type { Page } from '@playwright/test';
import { test, expect, SECTIONS, THEMES, scrollMarginFor, waitForScrollEnd, gotoHome, visible } from './fixtures';

const NAV_LABELS = { about: 'About', projects: 'Projects', experience: 'Experience', skills: 'Skills', contact: 'Contact' };

/** Posisi section setelah lompatan. Section terakhir boleh tertahan di batas bawah halaman. */
async function landing(page: Page, id: string) {
  return page.evaluate((id) => {
    const el = document.getElementById(id)!;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return { top: el.getBoundingClientRect().top, atBottom: window.scrollY >= max - 1 };
  }, id);
}

test.describe('lompatan menu', () => {
  // Urutan sengaja: turun satu per satu lalu naik jauh, supaya lompatan panjang ke atas juga teruji.
  const JUMPS = [...SECTIONS, 'about'] as const;

  for (const width of [1024, 1440]) {
    test(`desktop ${width}px: mendarat tepat dan sorotan tidak berkedip`, async ({ page, setup }) => {
      await setup({ width });
      await gotoHome(page);
      const margin = scrollMarginFor(width);

      for (const id of JUMPS) {
        // Rekam setiap perubahan sorotan aktif selama lompatan.
        await page.evaluate(() => {
          const w = window as unknown as { __active: (string | null)[]; __mo?: MutationObserver };
          w.__active = [];
          w.__mo?.disconnect();
          const wrap = document.querySelector('.nav-links')!;
          w.__mo = new MutationObserver(() => {
            const cur = wrap.querySelector('a[aria-current="true"]');
            w.__active.push(cur ? cur.getAttribute('href') : null);
          });
          w.__mo.observe(wrap, { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
        });

        await page.locator('.nav-links').getByRole('link', { name: NAV_LABELS[id], exact: true }).click();
        await waitForScrollEnd(page);
        // Lepas kunci (scrollend / 300 ms diam) lalu beri waktu IntersectionObserver.
        await page.waitForTimeout(500);

        const pos = await landing(page, id);
        if (!pos.atBottom) expect(Math.abs(pos.top - margin), `#${id} top=${pos.top}`).toBeLessThanOrEqual(4);
        else expect(pos.top).toBeGreaterThanOrEqual(margin - 4);

        const history = await page.evaluate(() => (window as unknown as { __active: (string | null)[] }).__active);
        expect(new Set(history), `sorotan selama lompatan ke #${id}`).toEqual(new Set(history.length ? [`#${id}`] : []));
        await expect(page.locator('.nav-links a[aria-current="true"]')).toHaveAttribute('href', `#${id}`);
      }
    });
  }

  test('mobile 390px: menu membuka, menutup, dan mendarat tepat', async ({ page, setup }) => {
    await setup({ width: 390, height: 844 });
    await gotoHome(page);
    const margin = scrollMarginFor(390);

    for (const id of JUMPS) {
      await page.getByRole('button', { name: 'Open menu' }).click();
      const menu = page.locator('#mobile-menu');
      await expect(menu).toBeVisible();
      await menu.getByRole('link', { name: NAV_LABELS[id], exact: true }).click();
      await expect(menu).toBeHidden();
      await waitForScrollEnd(page);

      const pos = await landing(page, id);
      if (!pos.atBottom) expect(Math.abs(pos.top - margin), `#${id} top=${pos.top}`).toBeLessThanOrEqual(4);
      else expect(pos.top).toBeGreaterThanOrEqual(margin - 4);
    }

    // Escape menutup menu dan mengembalikan fokus ke tombol.
    const toggle = page.getByRole('button', { name: 'Open menu' });
    await toggle.click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-menu')).toBeHidden();
    await expect(toggle).toBeFocused();
  });
});

/** Tunggu muat penuh beranda: hidrasi, font, lompatan awal, lalu lepas kunci sorotan dan IntersectionObserver. */
async function settleHome(page: Page) {
  await page.waitForLoadState('load');
  await expect(page.locator('button.sc-btn').first()).toBeEnabled();
  await page.evaluate(() => document.fonts.ready);
  await waitForScrollEnd(page);
  await page.waitForTimeout(500);
}

async function expectLanded(page: Page, id: string, width: number) {
  const pos = await landing(page, id);
  const margin = scrollMarginFor(width);
  if (!pos.atBottom) expect(Math.abs(pos.top - margin), `#${id} top=${pos.top}`).toBeLessThanOrEqual(4);
  else expect(pos.top).toBeGreaterThanOrEqual(margin - 4);
}

/** href tautan menu yang disorot (desktop: deretan tautan; < 768: dibaca dari menu mobile lalu ditutup lagi). */
async function activeHref(page: Page, width: number) {
  const read = async (selector: string) => {
    const current = page.locator(selector);
    return (await current.count()) ? current.getAttribute('href') : null;
  };
  if (width >= 768) return read('.nav-links a[aria-current="true"]');
  await page.locator('button[aria-controls="mobile-menu"]').click();
  await expect(page.locator('#mobile-menu')).toBeVisible();
  const href = await read('#mobile-menu a[aria-current="true"]');
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-menu')).toBeHidden();
  return href;
}

test.describe('lompatan hash saat muat penuh', () => {
  for (const lang of ['en', 'id'] as const) {
    for (const width of [390, 1440]) {
      test(`${lang} ${width}px: menu dari halaman proyek dan hash dibuka langsung`, async ({ page, setup }) => {
        test.slow();
        await setup({ width, height: width < 768 ? 844 : 900, lang });

        // Menu di halaman proyek adalah <a href="/#…"> biasa: selalu muat penuh.
        for (const id of SECTIONS) {
          await page.goto('/projects/faceattend');
          await page.waitForLoadState('load');
          if (width < 768) {
            await page.locator('button[aria-controls="mobile-menu"]').click();
            await page.locator(`#mobile-menu a[href="/#${id}"]`).click();
          } else {
            await page.locator(`.nav-links a[href="/#${id}"]`).click();
          }
          await page.waitForURL(`**/#${id}`);
          await settleHome(page);
          await expectLanded(page, id, width);
          expect(await activeHref(page, width), `sorotan setelah menu ${id}`).toBe(`#${id}`);
        }

        // Tautan yang dibagikan, dibuka di tab baru; model card berada di dalam #projects.
        for (const [id, section] of [...SECTIONS.map((s) => [s, s]), ['project-fakenews-detector', 'projects']]) {
          await page.goto('about:blank');
          await page.goto(`/#${id}`);
          await settleHome(page);
          await expectLanded(page, id, width);
          expect(await activeHref(page, width), `sorotan setelah membuka /#${id}`).toBe(`#${section}`);
        }
      });
    }
  }
});

test.describe('logo', () => {
  for (const width of [390, 1440]) {
    test(`${width}px: kembali ke atas dengan smooth, hash hilang, sorotan seperti awal`, async ({ page, setup, baseURL }) => {
      await setup({ width, height: width < 768 ? 844 : 900 });
      await gotoHome(page);
      await waitForScrollEnd(page);
      const initial = await activeHref(page, width);
      const logo = page.locator('a.nav-brand');

      /** Klik logo sambil merekam scrollY setiap frame sampai berhenti. */
      const clickLogo = async () => {
        const start = await page.evaluate(() => {
          const w = window as unknown as { __ys: number[] };
          w.__ys = [];
          const tick = () => {
            w.__ys.push(window.scrollY);
            if (w.__ys.length < 240) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          return window.scrollY;
        });
        await logo.click();
        await waitForScrollEnd(page);
        await page.waitForTimeout(500);
        const ys = await page.evaluate(() => (window as unknown as { __ys: number[] }).__ys);
        expect(ys.some((y) => y > 0 && y < start - 1), 'ada posisi antara (smooth)').toBe(true);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
        expect(page.url()).toBe(`${baseURL}/`);
        expect(await activeHref(page, width)).toBe(initial);
      };

      // A: digulir tanpa hash.
      await page.evaluate(() => window.scrollTo({ top: 3000, behavior: 'instant' }));
      await waitForScrollEnd(page);
      await page.waitForTimeout(500);
      await clickLogo();

      // B: lewat menu Contact (URL ber-hash), lalu logo.
      if (width < 768) {
        await page.locator('button[aria-controls="mobile-menu"]').click();
        await page.locator('#mobile-menu a[href="#contact"]').click();
      } else {
        await page.locator('.nav-links a[href="#contact"]').click();
      }
      await waitForScrollEnd(page);
      await page.waitForTimeout(500);
      expect(page.url()).toBe(`${baseURL}/#contact`);
      await clickLogo();
    });
  }

  test('reduced motion: langsung di atas', async ({ page, setup, baseURL }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await setup({ width: 1440 });
    await page.goto('/#contact');
    await settleHome(page);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
    await page.locator('a.nav-brand').click();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    expect(page.url()).toBe(`${baseURL}/`);
  });
});

/** Rekam scrollY tiap frame (1,5 s pertama), setiap perubahan sorotan menu, dan setiap perubahan indikator sejak
 *  dokumen dibuat, di setiap muat penuh. rAF tidak berjalan selama render ditahan, jadi entri pertama adalah frame
 *  pertama yang dilukis. Indikator: menyala atau tidak, plus properti transisi yang berjalan saat itu. */
async function recordLoads(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __ys: number[]; __active: (string | null)[]; __ind: IndicatorEntry[] };
    w.__ys = [];
    w.__active = [];
    w.__ind = [];
    const logIndicator = (el: Element) =>
      w.__ind.push({
        on: el.hasAttribute('data-on'),
        props: el.getAnimations().map((a) => (a as CSSTransition).transitionProperty ?? 'animation'),
      });
    new MutationObserver((records) => {
      for (const r of records) {
        const el = r.target as Element;
        if (r.type === 'attributes' && el.classList.contains('nav-indicator')) logIndicator(el);
        r.addedNodes.forEach((n) => {
          if (n instanceof Element && n.classList.contains('nav-indicator')) logIndicator(n);
        });
      }
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-on', 'style'] });
    let t0 = 0;
    const tick = (t: number) => {
      t0 ||= t;
      w.__ys.push(window.scrollY);
      if (t - t0 < 1500) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    new MutationObserver(() => {
      const cur = document.querySelector('.nav-links a[aria-current="true"]');
      const href = cur ? cur.getAttribute('href') : null;
      if (w.__active.at(-1) !== href) w.__active.push(href);
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
  });
}

type IndicatorEntry = { on: boolean; props: string[] };

const loadLog = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __ys: number[]; __active: (string | null)[]; __ind: IndicatorEntry[] };
    return { ys: w.__ys, active: w.__active, ind: w.__ind, y: window.scrollY };
  });

/** Indikator menyala dari padam di tempat (fade/scale), bukan meluncur dari item lain: tidak ada transisi transform. */
function expectAppearedInPlace(ind: IndicatorEntry[], label: string) {
  const on = ind.filter((e) => e.on);
  expect(on.length, `${label}: indikator menyala`).toBeGreaterThan(0);
  expect(on.flatMap((e) => e.props), `${label}: indikator meluncur`).not.toContain('transform');
}

/** Gulir ke tengah section Projects; kembalikan scrollY. */
async function scrollToMidProjects(page: Page) {
  const y = await page.evaluate(() => {
    const el = document.getElementById('projects')!;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.round(top + el.offsetHeight / 2 - window.innerHeight / 2), behavior: 'instant' });
    return window.scrollY;
  });
  await waitForScrollEnd(page);
  await page.waitForTimeout(500);
  return y;
}

/** Frame pertama sudah di posisi terakhir (hero tidak sempat tampil), tanpa posisi antara, dan sorotan langsung ke
 *  Projects tanpa singgah. */
async function expectRestored(page: Page, y: number, width: number, label: string) {
  const log = await loadLog(page);
  expect(Math.abs(log.y - y), `${label}: scrollY ${log.y}, semula ${y}`).toBeLessThanOrEqual(4);
  expect(log.ys.filter((v) => Math.abs(v - y) > 4), `${label}: frame di luar posisi terakhir`).toEqual([]);
  expect(log.active.filter(Boolean), `${label}: urutan sorotan`).toEqual(['#projects']);
  if (width >= 768) expectAppearedInPlace(log.ind, label);
  expect(await activeHref(page, width), `${label}: sorotan`).toBe('#projects');
}

test.describe('posisi scroll saat muat penuh', () => {
  for (const lang of ['en', 'id'] as const) {
    for (const width of [390, 1440]) {
      test(`${lang} ${width}px: reload dan Back memulihkan posisi; kunjungan baru, hash, dan logo`, async ({ page, setup, baseURL }) => {
        test.slow();
        await setup({ width, height: width < 768 ? 844 : 900, lang });
        await recordLoads(page);

        // Kunjungan baru mulai dari atas, juga setelah halaman pernah digulir di kunjungan sebelumnya.
        await gotoHome(page);
        await scrollToMidProjects(page);
        await page.goto('about:blank');
        await page.goto('/');
        await settleHome(page);
        let log = await loadLog(page);
        expect(log.y, 'kunjungan baru').toBe(0);
        expect(log.ys.every((v) => v === 0), 'kunjungan baru: tanpa gerak').toBe(true);
        expect(await page.evaluate(() => history.scrollRestoration)).toBe('auto');

        // Reload di tengah Projects.
        const mid = await scrollToMidProjects(page);
        expect(await activeHref(page, width)).toBe('#projects');
        await page.reload();
        await settleHome(page);
        await expectRestored(page, mid, width, 'reload');

        // Back dari halaman proyek (muat penuh).
        await page.goto('/projects/faceattend');
        await page.waitForLoadState('load');
        await page.goBack();
        await settleHome(page);
        expect(page.url()).toBe(`${baseURL}/`);
        await expectRestored(page, mid, width, 'Back');

        // Hash dari kunjungan baru tetap mendarat di section-nya (F1); reload setelah digulir memulihkan posisi,
        // bukan melompat lagi ke hash.
        await page.goto('about:blank');
        await page.goto('/#skills');
        await settleHome(page);
        await expectLanded(page, 'skills', width);
        expect(await activeHref(page, width)).toBe('#skills');
        const midFromHash = await scrollToMidProjects(page);
        await page.reload();
        await settleHome(page);
        expect(page.url()).toBe(`${baseURL}/#skills`);
        await expectRestored(page, midFromHash, width, 'reload ber-hash');

        // Logo kembali ke atas dan menghapus hash (F2); reload sesudahnya tetap di atas.
        await page.locator('a.nav-brand').click();
        await waitForScrollEnd(page);
        await page.waitForTimeout(500);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
        expect(page.url()).toBe(`${baseURL}/`);
        await page.reload();
        await settleHome(page);
        log = await loadLog(page);
        expect(log.y, 'reload setelah logo').toBe(0);
        expect(log.ys.every((v) => v === 0), 'reload setelah logo: tanpa gerak').toBe(true);
      });

      // HTML datang bertahap: Chrome melukis selagi parser masih di hero, sebelum dokumen cukup tinggi untuk dipulihkan.
      test(`${lang} ${width}px: reload dan Back di jaringan lambat tidak menampilkan hero dulu`, async ({ page, setup, problems }) => {
        test.slow();
        await setup({ width, height: width < 768 ? 844 : 900, lang });
        await recordLoads(page);
        await gotoHome(page);
        expect(await page.locator('link[rel="expect"]').count(), 'kunjungan baru: render tidak ditahan').toBe(0);
        const mid = await scrollToMidProjects(page);

        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Network.enable');
        await cdp.send('Network.emulateNetworkConditions', {
          offline: false,
          latency: 40,
          downloadThroughput: 200 * 1024,
          uploadThroughput: 200 * 1024,
        });

        await page.reload();
        await settleHome(page);
        await expectRestored(page, mid, width, 'reload lambat');

        await page.goto('/projects/faceattend');
        await page.waitForLoadState('load');
        await page.goBack();
        await settleHome(page);
        await expectRestored(page, mid, width, 'Back lambat');
        expect(problems.console).toEqual([]);
      });
    }
  }
});

/** Item yang seharusnya aktif: section terakhir yang tepi atasnya sudah mencapai garis aktif (scroll-margin-top, titik
 *  pendaratan lompatan menu); di dasar halaman item terakhir; di hero tidak ada. */
const expectedActive = (page: Page) =>
  page.evaluate(() => {
    const hrefs = [...document.querySelectorAll('.nav-links a[href^="#"]')].map((a) => a.getAttribute('href')!);
    if (window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 1) return hrefs.at(-1)!;
    let found: string | null = null;
    for (const href of hrefs) {
      const el = document.getElementById(href.slice(1));
      if (el && el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).scrollMarginTop) <= 1) found = href;
    }
    return found;
  });

/** Sorotan desktop: href aktif dan apakah indikator menyala. */
const navState = (page: Page) =>
  page.evaluate(() => ({
    active: document.querySelector('.nav-links a[aria-current="true"]')?.getAttribute('href') ?? null,
    on: document.querySelector('.nav-indicator')?.hasAttribute('data-on') ?? false,
  }));

/** Tunggu scroll berhenti, lalu scroll-spy dan kunci lompatan selesai. */
async function settle(page: Page) {
  await waitForScrollEnd(page);
  await page.waitForTimeout(500);
}

/** Mulai ulang rekaman sorotan dan indikator (log dari recordLoads). */
const resetLog = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __active: (string | null)[]; __ind: IndicatorEntry[] };
    w.__active = [];
    w.__ind = [];
  });

async function expectFollows(page: Page, label: string) {
  const expected = await expectedActive(page);
  const y = await page.evaluate(() => window.scrollY);
  expect((await navState(page)).active, `${label} (scrollY ${y})`).toBe(expected);
}

test.describe('sorotan navbar', () => {
  for (const lang of ['en', 'id'] as const) {
    test(`${lang} 1440px: di hero tidak ada item aktif; hero -> About muncul di tempat`, async ({ page, setup }) => {
      await setup({ width: 1440, lang });
      await recordLoads(page);
      await gotoHome(page);
      await page.mouse.move(720, 450);
      expect(await navState(page), 'muat di atas').toEqual({ active: null, on: false });

      // Pelan ke Projects, lalu Home.
      for (let i = 0; i < 25; i++) {
        await page.mouse.wheel(0, 100);
        await page.waitForTimeout(40);
      }
      await settle(page);
      await expectFollows(page, 'wheel pelan');
      await page.keyboard.press('Home');
      await settle(page);
      expect(await navState(page), 'setelah Home').toEqual({ active: null, on: false });

      // Cepat ke bawah lalu cepat kembali ke atas.
      await page.mouse.wheel(0, 2500);
      await settle(page);
      for (let i = 0; i < 6; i++) await page.mouse.wheel(0, -600);
      await settle(page);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
      expect(await navState(page), 'setelah wheel cepat ke atas').toEqual({ active: null, on: false });

      // Hero -> About: indikator muncul di About, tidak meluncur dari item lain.
      await resetLog(page);
      for (let i = 0; i < 30 && (await expectedActive(page)) !== '#about'; i++) {
        await page.mouse.wheel(0, 100);
        await waitForScrollEnd(page);
      }
      await settle(page);
      expect(await navState(page), 'hero -> About').toEqual({ active: '#about', on: true });
      const log = await loadLog(page);
      expect(log.active, 'hero -> About: urutan sorotan').toEqual(['#about']);
      expectAppearedInPlace(log.ind, 'hero -> About');
    });

    test(`${lang} 1440px: scroll pelan dan cepat, sorotan mengikuti posisi akhir; dasar halaman Contact`, async ({ page, setup }) => {
      await setup({ width: 1440, lang });
      await gotoHome(page);
      await page.mouse.move(720, 450);
      for (let i = 0; i < 70; i++) {
        await page.mouse.wheel(0, 100);
        await page.waitForTimeout(40);
        if (i % 10 === 9) {
          await settle(page);
          await expectFollows(page, `wheel pelan ${i + 1}`);
        }
      }
      for (const dy of [1500, 2500, 1200, 3000, -2000, 800, -3500, 2600, -900, -5000]) {
        await page.mouse.wheel(0, dy);
        await settle(page);
        await expectFollows(page, `wheel ${dy}`);
      }
      await page.keyboard.press('End');
      await settle(page);
      expect((await navState(page)).active, 'dasar halaman').toBe('#contact');
    });

    test(`${lang} 1440px: klik menu, tile hero, logo, lalu scroll manual`, async ({ page, setup }) => {
      await setup({ width: 1440, lang });
      await recordLoads(page);
      await gotoHome(page);
      await page.mouse.move(720, 450);
      const history = async () => (await loadLog(page)).active;

      await resetLog(page);
      await page.locator('.nav-links a[href="#experience"]').click();
      await settle(page);
      expect(new Set(await history()), 'menu Experience').toEqual(new Set(['#experience']));
      await page.mouse.wheel(0, -700);
      await settle(page);
      await expectFollows(page, 'scroll manual setelah menu');

      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await settle(page);
      await resetLog(page);
      await page.locator('ul[aria-labelledby="hero-proof"] a').first().click();
      await settle(page);
      expect(new Set(await history()), 'tile hero').toEqual(new Set(['#projects']));
      await page.mouse.wheel(0, 1600);
      await settle(page);
      await expectFollows(page, 'scroll manual setelah tile');

      await resetLog(page);
      await page.locator('a.nav-brand').click();
      await settle(page);
      expect(await history(), 'logo').toEqual([null]);
      expect(await navState(page), 'logo').toEqual({ active: null, on: false });
      await page.mouse.wheel(0, 1200);
      await settle(page);
      await expectFollows(page, 'scroll manual setelah logo');

      // Wheel di tengah lompatan: kunci batal, sorotan mengikuti posisi.
      await page.locator('.nav-links a[href="#contact"]').click();
      await page.waitForTimeout(120);
      await page.mouse.wheel(0, -300);
      await settle(page);
      await expectFollows(page, 'wheel di tengah lompatan');
    });
  }

  test('390px: menu mobile tanpa item aktif di hero dan mengikuti posisi', async ({ page, setup }) => {
    await setup({ width: 390, height: 844 });
    await gotoHome(page);
    expect(await activeHref(page, 390), 'muat di atas').toBe(null);
    await scrollToMidProjects(page);
    expect(await activeHref(page, 390), 'Projects').toBe('#projects');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await settle(page);
    expect(await activeHref(page, 390), 'kembali ke atas').toBe(null);
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await settle(page);
    expect(await activeHref(page, 390), 'dasar halaman').toBe('#contact');
  });

  test('reduced motion: indikator berpindah tanpa animasi', async ({ page, setup }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await setup({ width: 1440 });
    await recordLoads(page);
    await gotoHome(page);
    for (const id of ['about', 'projects', 'experience']) {
      await page.evaluate((id) => document.getElementById(id)!.scrollIntoView({ behavior: 'instant' }), id);
      await settle(page);
      expect((await navState(page)).active).toBe(`#${id}`);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await settle(page);
    const log = await loadLog(page);
    expect(log.ind.length).toBeGreaterThan(0);
    expect(log.ind.flatMap((e) => e.props), 'animasi indikator').toEqual([]);
  });
});

test.describe('tile proyek hero', () => {
  // Tiga proyek teratas Selected work (card.order), menuju model card di halaman, bukan ke GitHub.
  const EXPECTED = ['tb-detector', 'fakenews-detector', 'face-attend'];

  for (const width of [390, 1024, 1440]) {
    test(`${width}px: urutan sama dengan Selected work dan mendarat di bawah navbar`, async ({ page, setup }) => {
      await setup({ width, height: width < 768 ? 844 : 900 });
      await gotoHome(page);
      const tiles = page.locator('ul[aria-labelledby="hero-proof"] a');
      await expect(tiles).toHaveCount(3);
      expect(await tiles.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual(EXPECTED.map((s) => `#project-${s}`));
      for (const tile of await tiles.all()) await expect(tile).not.toHaveAttribute('target');

      const margin = scrollMarginFor(width);
      for (const [i, slug] of EXPECTED.entries()) {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await tiles.nth(i).click();
        await waitForScrollEnd(page);
        const pos = await landing(page, `project-${slug}`);
        if (!pos.atBottom) expect(Math.abs(pos.top - margin), `#project-${slug} top=${pos.top}`).toBeLessThanOrEqual(4);
        else expect(pos.top).toBeGreaterThanOrEqual(margin - 4);
      }
    });
  }
});

test.describe('kartu stack', () => {
  const flipped = (page: Page) => page.locator('li.sc[data-flipped]');

  test('mouse: membalik, satu kartu terbuka, Escape menutup', async ({ page, setup }) => {
    await setup({ width: 1440 });
    await gotoHome(page);
    const buttons = page.locator('button.sc-btn');
    await buttons.nth(0).click();
    await expect(flipped(page)).toHaveCount(1);
    await expect(buttons.nth(0)).toHaveAttribute('aria-expanded', 'true');

    await buttons.nth(1).click();
    await expect(flipped(page)).toHaveCount(1);
    await expect(buttons.nth(0)).toHaveAttribute('aria-expanded', 'false');
    await expect(buttons.nth(1)).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(flipped(page)).toHaveCount(0);
  });

  test('keyboard: Enter dan Space', async ({ page, setup }) => {
    await setup({ width: 1440 });
    await gotoHome(page);
    const button = page.locator('button.sc-btn').first();
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
    await page.keyboard.press('Space');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  test('tautan "used in" menuju model card dan menutup kartu', async ({ page, setup }) => {
    await setup({ width: 1440 });
    await gotoHome(page);
    const card = page.locator('li.sc').filter({ has: page.locator('a.sc-link') }).first();
    await card.locator('button.sc-btn').click();
    const link = card.locator('a.sc-link').first();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^#project-/);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(flipped(page)).toHaveCount(0);
    await expect(page.locator(href!)).toBeInViewport();
  });

  test.describe('sentuh', () => {
    test.use({ hasTouch: true, isMobile: true });

    test('tap membalik kartu', async ({ page, setup }) => {
      await setup({ width: 390, height: 844 });
      await gotoHome(page);
      const button = page.locator('button.sc-btn').first();
      await button.scrollIntoViewIfNeeded();
      await button.tap();
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      await page.locator('button.sc-btn').nth(1).tap();
      await expect(button).toHaveAttribute('aria-expanded', 'false');
      await expect(flipped(page)).toHaveCount(1);
    });
  });
});

test.describe('Tools I use', () => {
  const run = async (page: Page, act: 'click' | 'tap') => {
    // Target klik/ketuk = li (area statis); kartu di dalamnya pointer-events: none.
    const cards = page.locator('.tl-fan > li');
    await expect(cards).toHaveCount(11);
    await cards.nth(2).scrollIntoViewIfNeeded();
    await cards.nth(2)[act]();
    await expect(cards.nth(2)).toHaveAttribute('data-raised');
    await expect(cards.nth(2).locator('.tl-name')).toHaveCSS('opacity', '1');
    await cards.nth(6)[act]();
    await expect(cards.nth(6)).toHaveAttribute('data-raised');
    await expect(page.locator('.tl-fan > li[data-raised]')).toHaveCount(1);
  };

  test('klik mengangkat satu kartu dan memunculkan nama', async ({ page, setup }) => {
    await setup({ width: 1440 });
    await gotoHome(page);
    await run(page, 'click');
  });

  test.describe('sentuh', () => {
    test.use({ hasTouch: true, isMobile: true });
    test('tap mengangkat satu kartu', async ({ page, setup }) => {
      await setup({ width: 390, height: 844 });
      await gotoHome(page);
      await run(page, 'tap');
    });

    test('kartu terangkat turun saat halaman digulir', async ({ page, setup }) => {
      await setup({ width: 390, height: 844 });
      await gotoHome(page);
      const card = page.locator('.tl-fan > li').nth(2);
      await card.scrollIntoViewIfNeeded();
      await card.tap();
      await expect(card).toHaveAttribute('data-raised');
      await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'instant' }));
      await expect(page.locator('.tl-fan > li[data-raised]')).toHaveCount(0);
    });
  });

  test('Claude Code setelah OpenClaw, tidak diulang di Also worked with', async ({ page, setup }) => {
    await setup({ width: 1440 });
    await gotoHome(page);
    const names = await page.locator('.tl-name').evaluateAll((els) => els.map((el) => el.firstChild?.textContent));
    expect(names.slice(-2)).toEqual(['OpenClaw', 'Claude Code']);
    await expect(page.locator('.sc-also', { hasText: /claude/i })).toHaveCount(0);
  });

  // Kipas muat tanpa scroll horizontal dan strip setiap kartu yang tertimpa tetap >= 44 px (HP 4-4-3, desktop satu baris).
  // Kursor tepat di dalam tepi kartu diam (3,5 px), lalu diam 1 detik: kartu terangkat sekali dan tetap terangkat
  // (dulu kartu naik meninggalkan kursor, turun lagi, berulang). Titik di tengah strip yang terlihat, sepanjang sumbu
  // kartu yang miring; dari samping = tepi kiri setiap kartu dan tepi kanan kartu terakhir.
  for (const theme of THEMES)
    for (const width of [1024, 1440])
      for (const from of ['bawah', 'atas', 'samping'] as const)
        test(`hover dari ${from} stabil, ${theme} ${width}px`, async ({ page, setup }) => {
          await setup({ width, theme });
          await gotoHome(page);
          await page.locator('.tl-fan').evaluate((ul) => ul.scrollIntoView({ block: 'center', behavior: 'instant' }));
          await waitForScrollEnd(page);
          await page.mouse.move(2, 2);
          await page.waitForTimeout(300);

          // Geometri kartu diam: kotak li (tidak pernah di-transform) + rotate/translate terhitung kartu.
          const cards = await page.locator('.tl-fan > li').evaluateAll((lis) =>
            lis.map((li, i) => {
              const box = li.getBoundingClientRect();
              const next = lis[i + 1]?.getBoundingClientRect();
              const cs = getComputedStyle(li.querySelector('.tl-card')!);
              const r = cs.rotate === 'none' ? 0 : parseFloat(cs.rotate);
              const dy = cs.translate === 'none' ? 0 : parseFloat(cs.translate.split(' ')[1] ?? '0');
              return { left: box.left, top: box.top, w: box.width, h: box.height, strip: next ? next.left - box.left : box.width, r, dy };
            }),
          );
          expect(cards).toHaveLength(11);

          type Card = (typeof cards)[number];
          // (u, v) di bidang kartu: u dari tengah ke kanan, v dari tepi bawah ke atas; poros rotasi di tengah bawah.
          const at = (c: Card, u: number, v: number) => {
            const a = (c.r * Math.PI) / 180;
            return { x: c.left + c.w / 2 + u * Math.cos(a) + v * Math.sin(a), y: c.top + c.h + c.dy + u * Math.sin(a) - v * Math.cos(a) };
          };
          const IN = 3.5;
          const OUT = 30;
          const paths = cards.flatMap((c, i) => {
            const u = i === cards.length - 1 ? 0 : (c.strip - c.w) / 2;
            if (from === 'bawah') return [{ i, start: at(c, u, -OUT), end: at(c, u, IN) }];
            if (from === 'atas') return [{ i, start: at(c, u, c.h + OUT), end: at(c, u, c.h - IN) }];
            const side = [{ i, start: at(c, -c.w / 2 - OUT, c.h / 2), end: at(c, -c.w / 2 + IN, c.h / 2) }];
            if (i === cards.length - 1) side.push({ i, start: at(c, c.w / 2 + OUT, c.h / 2), end: at(c, c.w / 2 - IN, c.h / 2) });
            return side;
          });

          for (const { i, start, end } of paths) {
            const label = `kartu ${i} dari ${from} (${Math.round(end.x)}, ${Math.round(end.y)})`;
            // Titik target memang milik kartu ini saat semua kartu diam (strip terlihat).
            await page.mouse.move(2, 2);
            await page.waitForTimeout(250);
            const owner = await page.evaluate(({ x, y }) => {
              const hit = document.elementFromPoint(x, y);
              return [...document.querySelectorAll('.tl-fan > li')].findIndex((li) => li.contains(hit));
            }, end);
            expect(owner, label).toBe(i);

            await page.mouse.move(start.x, start.y);
            await page.mouse.move(end.x, end.y, { steps: 8 });
            const sampling = page.evaluate(
              (i) =>
                new Promise<{ hover: boolean; hovered: number; ty: number; op: number }[]>((resolve) => {
                  const li = document.querySelectorAll('.tl-fan > li')[i];
                  const card = li.querySelector('.tl-card')!;
                  const name = li.querySelector('.tl-name')!;
                  const out: { hover: boolean; hovered: number; ty: number; op: number }[] = [];
                  const t0 = performance.now();
                  const tick = () => {
                    const tr = getComputedStyle(card).translate;
                    out.push({
                      hover: li.matches(':hover'),
                      hovered: document.querySelectorAll('.tl-fan > li:hover').length,
                      ty: tr === 'none' ? 0 : parseFloat(tr.split(' ')[1] ?? '0'),
                      op: parseFloat(getComputedStyle(name).opacity),
                    });
                    if (performance.now() - t0 < 1000) requestAnimationFrame(tick);
                    else resolve(out);
                  };
                  requestAnimationFrame(tick);
                }),
              i,
            );
            // Kursor sungguhan tidak pernah benar-benar diam: geser subpiksel berkala supaya browser menilai ulang
            // hover (tanpa event mouse, Chromium headless tidak selalu menilai ulang setelah kartu bergerak).
            for (let k = 1; k <= 8; k++) {
              await page.waitForTimeout(110);
              await page.mouse.move(end.x + (k % 2) * 0.5, end.y);
            }
            const samples = await sampling;

            expect(samples.every((s) => s.hover && s.hovered === 1), `${label}: hover lepas`).toBe(true);
            // Hanya bergerak naik (translate-y tidak pernah bertambah lagi), berakhir terangkat penuh.
            const drops = samples.filter((s, k) => k > 0 && s.ty > samples[k - 1].ty + 0.05);
            expect(drops, `${label}: kartu turun lagi`).toEqual([]);
            expect(samples.at(-1)!.ty, label).toBeCloseTo(-12, 1);
            // Label tampil dan tidak meredup lagi setelah tampil penuh.
            const shown = samples.findIndex((s) => s.op === 1);
            expect(shown, `${label}: label tidak tampil`).toBeGreaterThanOrEqual(0);
            expect(samples.slice(shown).every((s) => s.op === 1), `${label}: label berkedip`).toBe(true);
          }
        });

  // Kartu Tools bukan tab stop (keputusan sesi 10): Tab dari kartu stack terakhir melewati kipas.
  test('keyboard: Tab melewati kipas', async ({ page, setup }) => {
    await setup({ width: 1440 });
    await gotoHome(page);
    await page.locator('button.sc-btn').last().focus();
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('.tl-fan'))).toBe(false);
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(false);
  });

  for (const width of [320, 390, 1024, 1280, 1440]) {
    test(`kipas muat di ${width}px`, async ({ page, setup }) => {
      await setup({ width });
      await gotoHome(page);
      const fan = await page.locator('.tl-fan').evaluate((ul) => {
        const boxes = [...ul.children].map((li) => li.getBoundingClientRect());
        const rows = new Map<number, number[]>();
        for (const b of boxes) rows.set(Math.round(b.top), [...(rows.get(Math.round(b.top)) ?? []), b.left]);
        const strips = [...rows.values()].flatMap((lefts) => lefts.slice(1).map((left, i) => left - lefts[i]));
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          minStrip: Math.min(...strips),
          rows: [...rows.values()].map((lefts) => lefts.length),
        };
      });
      expect(fan.overflow).toBe(0);
      expect(fan.minStrip).toBeGreaterThanOrEqual(44);
      expect(fan.rows).toEqual(width < 768 ? [4, 4, 3] : [11]);
    });
  }
});

test.describe('Try the model', () => {
  const panel = (page: Page) => page.locator('#try-model-fake-news');

  async function open(page: Page, name: RegExp) {
    const model = page.waitForResponse('**/models/fake-news/model.json');
    await page.getByRole('button', { name }).click();
    expect((await model).status()).toBe(200);
    await expect(panel(page).getByRole('textbox')).toBeVisible();
  }

  test('contoh real/fake menjalankan model dan menampilkan hasil (en)', async ({ page, setup, problems }) => {
    await setup({ width: 1440 });
    await gotoHome(page);
    await open(page, /Try the model/);
    const live = panel(page).locator('[aria-live="polite"]');

    await panel(page).getByRole('button', { name: 'Run the model' }).click();
    await expect(live).toHaveText('Paste or type an English article first.');

    for (const [sample, label] of [['Real 1', 'Real'], ['Fake 1', 'Fake'], ['Real 2', 'Real'], ['Fake 2', 'Fake']]) {
      await panel(page).getByRole('button', { name: sample, exact: true }).click();
      await expect(panel(page).getByRole('textbox')).not.toHaveValue('');
      await expect(panel(page)).toContainText(`ISOT label: ${label.toLowerCase()}`);
      await expect(live).toHaveText(new RegExp(`^Prediction: ${label}, [<>]?\\d+(\\.\\d)?% probability\\.$`));
      await expect(panel(page).locator('li[data-dir]')).toHaveCount(5);
    }
    expect(problems.console).toEqual([]);
  });

  test('locale id', async ({ page, setup }) => {
    await setup({ width: 390, lang: 'id' });
    await gotoHome(page);
    await open(page, /Coba modelnya/);
    await panel(page).getByRole('button', { name: 'Palsu 1', exact: true }).click();
    await expect(panel(page).locator('[aria-live="polite"]')).toHaveText(/^Prediksi: Palsu, probabilitas /);
  });

  // Judul daftar kata mengikuti jumlah kata yang tampil (kosakata model < 5 kata: daftar lebih pendek).
  const HEADINGS = {
    en: { button: /Try the model/, run: 'Run the model', sample: 'Real 1', one: 'The word that moved the score most', n: (n: number) => `The ${n} words that moved the score most` },
    id: { button: /Coba modelnya/, run: 'Jalankan model', sample: 'Asli 1', one: 'Kata yang paling menggeser skor', n: (n: number) => `${n} kata yang paling menggeser skor` },
  };
  for (const [lang, width] of [['en', 1440], ['id', 390]] as const) {
    test(`judul daftar kata mengikuti jumlah kata (${lang} ${width}px)`, async ({ page, setup }) => {
      const h = HEADINGS[lang];
      await setup({ width, lang });
      await gotoHome(page);
      await open(page, h.button);
      const terms = panel(page).locator('li[data-dir]');
      const run = async (text: string) => {
        await panel(page).getByRole('textbox').fill(text);
        await panel(page).getByRole('button', { name: h.run }).click();
      };

      await run('president');
      await expect(terms).toHaveCount(1);
      await expect(panel(page).getByRole('heading', { name: h.one, exact: true })).toBeVisible();

      await run('president senate');
      await expect(terms).toHaveCount(2);
      await expect(panel(page).getByRole('heading', { name: h.n(2), exact: true })).toBeVisible();

      await panel(page).getByRole('button', { name: h.sample, exact: true }).click();
      await expect(terms).toHaveCount(5);
      await expect(panel(page).getByRole('heading', { name: h.n(5), exact: true })).toBeVisible();
    });
  }
});

test.describe('easter egg hire', () => {
  const toast = (page: Page) => page.getByText(/Email copied — let's talk|Press Ctrl\+C to copy the email/);

  test('mengetik "hire" di halaman memunculkan toast', async ({ page, setup }) => {
    await setup({ width: 1440 });
    await gotoHome(page);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.type('hire');
    await expect(toast(page)).toBeVisible();
  });

  test('locale id', async ({ page, setup }) => {
    await setup({ width: 390, lang: 'id' });
    await gotoHome(page);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.type('hire');
    await expect(page.getByText(/Email tersalin — mari ngobrol|Tekan Ctrl\+C untuk menyalin email/)).toBeVisible();
  });

  // Konfeti: div aria-hidden berisi <i> yang ditempel ke body (hireEffect.ts), dihapus setelah ±2 detik.
  const confetti = (page: Page) => page.locator('body > div[aria-hidden="true"]:has(> i)');
  for (const ok of [true, false]) {
    test(`konfeti hanya bila email tersalin (${ok ? 'berhasil' : 'gagal'})`, async ({ page, setup }) => {
      await page.addInitScript((ok) => {
        const writeText = () => (ok ? Promise.resolve() : Promise.reject(new DOMException('denied', 'NotAllowedError')));
        Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
      }, ok);
      await setup({ width: 1440 });
      await gotoHome(page);
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await page.keyboard.type('hire');
      if (ok) {
        await expect(page.getByText("Email copied — let's talk")).toBeVisible();
        await expect(confetti(page)).toHaveCount(1);
      } else {
        await expect(page.getByText(/Press Ctrl\+C to copy the email/)).toBeVisible();
        await page.waitForTimeout(500);
        await expect(confetti(page)).toHaveCount(0);
      }
    });
  }

  test('tidak terpicu saat mengetik di textarea', async ({ page, setup }) => {
    await setup({ width: 1440 });
    await gotoHome(page);
    const model = page.waitForResponse('**/models/fake-news/model.json');
    await page.getByRole('button', { name: /Try the model/ }).click();
    await model;
    const textarea = page.locator('#try-model-fake-news').getByRole('textbox');
    await textarea.click();
    await page.keyboard.type('hire');
    await expect(textarea).toHaveValue('hire');
    await page.waitForTimeout(500);
    await expect(toast(page)).toHaveCount(0);
  });

  // Petunjuk "psst: type hire" hanya untuk pointer halus; di perangkat sentuh tidak ada keyboard untuk mengetik.
  test('petunjuk tampil di desktop', async ({ page, setup }) => {
    await setup({ width: 1440 });
    await gotoHome(page);
    await expect(page.locator('.footer-hint')).toBeVisible();
  });

  test.describe('sentuh', () => {
    test.use({ hasTouch: true, isMobile: true });
    test('petunjuk tersembunyi', async ({ page, setup }) => {
      await setup({ width: 390, height: 844 });
      await gotoHome(page);
      expect(await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches)).toBe(false);
      await expect(page.locator('.footer-hint')).toBeHidden();
    });
  });
});

test.describe('badge Open to Work < 768', () => {
  test.use({ hasTouch: true, isMobile: true });

  for (const [width, lang] of [[320, 'en'], [390, 'en'], [390, 'id'], [600, 'en']] as const) {
    test(`${width}px ${lang}: gelembung tidak menutupi tautan, CLS 0, ketukan di luar menutup`, async ({ page, setup }) => {
      await setup({ width, height: 844, lang });
      await gotoHome(page);
      // Pergeseran tata letak tanpa input pengguna sejak titik ini (hadRecentInput = pergeseran ≤ 500 ms setelah input).
      await page.evaluate(() => {
        const w = window as unknown as { __cls: number };
        w.__cls = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[])
            if (!e.hadRecentInput) w.__cls += e.value;
        }).observe({ type: 'layout-shift' });
      });
      const cls = () => page.evaluate(() => (window as unknown as { __cls: number }).__cls);

      const badge = page.locator('.otw-btn');
      const bubble = page.locator('.otw-bubble');
      await badge.scrollIntoViewIfNeeded();
      await badge.tap();
      await expect(bubble).toBeVisible();
      await page.waitForTimeout(400); // transisi baris selesai

      const card = badge.locator('xpath=ancestor::div[contains(@class, "col-span-4")]');
      const targets = [
        badge,
        ...(await card.locator('ul a').all()),
        page.locator('a[href="#contact"]').filter({ hasText: lang === 'id' ? 'Hubungi saya' : 'Contact me' }),
      ];
      expect(targets.length).toBe(6); // badge, Email, LinkedIn, GitHub, WhatsApp, Contact me
      for (const target of targets) {
        await target.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
        const hit = await target.evaluate((el) => {
          const b = document.querySelector('.otw-bubble')!.getBoundingClientRect();
          const r = el.getBoundingClientRect();
          const overlap = r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top;
          const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          return { overlap, ownHit: !!top && el.contains(top), name: el.textContent?.trim() || el.getAttribute('href') };
        });
        expect(hit.overlap, `gelembung beririsan dengan ${hit.name}`).toBe(false);
        expect(hit.ownHit, `titik tengah ${hit.name} tertutup`).toBe(true);
      }

      // Mode baris tidak menutup sendiri (penutupan tanpa input akan menggeser isi di bawah kartu).
      await page.waitForTimeout(6000);
      await expect(bubble).toBeVisible();
      await page.locator('#hero-proof').tap();
      await expect(bubble).toBeHidden();
      await page.waitForTimeout(600);
      expect(await cls()).toBe(0);
    });
  }
});

test.describe('game 404', () => {
  test('main 5 judul sampai skor, lalu main lagi', async ({ page, setup, problems }) => {
    await setup({ width: 390 });
    const res = await page.goto('/halaman-yang-tidak-ada');
    expect(res?.status()).toBe(404);
    await page.getByRole('button', { name: 'Play' }).click();

    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`Headline ${i} of 5`)).toBeVisible();
      await page.getByRole('group', { name: 'Real or fake?' }).getByRole('button', { name: i % 2 ? 'Real' : 'Fake', exact: true }).click();
      await expect(page.getByText('ISOT label', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: i < 5 ? 'Next headline' : 'See the score' }).click();
    }

    await expect(page.getByRole('heading', { name: /^You [0-5]\/5 · Model [0-5]\/5$/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'See the model card' })).toHaveAttribute('href', '/#project-fakenews-detector');
    await page.getByRole('button', { name: 'Play again' }).click();
    await expect(page.getByText('Headline 1 of 5')).toBeVisible();
    expect(problems.console.filter((s) => !/status of 404/.test(s))).toEqual([]);
  });
});

test.describe('tema', () => {
  for (const width of [390, 1440])
    test(`saklar tema ${width}px dan bertahan setelah reload`, async ({ page, setup }) => {
      await setup({ width });
      await gotoHome(page);
      const html = page.locator('html');
      await expect(html).toHaveAttribute('data-theme', 'dark');

      await visible(page.getByRole('button', { name: 'Switch to light mode' })).click();
      await expect(html).toHaveAttribute('data-theme', 'light');
      expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('light');

      await page.reload();
      await expect(html).toHaveAttribute('data-theme', 'light');

      await visible(page.getByRole('button', { name: 'Switch to dark mode' })).click();
      await expect(html).toHaveAttribute('data-theme', 'dark');
    });
});

test.describe('bahasa', () => {
  for (const width of [390, 1440])
    test(`en ⇄ id ${width}px`, async ({ page, setup, context }) => {
      await setup({ width });
      await gotoHome(page);
      const html = page.locator('html');

      await visible(page.getByRole('button', { name: 'EN, Change language' })).click();
      await visible(page.getByRole('menuitemradio', { name: 'Indonesia' })).click();
      await expect(html).toHaveAttribute('lang', 'id');
      await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
      expect((await context.cookies()).find((c) => c.name === 'NEXT_LOCALE')?.value).toBe('id');

      await page.reload();
      await expect(html).toHaveAttribute('lang', 'id');
      if (width >= 768) await expect(page.locator('.nav-links').getByRole('link', { name: 'Tentang' })).toBeVisible();
      else {
        await page.getByRole('button', { name: 'Buka menu' }).click();
        await expect(page.locator('#mobile-menu').getByRole('link', { name: 'Tentang' })).toBeVisible();
        await page.keyboard.press('Escape');
      }

      await visible(page.getByRole('button', { name: 'ID, Ganti bahasa' })).click();
      await visible(page.getByRole('menuitemradio', { name: 'English' })).click();
      await expect(html).toHaveAttribute('lang', 'en');
    });
});

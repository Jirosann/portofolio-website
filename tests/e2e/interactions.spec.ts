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

import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3100);
const CI = !!process.env.CI;

// Suite e2e berjalan terhadap build production lokal (`npm run build` dulu).
// Port 3000 dipakai dev server, jadi default di 3100.
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    // Batas piksel absolut, bukan rasio: 1% dari section setinggi 2500 px (±36.000 px) meloloskan
    // perubahan kecil seperti letter-spacing label (±200-500 px). Render di image Docker yang sama deterministik.
    toHaveScreenshot: { maxDiffPixels: 50, threshold: 0.2, animations: 'disabled', caret: 'hide' },
  },
  // Tanpa sufiks platform: baseline hanya dibuat dan dibandingkan di Linux (image Docker yang sama dengan CI).
  snapshotPathTemplate: 'tests/e2e/__screenshots__/{testFilePath}/{arg}{ext}',
  reporter: CI
    ? [['github'], ['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !CI,
    timeout: 120_000,
    // Tanpa ini getSiteUrl() mencetak peringatan fallback di setiap request.
    env: { NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? `http://localhost:${PORT}` },
    stdout: 'ignore',
    stderr: 'pipe',
  },
});

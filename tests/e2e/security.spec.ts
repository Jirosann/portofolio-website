import { test, expect, PROJECT_SLUGS } from './fixtures';

// Header keamanan dari next.config.ts. Pelanggaran CSP sendiri tertangkap di smoke (fixture `problems`: console error).
test.describe('keamanan: header', () => {
  for (const path of ['/', `/projects/${PROJECT_SLUGS[0]}`, '/robots.txt', '/halaman-tidak-ada']) {
    test(`header pada ${path}`, async ({ request }) => {
      const headers = (await request.get(path)).headers();
      const csp = headers['content-security-policy'] ?? '';
      for (const directive of ["default-src 'self'", "frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'"]) {
        expect(csp, 'CSP').toContain(directive);
      }
      expect(csp, 'CSP produksi tanpa eval').not.toContain('unsafe-eval');
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['permissions-policy']).toContain('camera=()');
      expect(headers['x-powered-by'], 'X-Powered-By').toBeUndefined();
    });
  }
});

// Slug asing tidak boleh dirender: setiap slug acak tadinya merender PNG baru per request.
test.describe('keamanan: slug proyek tidak dikenal', () => {
  for (const suffix of ['', '/opengraph-image', '/twitter-image']) {
    test(`/projects/<asing>${suffix} 404, slug valid tetap tersaji`, async ({ request }) => {
      expect((await request.get(`/projects/tidak-ada-123${suffix}`)).status()).toBe(404);
      const ok = await request.get(`/projects/${PROJECT_SLUGS[0]}${suffix}`);
      expect(ok.status()).toBe(200);
      if (suffix) expect(ok.headers()['content-type']).toBe('image/png');
    });
  }
});

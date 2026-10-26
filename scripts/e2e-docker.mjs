// Menjalankan build + suite e2e di dalam image Playwright yang sama dengan CI (.github/workflows/e2e.yml),
// supaya baseline regresi visual identik. Argumen diteruskan ke `playwright test`, mis.:
//   npm run test:e2e:docker -- visual
//   npm run test:e2e:update -- visual  (= --update-snapshots=all)
// node_modules dan .next memakai volume Docker terpisah agar biner Linux tidak menimpa milik host.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const version = JSON.parse(readFileSync('package.json', 'utf8')).devDependencies['@playwright/test'];
const image = `mcr.microsoft.com/playwright:v${version}-noble`;
const quote = (s) => `'${s.replace(/'/g, `'\\''`)}'`;
const args = process.argv.slice(2).map(quote).join(' ');

const script = [
  'npm ci --no-audit --no-fund',
  'npm run build',
  `npx playwright test ${args}`,
].join(' && ');

const result = spawnSync(
  'docker',
  [
    'run', '--rm', '--init', '--ipc=host',
    '--mount', `type=bind,source=${process.cwd()},target=/work`,
    '--mount', 'type=volume,source=portfolio-e2e-node-modules,target=/work/node_modules',
    '--mount', 'type=volume,source=portfolio-e2e-next,target=/work/.next',
    '-w', '/work',
    '-e', 'PUPPETEER_SKIP_DOWNLOAD=1',
    '-e', 'NEXT_PUBLIC_SITE_URL=http://localhost:3100',
    '-e', 'PLAYWRIGHT_HTML_OPEN=never',
    image,
    'bash', '-c', script,
  ],
  { stdio: 'inherit' },
);

process.exit(result.status ?? 1);

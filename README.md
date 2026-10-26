This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Testing (e2e)

The Playwright suite in `tests/e2e/` runs against a local production build on port 3100 (port 3000 stays free for `npm run dev`). It covers smoke checks across widths, themes and languages, internal and external links, axe accessibility, interactions, and visual regression.

```bash
npx playwright install chromium   # once
npm run build
npm run test:e2e                  # starts `next start -p 3100` automatically
npm run test:e2e -- interactions  # one spec file
npx playwright show-report        # open the HTML report
```

- **Windows and macOS (no Docker needed)**: the commands above run every non-visual spec (smoke, links, SEO, a11y, interactions). `visual.spec.ts` is skipped automatically outside Linux.
- **Visual regression** baselines live in `tests/e2e/__screenshots__/`. They are Linux-only and CI compares them on every PR. After an intended visual change, refresh them with the **Update visual baselines** workflow (`.github/workflows/update-snapshots.yml`): Actions → Update visual baselines → Run workflow, enter your branch name (not `main`). It rebuilds the site in the same Playwright image as CI, rewrites only the baselines that changed, and commits them to that branch. Then `git pull`.
  - GitHub only shows the Run workflow button once the workflow file is on `main`.
  - The commit is pushed with `GITHUB_TOKEN`, which doesn't trigger other workflows, so re-run the `e2e` check on the PR by hand.
- **Docker (optional)**: to run or refresh the visual baselines locally in the same image as CI, use `npm run test:e2e:docker` or `npm run test:e2e:update`, then commit the PNGs.
- **External links** are skipped when offline or when `E2E_SKIP_EXTERNAL=1` is set. LinkedIn blocks bots (status 999), so it is reported as a warning, not a failure.
- **Known issues** that have been reported but not fixed yet are listed in `KNOWN_ISSUES` in `tests/e2e/a11y.spec.ts`. When one is fixed, the test fails and asks you to remove that entry.
- **CI**: `.github/workflows/e2e.yml` runs tsc, ESLint, the build and the suite on every PR to `main`. It uploads the HTML report, plus the screenshots, diffs and traces of failed tests.
- **Manual checks** for things automation can't cover: [`tests/e2e/MANUAL-CHECKLIST.md`](tests/e2e/MANUAL-CHECKLIST.md).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
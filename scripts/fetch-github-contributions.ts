/**
 * Fetch GitHub contributions data at build time.
 * PRD v1.2 Section 4: Static export, data fetched during build.
 * 
 * Uses the public jogruber API (no auth needed).
 * If API is unavailable, writes empty data so the section is hidden gracefully.
 * 
 * Usage: npx tsx scripts/fetch-github-contributions.ts
 */

import fs from 'fs';
import path from 'path';

const GITHUB_USERNAME = 'Jirosann';
const API_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}`;
const OUTPUT_PATH = path.join(process.cwd(), 'content/site/github-contributions.json');

interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0-4
}

interface ContributionWeek {
  days: ContributionDay[];
}

interface APIResponse {
  total: Record<string, number>;
  contributions: ContributionDay[];
}

async function fetchContributions() {
  console.log(`[fetch-github-contributions] Fetching from ${API_URL}...`);

  try {
    const res = await fetch(API_URL, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      throw new Error(`API returned ${res.status}: ${res.statusText}`);
    }

    const data: APIResponse = await res.json();

    const sorted = (data.contributions || []).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const pastDays = sorted.filter((d) => new Date(d.date) <= today);
    
    // Take the last 365 days
    let lastYearDays = pastDays.slice(-365);

    // Calculate accurate total for the last 365 days
    const totalLastYear = lastYearDays.reduce((sum, day) => sum + day.count, 0);

    // Align the first column with Sunday
    const firstDayDate = new Date(lastYearDays[0].date);
    const firstDayOfWeek = firstDayDate.getDay(); // 0 = Sunday
    
    const padding = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      padding.push({ date: '', count: 0, level: 0 });
    }
    
    lastYearDays = [...padding, ...lastYearDays];

    const weeks: ContributionWeek[] = [];
    let currentWeek: ContributionDay[] = [];

    for (const day of lastYearDays) {
      currentWeek.push(day);

      if (currentWeek.length === 7) {
        weeks.push({ days: currentWeek });
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      weeks.push({ days: currentWeek });
    }

    const output = {
      username: GITHUB_USERNAME,
      totalContributions: totalLastYear,
      weeks,
      fetchedAt: new Date().toISOString(),
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
    console.log(
      `[fetch-github-contributions] ✓ Saved ${weeks.length} weeks, ${totalLastYear} total contributions`
    );
  } catch (err) {
    console.error(`[fetch-github-contributions] ✗ Failed:`, err);
    console.log('[fetch-github-contributions] Writing empty fallback...');

    const fallback = {
      username: GITHUB_USERNAME,
      totalContributions: 0,
      weeks: [],
      fetchedAt: new Date().toISOString(),
      error: String(err),
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(fallback, null, 2), 'utf-8');
  }
}

fetchContributions();

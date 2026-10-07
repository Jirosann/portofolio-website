
interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ContributionWeek {
  days: ContributionDay[];
}

export interface GitHubContributions {
  username: string;
  totalContributions: number;
  weeks: ContributionWeek[];
  fetchedAt: string;
  error?: string;
}

export async function getGitHubContributions(): Promise<GitHubContributions> {
  const GITHUB_USERNAME = 'Jirosann';
  const API_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`;

  try {
    const res = await fetch(API_URL, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }

    const data = await res.json();
    
    const sorted = (data.contributions || []).sort(
      (a: ContributionDay, b: ContributionDay) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Use UTC for today's date computation
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const pastDays = sorted.filter((d: ContributionDay) => new Date(d.date) <= todayUTC);
    
    // Take the last 365 days
    let lastYearDays = pastDays.slice(-365);
    const totalLastYear = lastYearDays.reduce((sum: number, day: ContributionDay) => sum + day.count, 0);

    const firstDayDate = new Date(lastYearDays[0].date);
    const firstDayOfWeek = firstDayDate.getUTCDay(); // 0 = Sunday
    
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

    return {
      username: GITHUB_USERNAME,
      totalContributions: totalLastYear,
      weeks,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      username: GITHUB_USERNAME,
      totalContributions: 0,
      weeks: [],
      fetchedAt: new Date().toISOString(),
      error: String(err),
    };
  }
}

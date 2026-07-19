import type { ReviewEvent, ReviewQuality } from "./sr-types";

export interface HistoricalProgress {
  reviewsLast7Days: number;
  reviewsLast30Days: number;
  activeDaysLast30Days: number;
  currentStreak: number;
  longestStreak: number;
  ratingCounts: Record<ReviewQuality, number>;
  dailyCounts: Map<string, number>;
  domainCounts: { algorithms: number; ml: number; sql: number };
}

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + days);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDailyReviewCounts(
  events: ReviewEvent[]
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const event of events) {
    counts.set(event.reviewDate, (counts.get(event.reviewDate) ?? 0) + 1);
  }
  return counts;
}

export function calculateReviewStreaks(
  events: ReviewEvent[],
  today: string
): { current: number; longest: number } {
  const dates = [...new Set(events.map((event) => event.reviewDate))].sort();
  if (dates.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let run = 1;
  for (let index = 1; index < dates.length; index += 1) {
    if (dates[index] === addDays(dates[index - 1], 1)) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  const activeDates = new Set(dates);
  let cursor = activeDates.has(today) ? today : addDays(today, -1);
  if (!activeDates.has(cursor)) return { current: 0, longest };

  let current = 0;
  while (activeDates.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  return { current, longest };
}

export function summarizeHistory(
  events: ReviewEvent[],
  today: string
): HistoricalProgress {
  const recent = events.filter((event) => event.reviewDate <= today);
  const dailyCounts = getDailyReviewCounts(recent);
  const sevenDayStart = addDays(today, -6);
  const thirtyDayStart = addDays(today, -29);
  const streaks = calculateReviewStreaks(recent, today);
  const ratingCounts: Record<ReviewQuality, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
  };
  const domainCounts = { algorithms: 0, ml: 0, sql: 0 };

  for (const event of recent) {
    ratingCounts[event.rating] += 1;
    domainCounts[event.domain] += 1;
  }

  return {
    reviewsLast7Days: recent.filter(
      (event) => event.reviewDate >= sevenDayStart
    ).length,
    reviewsLast30Days: recent.filter(
      (event) => event.reviewDate >= thirtyDayStart
    ).length,
    activeDaysLast30Days: [...dailyCounts.keys()].filter(
      (date) => date >= thirtyDayStart && date <= today
    ).length,
    currentStreak: streaks.current,
    longestStreak: streaks.longest,
    ratingCounts,
    dailyCounts,
    domainCounts,
  };
}

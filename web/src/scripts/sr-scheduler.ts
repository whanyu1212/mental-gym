import type { ReviewRecord, ReviewQuality, ReviewStatus } from "./sr-types";

export function localDateISO(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return localDateISO();
}

export function createNewRecord(
  domain: "algorithms" | "ml",
  slug: string,
  title: string,
  difficulty: string,
  group: string
): ReviewRecord {
  return {
    problemKey: `${domain}:${slug}`,
    domain,
    slug,
    title,
    difficulty,
    group,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    dueDate: todayISO(),
    lastReviewDate: null,
    lastRating: null,
  };
}

export function schedule(
  record: ReviewRecord,
  quality: ReviewQuality
): ReviewRecord {
  let { easeFactor, interval, repetitions } = record;

  if (quality < 2) {
    // Failed recall — reset
    repetitions = 0;
    interval = quality === 0 ? 0 : 1; // Again = same day, Hard = tomorrow
  } else {
    // Successful recall
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 3;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  // SM-2 ease factor update (map 0-3 quality to 0-5 scale)
  const q5 = quality * (5 / 3);
  easeFactor += 0.1 - (5 - q5) * (0.08 + (5 - q5) * 0.02);
  if (easeFactor < 1.3) easeFactor = 1.3;

  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + interval);

  return {
    ...record,
    easeFactor,
    interval,
    repetitions,
    dueDate: localDateISO(due),
    lastReviewDate: localDateISO(today),
    lastRating: quality,
  };
}

export function statusOf(record: ReviewRecord, today?: string): ReviewStatus {
  const t = today ?? todayISO();
  if (record.lastReviewDate === null) return "new";
  if (record.dueDate < t) return "overdue";
  if (record.dueDate === t) return "due";
  return "upcoming";
}

export function daysUntilDue(record: ReviewRecord, today?: string): number {
  const t = today ?? todayISO();
  const due = new Date(record.dueDate + "T00:00:00");
  const now = new Date(t + "T00:00:00");
  return Math.round((due.getTime() - now.getTime()) / 86_400_000);
}

export const QUALITY_LABELS: Record<ReviewQuality, string> = {
  0: "Again",
  1: "Hard",
  2: "Good",
  3: "Easy",
};

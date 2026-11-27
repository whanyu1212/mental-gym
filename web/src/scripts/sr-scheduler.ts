import type { ReviewDomain, ReviewRecord, ReviewQuality, ReviewStatus } from "./sr-types";

const MS_PER_DAY = 86_400_000;

export interface ScheduleOptions {
  now?: Date;
  random?: () => number;
  fuzz?: boolean;
}

export interface DailySession {
  session: ReviewRecord[];
  backlogCount: number;
}

export function localDateISO(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return localDateISO();
}

export function parseISODateParts(iso: string): [number, number, number] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    throw new Error(`Invalid ISO date: ${iso}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new Error(`Invalid ISO date: ${iso}`);
  }
  return [year, month, day];
}

/** Add calendar days in local time without DST-hour drift. */
export function addDaysISO(isoDate: string, days: number): string {
  const [year, month, day] = parseISODateParts(isoDate);
  return localDateISO(new Date(year, month - 1, day + days));
}

/** Return signed calendar day difference (`toISO - fromISO`) using UTC midnight. */
export function diffDaysISO(fromISO: string, toISO: string): number {
  const [fy, fm, fd] = parseISODateParts(fromISO);
  const [ty, tm, td] = parseISODateParts(toISO);
  const fromUTC = Date.UTC(fy, fm - 1, fd);
  const toUTC = Date.UTC(ty, tm - 1, td);
  return Math.round((toUTC - fromUTC) / MS_PER_DAY);
}

export function createNewRecord(
  domain: ReviewDomain,
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
    lapses: 0,
  };
}

/** Jitter intervals >= 4 days by +/-15% (at least +/-1 day) to prevent review spikes. */
export function fuzzInterval(
  interval: number,
  random: () => number = Math.random,
  minInterval = 2
): number {
  if (interval < 4) return interval;
  const delta = Math.max(1, Math.round(interval * 0.15));
  const raw = random();
  const safeRandom = Number.isFinite(raw) ? raw : 0.5;
  const clampedRandom = Math.min(Math.max(safeRandom, 0), 1 - Number.EPSILON);
  const offset = Math.floor(clampedRandom * (2 * delta + 1)) - delta;
  return Math.max(minInterval, interval + offset);
}

export function schedule(
  record: ReviewRecord,
  quality: ReviewQuality,
  options: ScheduleOptions = {}
): ReviewRecord {
  const todayStr = localDateISO(options.now ?? new Date());
  const overdueDays =
    record.lastReviewDate !== null
      ? Math.max(0, diffDaysISO(record.dueDate, todayStr))
      : 0;

  let { easeFactor, interval, repetitions } = record;
  let lapses = record.lapses ?? 0;
  let minFuzzedInterval = 2;

  if (quality === 0) {
    // Again: reset streak, increment lapses, re-queue same day without fuzz
    repetitions = 0;
    lapses += 1;
    interval = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (quality === 1) {
    // Hard: keep existing streak on established cards and step interval gently
    if (repetitions === 0) {
      repetitions = 1;
      interval = 1;
    } else {
      const base = interval + Math.floor(overdueDays / 4);
      minFuzzedInterval = Math.max(2, interval);
      interval = Math.max(1, Math.round(base * 1.2));
    }
    easeFactor = Math.max(1.3, easeFactor - 0.15);
  } else if (quality === 2) {
    // Good: standard ladder, crediting half of any overdue survival window
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2 && interval <= 1) {
      interval = 3;
    } else {
      minFuzzedInterval = interval + 1;
      const effective = interval + Math.floor(overdueDays / 2);
      interval = Math.max(minFuzzedInterval, Math.round(effective * easeFactor));
    }
  } else {
    // Easy: jump past rep-1 tomorrow and credit full overdue survival window
    repetitions += 1;
    if (repetitions === 1) {
      interval = 4;
    } else if (repetitions === 2 && interval <= 4) {
      interval = 6;
    } else {
      minFuzzedInterval = interval + 2;
      const effective = interval + overdueDays;
      interval = Math.max(
        minFuzzedInterval,
        Math.round(effective * easeFactor * 1.3)
      );
    }
    easeFactor = Math.max(1.3, easeFactor + 0.15);
  }

  easeFactor = Math.round(easeFactor * 100) / 100;

  if (options.fuzz !== false && quality !== 0) {
    interval = fuzzInterval(interval, options.random, minFuzzedInterval);
  }

  return {
    ...record,
    easeFactor,
    interval,
    repetitions,
    dueDate: addDaysISO(todayStr, interval),
    lastReviewDate: todayStr,
    lastRating: quality,
    lapses,
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
  return diffDaysISO(t, record.dueDate);
}

/** Order due cards with fragile shortest-interval items first, then higher lapses and older due dates. */
export function sortReviewQueue(records: ReviewRecord[]): ReviewRecord[] {
  return [...records].sort(
    (a, b) =>
      a.interval - b.interval ||
      (b.lapses ?? 0) - (a.lapses ?? 0) ||
      a.dueDate.localeCompare(b.dueDate) ||
      a.title.localeCompare(b.title)
  );
}

/** Select up to `cap` reviewed due/overdue cards for today's session and report remaining backlog. */
export function selectDailySession(
  records: ReviewRecord[],
  options: { today?: string; cap?: number } = {}
): DailySession {
  const t = options.today ?? todayISO();
  const rawCap = options.cap ?? 6;
  const cap = Number.isFinite(rawCap) ? Math.max(0, Math.floor(rawCap)) : 6;
  const due = sortReviewQueue(
    records.filter((r) => r.lastReviewDate !== null && r.dueDate <= t)
  );
  const session = due.slice(0, cap);
  return {
    session,
    backlogCount: due.length - session.length,
  };
}

/** Redistribute overdue cards across `days` starting today without altering interval or ease history. */
export function spreadOverdue(
  records: ReviewRecord[],
  options: { today?: string; days?: number } = {}
): ReviewRecord[] {
  const t = options.today ?? todayISO();
  const rawDays = options.days ?? 5;
  const span = Number.isFinite(rawDays) ? Math.max(1, Math.floor(rawDays)) : 5;
  const overdue = sortReviewQueue(
    records.filter((r) => r.lastReviewDate !== null && r.dueDate < t)
  );
  if (overdue.length === 0) return [];
  return overdue.map((record, index) => ({
    ...record,
    dueDate: addDaysISO(t, Math.floor((index * span) / overdue.length)),
  }));
}

export function withPersonalNote(
  record: ReviewRecord,
  rawNote: string
): ReviewRecord {
  const trimmed = rawNote.trim();
  if (trimmed.length > 0) {
    return { ...record, note: trimmed };
  }
  const { note: _omitted, ...rest } = record;
  return rest;
}

export function isWeakSpot(record: ReviewRecord, threshold = 2): boolean {
  return (record.lapses ?? 0) >= threshold;
}

export const QUALITY_LABELS: Record<ReviewQuality, string> = {
  0: "Again",
  1: "Hard",
  2: "Good",
  3: "Easy",
};

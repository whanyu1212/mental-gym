import {
  schedule,
  selectDailySession,
  todayISO,
} from "./sr-scheduler.ts";
import type { ReviewQuality, ReviewRecord } from "./sr-types";

export const DEFAULT_DAILY_CAP = 6;
export const EXTRA_BATCH_SIZE = 5;
export const OVERDUE_SPREAD_THRESHOLD = 15;
export const OVERDUE_SPREAD_DAYS = 5;

export interface ReviewSessionState {
  queue: ReviewRecord[];
  requeuedKeys: string[];
  dismissedKeys: string[];
  completedCount: number;
  againCount: number;
  initialBatchSize: number;
  backlogCount: number;
  overdueCount: number;
}

export function countOverdue(records: ReviewRecord[], today = todayISO()): number {
  return records.filter(
    (r) => r.lastReviewDate !== null && r.dueDate < today
  ).length;
}

export function createReviewSession(
  allRecords: ReviewRecord[],
  options: { today?: string; cap?: number; excludeKeys?: readonly string[] } = {}
): ReviewSessionState {
  const today = options.today ?? todayISO();
  const cap = options.cap ?? DEFAULT_DAILY_CAP;
  const excluded = new Set(options.excludeKeys ?? []);
  const eligible =
    excluded.size > 0
      ? allRecords.filter((r) => !excluded.has(r.problemKey))
      : allRecords;

  const { session, backlogCount } = selectDailySession(eligible, {
    today,
    cap,
  });

  return {
    queue: session,
    requeuedKeys: [],
    dismissedKeys: [...excluded],
    completedCount: 0,
    againCount: 0,
    initialBatchSize: session.length,
    backlogCount,
    overdueCount: countOverdue(allRecords, today),
  };
}

export function advanceSession(
  state: ReviewSessionState,
  updatedRecord: ReviewRecord,
  quality: ReviewQuality
): ReviewSessionState {
  if (state.queue.length === 0) return state;

  const [, ...rest] = state.queue;
  const alreadyRequeued = state.requeuedKeys.includes(updatedRecord.problemKey);

  if (quality === 0 && !alreadyRequeued) {
    return {
      ...state,
      queue: [...rest, updatedRecord],
      requeuedKeys: [...state.requeuedKeys, updatedRecord.problemKey],
      againCount: state.againCount + 1,
    };
  }

  return {
    ...state,
    queue: rest,
    dismissedKeys:
      quality === 0 && !state.dismissedKeys.includes(updatedRecord.problemKey)
        ? [...state.dismissedKeys, updatedRecord.problemKey]
        : state.dismissedKeys,
    completedCount: state.completedCount + 1,
    againCount: quality === 0 ? state.againCount + 1 : state.againCount,
  };
}

export function shouldOfferOverdueSpread(
  overdueCount: number,
  threshold = OVERDUE_SPREAD_THRESHOLD
): boolean {
  return overdueCount > threshold;
}

export function formatIntervalPreview(
  record: ReviewRecord,
  quality: ReviewQuality,
  now?: Date
): string {
  const { interval } = schedule(record, quality, { now, fuzz: false });
  if (interval === 0) return "Today";
  if (interval === 1) return "1d";
  return `${interval}d`;
}

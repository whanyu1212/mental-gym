import { deleteRecord, getRecord, putRecord } from "./sr-db.ts";
import {
  createNewRecord,
  daysUntilDue,
  isWeakSpot,
  statusOf,
  withPersonalNote,
} from "./sr-scheduler.ts";
import type {
  ReviewDomain,
  ReviewRecord,
  ReviewStatus,
} from "./sr-types";

export interface RecordSeed {
  domain: ReviewDomain;
  slug: string;
  title: string;
  difficulty: string;
  group: string;
}

export interface CardSRStatus {
  text: string;
  kind: ReviewStatus;
  weakSpot: boolean;
}

/** Persist a personal "My Trap" note without leaving empty unreviewed records behind. */
export async function savePersonalNote(
  seed: RecordSeed,
  rawNote: string
): Promise<ReviewRecord> {
  const key = `${seed.domain}:${seed.slug}`;
  const existing = await getRecord(key);
  const trimmed = rawNote.trim();

  if (trimmed.length === 0 && (!existing || existing.lastReviewDate === null)) {
    if (existing) {
      await deleteRecord(key);
    }
    return createNewRecord(
      seed.domain,
      seed.slug,
      seed.title,
      seed.difficulty,
      seed.group
    );
  }

  const base =
    existing ??
    createNewRecord(
      seed.domain,
      seed.slug,
      seed.title,
      seed.difficulty,
      seed.group
    );
  const updated = withPersonalNote(base, rawNote);
  await putRecord(updated);
  return updated;
}

/** Format a compact status badge and weak-spot flag for a quick-review card. */
export function formatCardStatus(
  record: ReviewRecord | undefined,
  today?: string
): CardSRStatus {
  if (!record || record.lastReviewDate === null) {
    return { text: "", kind: "new", weakSpot: false };
  }

  const kind = statusOf(record, today);
  const days = daysUntilDue(record, today);
  let text: string;
  if (kind === "overdue") {
    text = `${Math.abs(days)}d overdue`;
  } else if (kind === "due") {
    text = "Due today";
  } else {
    text = record.repetitions > 0 ? `${record.repetitions}× · ${days}d` : `in ${days}d`;
  }

  return {
    text,
    kind,
    weakSpot: isWeakSpot(record),
  };
}

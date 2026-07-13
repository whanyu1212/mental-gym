import type {
  NormalizedSRExport,
  ReviewEvent,
  ReviewRecord,
  SRExport,
  SRExportV2,
} from "./sr-types";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isReviewRecord(value: unknown): value is ReviewRecord {
  return (
    isObject(value) &&
    typeof value.problemKey === "string" &&
    (value.domain === "algorithms" || value.domain === "ml") &&
    typeof value.slug === "string" &&
    typeof value.title === "string" &&
    typeof value.difficulty === "string" &&
    typeof value.group === "string" &&
    typeof value.easeFactor === "number" &&
    typeof value.interval === "number" &&
    typeof value.repetitions === "number" &&
    typeof value.dueDate === "string" &&
    (value.lastReviewDate === null || typeof value.lastReviewDate === "string") &&
    (value.lastRating === null ||
      value.lastRating === 0 ||
      value.lastRating === 1 ||
      value.lastRating === 2 ||
      value.lastRating === 3)
  );
}

function isReviewEvent(value: unknown): value is ReviewEvent {
  return (
    isObject(value) &&
    (value.id === undefined || typeof value.id === "number") &&
    typeof value.reviewedAt === "string" &&
    typeof value.reviewDate === "string" &&
    typeof value.problemKey === "string" &&
    (value.domain === "algorithms" || value.domain === "ml") &&
    typeof value.group === "string" &&
    (value.rating === 0 ||
      value.rating === 1 ||
      value.rating === 2 ||
      value.rating === 3) &&
    typeof value.interval === "number"
  );
}

export function normalizeExport(data: unknown): NormalizedSRExport {
  if (!isObject(data) || !Array.isArray(data.records)) {
    throw new Error("Invalid review-data export");
  }

  if (!data.records.every(isReviewRecord)) {
    throw new Error("Export contains invalid review records");
  }

  if (data.version === 1) {
    return { records: data.records, events: [] };
  }

  if (data.version === 2 && Array.isArray(data.events)) {
    if (!data.events.every(isReviewEvent)) {
      throw new Error("Export contains invalid review events");
    }
    return { records: data.records, events: data.events };
  }

  throw new Error("Unsupported review-data export version");
}

export function parseExport(json: string): NormalizedSRExport {
  return normalizeExport(JSON.parse(json));
}

export function serializeExport(
  records: ReviewRecord[],
  events: ReviewEvent[],
  exportedAt = new Date().toISOString()
): string {
  const data: SRExportV2 = {
    version: 2,
    exportedAt,
    records,
    events,
  };
  return JSON.stringify(data satisfies SRExport, null, 2);
}

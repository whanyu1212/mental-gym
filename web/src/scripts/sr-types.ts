export type ReviewQuality = 0 | 1 | 2 | 3; // Again, Hard, Good, Easy
export type ReviewStatus = "overdue" | "due" | "upcoming" | "new";
export type ReviewDomain = "algorithms" | "ml" | "sql";

export interface ReviewRecord {
  problemKey: string; // "algorithms:1-two-sum" or "ml:logistic-regression"
  domain: ReviewDomain;
  slug: string;
  title: string;
  difficulty: string;
  group: string;

  // SM-2 fields
  easeFactor: number; // starts 2.5, min 1.3
  interval: number; // days until next review
  repetitions: number; // consecutive correct recalls
  dueDate: string; // local "YYYY-MM-DD"
  lastReviewDate: string | null;
  lastRating: ReviewQuality | null;
}

export interface ReviewEvent {
  id?: number;
  reviewedAt: string;
  reviewDate: string; // local "YYYY-MM-DD"
  problemKey: string;
  domain: ReviewDomain;
  group: string;
  rating: ReviewQuality;
  interval: number;
}

export interface SRExportV1 {
  version: 1;
  exportedAt: string;
  records: ReviewRecord[];
}

export interface SRExportV2 {
  version: 2;
  exportedAt: string;
  records: ReviewRecord[];
  events: ReviewEvent[];
}

export type SRExport = SRExportV1 | SRExportV2;

export interface NormalizedSRExport {
  records: ReviewRecord[];
  events: ReviewEvent[];
}

export interface ImportResult {
  recordCount: number;
  eventCount: number;
}

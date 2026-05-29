export type ReviewQuality = 0 | 1 | 2 | 3; // Again, Hard, Good, Easy
export type ReviewStatus = "overdue" | "due" | "upcoming" | "new";

export interface ReviewRecord {
  problemKey: string; // "algorithms:1-two-sum" or "ml:logistic-regression"
  domain: "algorithms" | "ml";
  slug: string;
  title: string;
  difficulty: string;
  group: string;

  // SM-2 fields
  easeFactor: number; // starts 2.5, min 1.3
  interval: number; // days until next review
  repetitions: number; // consecutive correct recalls
  dueDate: string; // "YYYY-MM-DD"
  lastReviewDate: string | null;
  lastRating: ReviewQuality | null;
}

export interface SRExport {
  version: 1;
  exportedAt: string;
  records: ReviewRecord[];
}

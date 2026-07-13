import type { ReviewRecord } from "./sr-types";

export interface ProgressBreakdown {
  reviewed: number;
  learning: number;
  established: number;
  due: number;
  overdue: number;
}

export interface ProgressGroup extends ProgressBreakdown {
  name: string;
}

export interface ProgressStats extends ProgressBreakdown {
  domains: ProgressGroup[];
  topics: ProgressGroup[];
  dueRecords: ReviewRecord[];
}

export function isEstablished(record: ReviewRecord): boolean {
  return record.repetitions >= 3 && record.interval >= 7;
}

function summarize(records: ReviewRecord[], today: string): ProgressBreakdown {
  const reviewed = records.filter((record) => record.lastReviewDate !== null);
  const established = reviewed.filter(isEstablished).length;

  return {
    reviewed: reviewed.length,
    learning: reviewed.length - established,
    established,
    due: reviewed.filter((record) => record.dueDate === today).length,
    overdue: reviewed.filter((record) => record.dueDate < today).length,
  };
}

function groupRecords(
  records: ReviewRecord[],
  today: string,
  keyOf: (record: ReviewRecord) => string
): ProgressGroup[] {
  const groups = new Map<string, ReviewRecord[]>();

  for (const record of records) {
    const key = keyOf(record);
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }

  return [...groups.entries()]
    .map(([name, group]) => ({ name, ...summarize(group, today) }))
    .sort(
      (a, b) =>
        b.overdue - a.overdue ||
        b.due - a.due ||
        b.reviewed - a.reviewed ||
        a.name.localeCompare(b.name)
    );
}

export function summarizeProgress(
  records: ReviewRecord[],
  today: string
): ProgressStats {
  const reviewed = records.filter((record) => record.lastReviewDate !== null);
  const dueRecords = reviewed
    .filter((record) => record.dueDate <= today)
    .sort(
      (a, b) =>
        a.dueDate.localeCompare(b.dueDate) ||
        a.title.localeCompare(b.title)
    );

  return {
    ...summarize(records, today),
    domains: groupRecords(reviewed, today, (record) =>
      record.domain === "algorithms" ? "Algorithms" : "Machine Learning"
    ),
    topics: groupRecords(reviewed, today, (record) => record.group),
    dueRecords,
  };
}

import type {
  AttemptDifficultyArea,
  AttemptEvent,
  AttemptOutcome,
  AttemptSupport,
} from "./attempt-types";

export interface AttemptGroup {
  name: string;
  attempts: number;
  unaidedSolves: number;
}

export interface AttemptStats {
  attemptsLast7Days: number;
  attemptsLast30Days: number;
  uniqueProblemsAttempted: number;
  unaidedSolveRate: number;
  averageDurationSeconds: number;
  outcomeCounts: Record<AttemptOutcome, number>;
  supportCounts: Record<AttemptSupport, number>;
  difficultyAreaCounts: Record<AttemptDifficultyArea, number>;
  groups: AttemptGroup[];
  recentAttempts: AttemptEvent[];
}

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + days);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isUnaidedSolve(attempt: AttemptEvent): boolean {
  return attempt.outcome === "solved" && attempt.supportUsed === "none";
}

export function summarizeAttempts(
  attempts: AttemptEvent[],
  today: string
): AttemptStats {
  const completed = attempts.filter((attempt) => attempt.attemptDate <= today);
  const outcomeCounts: Record<AttemptOutcome, number> = {
    solved: 0,
    partial: 0,
    stuck: 0,
  };
  const supportCounts: Record<AttemptSupport, number> = {
    none: 0,
    signal: 0,
    guide: 0,
    solution: 0,
  };
  const difficultyAreaCounts: Record<AttemptDifficultyArea, number> = {
    pattern: 0,
    reasoning: 0,
    implementation: 0,
    complexity: 0,
    "edge-cases": 0,
    none: 0,
  };
  const grouped = new Map<string, AttemptEvent[]>();

  for (const attempt of completed) {
    outcomeCounts[attempt.outcome] += 1;
    supportCounts[attempt.supportUsed] += 1;
    difficultyAreaCounts[attempt.difficultyArea] += 1;
    const group = grouped.get(attempt.group) ?? [];
    group.push(attempt);
    grouped.set(attempt.group, group);
  }

  const unaidedSolves = completed.filter(isUnaidedSolve).length;
  const averageDurationSeconds = completed.length === 0
    ? 0
    : Math.round(
      completed.reduce((total, attempt) => total + attempt.durationSeconds, 0) /
        completed.length
    );

  return {
    attemptsLast7Days: completed.filter(
      (attempt) => attempt.attemptDate >= addDays(today, -6)
    ).length,
    attemptsLast30Days: completed.filter(
      (attempt) => attempt.attemptDate >= addDays(today, -29)
    ).length,
    uniqueProblemsAttempted: new Set(completed.map((attempt) => attempt.problemKey)).size,
    unaidedSolveRate: completed.length === 0 ? 0 : unaidedSolves / completed.length,
    averageDurationSeconds,
    outcomeCounts,
    supportCounts,
    difficultyAreaCounts,
    groups: [...grouped.entries()]
      .map(([name, group]) => ({
        name,
        attempts: group.length,
        unaidedSolves: group.filter(isUnaidedSolve).length,
      }))
      .sort(
        (a, b) =>
          b.attempts - a.attempts ||
          b.unaidedSolves - a.unaidedSolves ||
          a.name.localeCompare(b.name)
      ),
    recentAttempts: [...completed]
      .sort((a, b) => b.attemptedAt.localeCompare(a.attemptedAt))
      .slice(0, 6),
  };
}
